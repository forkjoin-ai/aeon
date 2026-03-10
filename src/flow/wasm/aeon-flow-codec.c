/**
 * Aeon Flow Codec — WASM Implementation
 *
 * Standalone WASM binary encoder/decoder for FlowFrames.
 * Builds with clang --target=wasm32-unknown-unknown (no Emscripten).
 * ~2KB output. Runs on CF Workers, Cloud Run, Node/Bun, browsers.
 *
 * Wire format (10 bytes header):
 *   [0..1]  stream_id  u16 big-endian
 *   [2..5]  sequence   u32 big-endian
 *   [6]     flags      u8
 *   [7..9]  length     u24 big-endian
 *
 * Build: open-source/aeon/src/flow/wasm/build.sh
 */

typedef unsigned char uint8_t;
typedef unsigned short uint16_t;
typedef unsigned int uint32_t;

#define HEADER_SIZE 10
#define MAX_PAYLOAD ((1 << 24) - 1)

/* ═══════════════════════════════════════════════════════════════════════════
 * Arena allocator (bump allocator, no malloc/free)
 * Same pattern as aether/src/wasm-simd/simd-kernels-standalone.c
 * ═══════════════════════════════════════════════════════════════════════════ */

static uint8_t __attribute__((aligned(16))) heap[16 * 1024 * 1024]; /* 16 MB */
static uint32_t heap_ptr = 0;

__attribute__((export_name("allocate")))
uint32_t allocate(uint32_t size) {
    /* Align to 16 bytes */
    uint32_t aligned = (heap_ptr + 15) & ~15u;
    if (aligned + size > sizeof(heap)) return 0;
    heap_ptr = aligned + size;
    return (uint32_t)(heap + aligned);
}

__attribute__((export_name("resetHeap")))
void resetHeap(void) {
    heap_ptr = 0;
}

__attribute__((export_name("getHeapPtr")))
uint32_t getHeapPtr(void) {
    return heap_ptr;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Encode: write header + payload into buffer
 * Returns total bytes written (HEADER_SIZE + payload_length)
 * ═══════════════════════════════════════════════════════════════════════════ */

__attribute__((export_name("encode_frame")))
uint32_t encode_frame(
    uint8_t* buf,
    uint16_t stream_id,
    uint32_t sequence,
    uint8_t flags,
    uint32_t payload_length,
    uint8_t* payload
) {
    if (payload_length > MAX_PAYLOAD) return 0;

    /* stream_id: u16 big-endian */
    buf[0] = (uint8_t)(stream_id >> 8);
    buf[1] = (uint8_t)(stream_id & 0xFF);

    /* sequence: u32 big-endian */
    buf[2] = (uint8_t)(sequence >> 24);
    buf[3] = (uint8_t)(sequence >> 16);
    buf[4] = (uint8_t)(sequence >> 8);
    buf[5] = (uint8_t)(sequence & 0xFF);

    /* flags: u8 */
    buf[6] = flags;

    /* length: u24 big-endian */
    buf[7] = (uint8_t)(payload_length >> 16);
    buf[8] = (uint8_t)(payload_length >> 8);
    buf[9] = (uint8_t)(payload_length & 0xFF);

    /* Copy payload */
    for (uint32_t i = 0; i < payload_length; i++) {
        buf[HEADER_SIZE + i] = payload[i];
    }

    return HEADER_SIZE + payload_length;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Decode: parse header from buffer
 * Writes parsed fields to out_* pointers, returns payload offset (HEADER_SIZE)
 * ═══════════════════════════════════════════════════════════════════════════ */

__attribute__((export_name("decode_frame")))
uint32_t decode_frame(
    uint8_t* buf,
    uint16_t* out_stream_id,
    uint32_t* out_sequence,
    uint8_t* out_flags,
    uint32_t* out_length
) {
    *out_stream_id = (uint16_t)((buf[0] << 8) | buf[1]);

    *out_sequence = ((uint32_t)buf[2] << 24) |
                    ((uint32_t)buf[3] << 16) |
                    ((uint32_t)buf[4] << 8) |
                    (uint32_t)buf[5];

    *out_flags = buf[6];

    *out_length = ((uint32_t)buf[7] << 16) |
                  ((uint32_t)buf[8] << 8) |
                  (uint32_t)buf[9];

    return HEADER_SIZE;
}
