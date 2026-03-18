/*
wall — curl for Aeon Flow Protocol

Named after Wally Wallington, whose rotational techniques inspired the
Aeon Flow Protocol. Where curl curls, wall rotates.

A command-line tool that speaks native Aeon Flow binary to servers,
with full support for fork/race/collapse/poison semantics.
Supports both TCP and UDP transports.

Usage:

	wall aeon://localhost:4001/api/users
	wall --udp aeon://localhost:4001/api/users
	wall --fork aeon://localhost:4001/index.html /css/app.css /js/app.js /img/hero.png
	wall --race aeon://cache:4001/data aeon://origin:4001/data
	wall --http http://localhost:8080/api/users
	wall --compare aeon://localhost:4001/api/users http://localhost:8080/api/users

Modes:

	Single request:   wall aeon://host:port/path
	Fork (parallel):  wall --fork aeon://host:port/root /path1 /path2 ...
	Race:             wall --race aeon://host1/path aeon://host2/path
	HTTP fallback:    wall --http http://host/path
	Compare:          wall --compare aeon://host/path http://host/path

Transport:

	--udp   Use UDP datagrams instead of TCP. Each frame is one datagram.
	        The 10-byte header contains stream_id + sequence, so frames
	        can arrive out of order and be reassembled. Ideal for
	        latency-sensitive workloads where retransmission is wasteful.

Output:

	By default, prints the response body to stdout (like curl).
	Use -v for verbose output with frame-by-frame timing.
	Use --waterfall for a visual waterfall diagram.
	Use --json for machine-readable JSON output.
*/
package main

import (
	"encoding/binary"
	"flag"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strings"
	"sync"
	"time"
)

// ═══════════════════════════════════════════════════════════════════════════════
// Aeon Flow Protocol Constants and Types
// ═══════════════════════════════════════════════════════════════════════════════

const (
	HeaderSize   = 10
	MaxPayload   = 0xFFFFFF
	MaxDatagram  = 65536
	UDPBufBytes  = 4 * 1024 * 1024
	FlagFork     = 0x01
	FlagRace     = 0x02
	FlagCollapse = 0x04
	FlagPoison   = 0x08
	FlagFIN      = 0x10
)

// Frame is a single Aeon Flow protocol frame.
type Frame struct {
	StreamID uint16
	Sequence uint32
	Flags    uint8
	Length   uint32
	Payload  []byte
}

// FrameEvent records a frame with timing information.
type FrameEvent struct {
	Frame     Frame
	Time      time.Time
	Elapsed   time.Duration
	Direction string // "send" or "recv"
}

type headerList []string

func (h *headerList) String() string {
	return strings.Join(*h, ", ")
}

func (h *headerList) Set(value string) error {
	*h = append(*h, value)
	return nil
}

type propagatedAuthOptions struct {
	verified      bool
	source        string
	actor         string
	audience      string
	tier          string
	flags         string
	requestPID    string
	supervisorPID string
}

// ═══════════════════════════════════════════════════════════════════════════════
// Codec
// ═══════════════════════════════════════════════════════════════════════════════

// EncodeFrame encodes a frame into a byte slice.
func EncodeFrame(f Frame) []byte {
	buf := make([]byte, HeaderSize+int(f.Length))
	binary.BigEndian.PutUint16(buf[0:2], f.StreamID)
	binary.BigEndian.PutUint32(buf[2:6], f.Sequence)
	buf[6] = f.Flags
	buf[7] = byte((f.Length >> 16) & 0xFF)
	buf[8] = byte((f.Length >> 8) & 0xFF)
	buf[9] = byte(f.Length & 0xFF)
	if f.Length > 0 && f.Payload != nil {
		copy(buf[HeaderSize:], f.Payload)
	}
	return buf
}

// DecodeFrame decodes a frame from a byte slice.
// Returns the frame and the number of bytes consumed.
func DecodeFrame(buf []byte) (Frame, int, error) {
	if len(buf) < HeaderSize {
		return Frame{}, 0, fmt.Errorf("buffer too short for header: %d < %d", len(buf), HeaderSize)
	}

	var f Frame
	f.StreamID = binary.BigEndian.Uint16(buf[0:2])
	f.Sequence = binary.BigEndian.Uint32(buf[2:6])
	f.Flags = buf[6]
	f.Length = uint32(buf[7])<<16 | uint32(buf[8])<<8 | uint32(buf[9])

	total := HeaderSize + int(f.Length)
	if len(buf) < total {
		return Frame{}, 0, fmt.Errorf("buffer too short for payload: %d < %d", len(buf), total)
	}

	if f.Length > 0 {
		f.Payload = buf[HeaderSize:total]
	}

	return f, total, nil
}

// ═══════════════════════════════════════════════════════════════════════════════
// Connection
// ═══════════════════════════════════════════════════════════════════════════════

// AeonConn wraps a TCP or UDP connection to an Aeon Flow server.
type AeonConn struct {
	conn         net.Conn
	udp          bool
	nextStreamID uint16
	events       []FrameEvent
	startTime    time.Time
	verbose      bool
	recordEvents bool
	recvBuf      []byte
	sendBuf      []byte
}

// Dial connects to an Aeon Flow server over TCP.
func Dial(addr string) (*AeonConn, error) {
	conn, err := net.DialTimeout("tcp", addr, 5*time.Second)
	if err != nil {
		return nil, fmt.Errorf("connect %s: %w", addr, err)
	}
	return &AeonConn{
		conn:         conn,
		nextStreamID: 0,
		startTime:    time.Now(),
		recordEvents: true,
	}, nil
}

// DialUDP connects to an Aeon Flow server over UDP.
// Each frame is sent as a single UDP datagram.
// The 10-byte header's stream_id + sequence fields enable
// out-of-order reassembly without TCP's head-of-line blocking.
func DialUDP(addr string) (*AeonConn, error) {
	udpAddr, err := net.ResolveUDPAddr("udp", addr)
	if err != nil {
		return nil, fmt.Errorf("resolve %s: %w", addr, err)
	}
	conn, err := net.DialUDP("udp", nil, udpAddr)
	if err != nil {
		return nil, fmt.Errorf("connect udp %s: %w", addr, err)
	}
	if err := conn.SetReadBuffer(UDPBufBytes); err != nil {
		_ = conn.Close()
		return nil, fmt.Errorf("set udp read buffer: %w", err)
	}
	if err := conn.SetWriteBuffer(UDPBufBytes); err != nil {
		_ = conn.Close()
		return nil, fmt.Errorf("set udp write buffer: %w", err)
	}
	return &AeonConn{
		conn:         conn,
		udp:          true,
		nextStreamID: 0,
		startTime:    time.Now(),
		recordEvents: true,
		recvBuf:      make([]byte, MaxDatagram),
	}, nil
}

func appendFramePayload(dst []byte, f Frame) []byte {
	if f.Flags&FlagFork != 0 || f.Length == 0 {
		return dst
	}
	return append(dst, f.Payload...)
}

func cloneHeaders(src map[string]string) map[string]string {
	if len(src) == 0 {
		return map[string]string{}
	}

	dst := make(map[string]string, len(src))
	for key, value := range src {
		dst[key] = value
	}
	return dst
}

func parseHeaders(values []string) map[string]string {
	headers := make(map[string]string, len(values))
	for _, value := range values {
		parts := strings.SplitN(value, ":", 2)
		if len(parts) != 2 {
			continue
		}
		headers[strings.TrimSpace(parts[0])] = strings.TrimSpace(parts[1])
	}
	return headers
}

func applyPropagatedAuthHeaders(headers map[string]string, options propagatedAuthOptions) map[string]string {
	hasSnapshot :=
		options.verified ||
			options.source != "" ||
			options.actor != "" ||
			options.audience != "" ||
			options.tier != "" ||
			options.flags != "" ||
			options.requestPID != "" ||
			options.supervisorPID != ""
	if !hasSnapshot {
		return headers
	}

	result := cloneHeaders(headers)
	result["X-Aeon-Auth-Verified"] = "1"
	if options.source != "" {
		result["X-Aeon-Auth-Source"] = options.source
	} else {
		result["X-Aeon-Auth-Source"] = "propagated"
	}
	if options.actor != "" {
		result["X-Aeon-Actor"] = options.actor
	}
	if options.audience != "" {
		result["X-Aeon-Audience"] = options.audience
	}
	if options.tier != "" {
		result["X-Aeon-Tier"] = options.tier
	}
	if options.flags != "" {
		result["X-Aeon-Flags"] = options.flags
	}
	if options.requestPID != "" {
		result["X-Aeon-Request-Pid"] = options.requestPID
	}
	if options.supervisorPID != "" {
		result["X-Aeon-Supervisor-Pid"] = options.supervisorPID
	} else if options.requestPID != "" {
		result["X-Aeon-Supervisor-Pid"] = options.requestPID
	}

	return result
}

func requestPath(u *url.URL) string {
	path := u.EscapedPath()
	if path == "" {
		path = "/"
	}
	if u.RawQuery != "" {
		path += "?" + u.RawQuery
	}
	return path
}

func buildRequestPayload(method, path string, headers map[string]string) []byte {
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("%s %s HTTP/1.1\r\n", method, path))
	for k, v := range headers {
		sb.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	sb.WriteString("\r\n")
	return []byte(sb.String())
}

func benchmarkAeonPayload(path string, headers map[string]string, rawPath bool) []byte {
	if rawPath {
		return []byte(path)
	}
	return buildRequestPayload("GET", path, headers)
}

// Close closes the connection.
func (c *AeonConn) Close() error {
	return c.conn.Close()
}

// AllocStream allocates the next stream ID (even = client-initiated).
func (c *AeonConn) AllocStream() uint16 {
	id := c.nextStreamID
	c.nextStreamID += 2
	return id
}

// Send sends a frame on the connection.
func (c *AeonConn) Send(f Frame) error {
	frameLen := HeaderSize + int(f.Length)
	if cap(c.sendBuf) < frameLen {
		c.sendBuf = make([]byte, frameLen)
	}
	buf := c.sendBuf[:frameLen]
	binary.BigEndian.PutUint16(buf[0:2], f.StreamID)
	binary.BigEndian.PutUint32(buf[2:6], f.Sequence)
	buf[6] = f.Flags
	buf[7] = byte((f.Length >> 16) & 0xFF)
	buf[8] = byte((f.Length >> 8) & 0xFF)
	buf[9] = byte(f.Length & 0xFF)
	if f.Length > 0 && f.Payload != nil {
		copy(buf[HeaderSize:], f.Payload)
	}
	_, err := c.conn.Write(buf)
	if err != nil {
		return err
	}

	if c.recordEvents {
		c.events = append(c.events, FrameEvent{
			Frame:     f,
			Time:      time.Now(),
			Elapsed:   time.Since(c.startTime),
			Direction: "send",
		})
	}

	if c.verbose {
		fmt.Fprintf(os.Stderr, "> stream=%d seq=%d flags=0x%02x len=%d (%s)\n",
			f.StreamID, f.Sequence, f.Flags, f.Length, flagNames(f.Flags))
	}

	return nil
}

// Recv reads the next frame from the connection.
func (c *AeonConn) Recv() (Frame, error) {
	if c.udp {
		if len(c.recvBuf) == 0 {
			c.recvBuf = make([]byte, MaxDatagram)
		}
		n, err := c.conn.Read(c.recvBuf)
		if err != nil {
			return Frame{}, err
		}

		f, _, err := DecodeFrame(c.recvBuf[:n])
		if err != nil {
			return Frame{}, err
		}

		if c.recordEvents {
			c.events = append(c.events, FrameEvent{
				Frame:     f,
				Time:      time.Now(),
				Elapsed:   time.Since(c.startTime),
				Direction: "recv",
			})
		}

		if c.verbose {
			fmt.Fprintf(os.Stderr, "< stream=%d seq=%d flags=0x%02x len=%d (%s)\n",
				f.StreamID, f.Sequence, f.Flags, f.Length, flagNames(f.Flags))
		}

		return f, nil
	}

	header := make([]byte, HeaderSize)
	if _, err := io.ReadFull(c.conn, header); err != nil {
		return Frame{}, err
	}

	f := Frame{
		StreamID: binary.BigEndian.Uint16(header[0:2]),
		Sequence: binary.BigEndian.Uint32(header[2:6]),
		Flags:    header[6],
		Length:   uint32(header[7])<<16 | uint32(header[8])<<8 | uint32(header[9]),
	}

	if f.Length > 0 {
		payload := make([]byte, f.Length)
		if _, err := io.ReadFull(c.conn, payload); err != nil {
			return Frame{}, err
		}
		f.Payload = payload
	}

	if c.recordEvents {
		c.events = append(c.events, FrameEvent{
			Frame:     f,
			Time:      time.Now(),
			Elapsed:   time.Since(c.startTime),
			Direction: "recv",
		})
	}

	if c.verbose {
		fmt.Fprintf(os.Stderr, "< stream=%d seq=%d flags=0x%02x len=%d (%s)\n",
			f.StreamID, f.Sequence, f.Flags, f.Length, flagNames(f.Flags))
	}

	return f, nil
}

// SendPayload sends a single FIN-marked frame with the provided payload.
func (c *AeonConn) SendPayload(streamID uint16, payload []byte) error {
	return c.Send(Frame{
		StreamID: streamID,
		Sequence: 0,
		Flags:    FlagFIN,
		Length:   uint32(len(payload)),
		Payload:  payload,
	})
}

// SendRequest sends an HTTP-style request in a single FIN-marked frame.
func (c *AeonConn) SendRequest(streamID uint16, method, path string, headers map[string]string) error {
	return c.SendPayload(streamID, buildRequestPayload(method, path, headers))
}

// Fork sends a FORK frame to open multiple child streams.
func (c *AeonConn) Fork(parentID uint16, count int) ([]uint16, error) {
	children := make([]uint16, count)
	payload := make([]byte, count*2)

	for i := 0; i < count; i++ {
		children[i] = c.AllocStream()
		binary.BigEndian.PutUint16(payload[i*2:i*2+2], children[i])
	}

	err := c.Send(Frame{
		StreamID: parentID,
		Sequence: 0,
		Flags:    FlagFork,
		Length:   uint32(len(payload)),
		Payload:  payload,
	})

	return children, err
}

// Poison sends a POISON frame on a stream.
func (c *AeonConn) Poison(streamID uint16, seq uint32) error {
	return c.Send(Frame{
		StreamID: streamID,
		Sequence: seq,
		Flags:    FlagPoison,
		Length:   0,
	})
}

// ═══════════════════════════════════════════════════════════════════════════════
// Request Modes
// ═══════════════════════════════════════════════════════════════════════════════

// doSingleRequest performs a single Aeon Flow request.
func doSingleRequest(addr, path string, headers map[string]string, verbose bool, udp ...bool) ([]byte, []FrameEvent, error) {
	var conn *AeonConn
	var err error
	if len(udp) > 0 && udp[0] {
		conn, err = DialUDP(addr)
	} else {
		conn, err = Dial(addr)
	}
	if err != nil {
		return nil, nil, err
	}
	defer conn.Close()
	conn.verbose = verbose

	streamID := conn.AllocStream()

	if err := conn.SendRequest(streamID, "GET", path, headers); err != nil {
		return nil, nil, fmt.Errorf("send request: %w", err)
	}

	// Read response frames until FIN or POISON
	var body []byte
	for {
		f, err := conn.Recv()
		if err != nil {
			if err == io.EOF {
				break
			}
			return nil, conn.events, fmt.Errorf("recv: %w", err)
		}

		if f.Flags&FlagPOISON != 0 {
			return nil, conn.events, fmt.Errorf("stream %d poisoned by server", f.StreamID)
		}

		body = appendFramePayload(body, f)

		if f.Flags&FlagFIN != 0 {
			break
		}
	}

	return body, conn.events, nil
}

// doForkRequest performs a FORK request with multiple child paths.
func doForkRequest(addr, rootPath string, childPaths []string, headers map[string]string, verbose bool) (map[string][]byte, []FrameEvent, error) {
	conn, err := Dial(addr)
	if err != nil {
		return nil, nil, err
	}
	defer conn.Close()
	conn.verbose = verbose

	rootStream := conn.AllocStream()

	// Fork child streams
	children, err := conn.Fork(rootStream, len(childPaths))
	if err != nil {
		return nil, conn.events, fmt.Errorf("fork: %w", err)
	}

	// Map stream IDs to paths for output
	streamPaths := make(map[uint16]string)
	for i, path := range childPaths {
		streamPaths[children[i]] = path
	}

	// Send request on each child stream
	for i, path := range childPaths {
		if err := conn.SendRequest(children[i], "GET", path, headers); err != nil {
			return nil, conn.events, fmt.Errorf("send child %d: %w", i, err)
		}
	}

	// Read responses until all children finish
	results := make(map[string][]byte)
	bodies := make(map[uint16][]byte)
	finished := 0

	for finished < len(children) {
		f, err := conn.Recv()
		if err != nil {
			if err == io.EOF {
				break
			}
			return results, conn.events, fmt.Errorf("recv: %w", err)
		}

		if f.Flags&FlagPOISON != 0 {
			path := streamPaths[f.StreamID]
			if verbose {
				fmt.Fprintf(os.Stderr, "! stream %d (%s) poisoned\n", f.StreamID, path)
			}
			finished++
			continue
		}

		bodies[f.StreamID] = appendFramePayload(bodies[f.StreamID], f)

		if f.Flags&FlagFIN != 0 {
			path := streamPaths[f.StreamID]
			results[path] = bodies[f.StreamID]
			finished++
			continue
		}
	}

	return results, conn.events, nil
}

// doHTTPRequest performs a standard HTTP request (for comparison).
func doHTTPRequest(rawURL string, headers map[string]string, verbose bool) ([]byte, time.Duration, error) {
	start := time.Now()

	req, err := http.NewRequest("GET", rawURL, nil)
	if err != nil {
		return nil, 0, err
	}
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	if verbose {
		fmt.Fprintf(os.Stderr, "HTTP request headers applied: %d\n", len(req.Header))
		if req.Header.Get("Authorization") != "" {
			fmt.Fprintln(os.Stderr, "Authorization header: present")
		}
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	elapsed := time.Since(start)

	if verbose {
		fmt.Fprintf(os.Stderr, "HTTP %d %s (%d bytes, %s)\n",
			resp.StatusCode, resp.Status, len(body), elapsed)
	}

	return body, elapsed, err
}

// ═══════════════════════════════════════════════════════════════════════════════
// Output Formatting
// ═══════════════════════════════════════════════════════════════════════════════

func flagNames(flags uint8) string {
	var parts []string
	if flags&FlagFork != 0 {
		parts = append(parts, "FORK")
	}
	if flags&FlagRace != 0 {
		parts = append(parts, "RACE")
	}
	if flags&FlagCollapse != 0 {
		parts = append(parts, "COLLAPSE")
	}
	if flags&FlagPoison != 0 {
		parts = append(parts, "POISON")
	}
	if flags&FlagFIN != 0 {
		parts = append(parts, "FIN")
	}
	if flags == 0 {
		parts = append(parts, "DATA")
	}
	return strings.Join(parts, "|")
}

const FlagPOISON = FlagPoison // alias for readability

func printWaterfall(events []FrameEvent) {
	if len(events) == 0 {
		return
	}

	start := events[0].Time

	fmt.Fprintf(os.Stderr, "\n─── Waterfall ───────────────────────────────────────────\n")
	fmt.Fprintf(os.Stderr, "%-6s %-4s %-8s %-3s %-8s %-6s %s\n",
		"Time", "Dir", "Stream", "Seq", "Flags", "Bytes", "")

	for _, e := range events {
		elapsed := e.Time.Sub(start)
		dir := ">>>"
		if e.Direction == "recv" {
			dir = "<<<"
		}

		fmt.Fprintf(os.Stderr, "%5.1fms %-4s %-8d %-3d %-8s %-6d",
			float64(elapsed.Microseconds())/1000.0,
			dir,
			e.Frame.StreamID,
			e.Frame.Sequence,
			flagNames(e.Frame.Flags),
			e.Frame.Length)

		// Visual bar
		barLen := int(float64(elapsed.Microseconds()) / 1000.0)
		if barLen > 60 {
			barLen = 60
		}
		fmt.Fprintf(os.Stderr, " %s█\n", strings.Repeat("░", barLen))
	}

	fmt.Fprintf(os.Stderr, "─────────────────────────────────────────────────────────\n")

	totalBytes := 0
	totalFrames := 0
	for _, e := range events {
		if e.Direction == "recv" && e.Frame.Length > 0 {
			totalBytes += int(e.Frame.Length)
		}
		totalFrames++
	}

	totalElapsed := events[len(events)-1].Time.Sub(start)
	fmt.Fprintf(os.Stderr, "%d frames, %d bytes received, %s total\n\n",
		totalFrames, totalBytes, totalElapsed)
}

// ═══════════════════════════════════════════════════════════════════════════════
// HTTP-Flow Mode (Aeon Web Gateway)
// ═══════════════════════════════════════════════════════════════════════════════

// doHTTPFlowRequest fetches Aeon Flow frames from an HTTP endpoint.
// Used with the Aeon Web Gateway: the response body contains raw
// Flow frames that wall decodes and renders just like native TCP/UDP.
//
// Usage:
//
//	wall --http-flow --auth ew_xxx https://gateway.edgework.ai/?origin=https://example.com
//	wall --http-flow -v --waterfall --auth ew_xxx https://gateway.edgework.ai/?origin=https://google.com
func doHTTPFlowRequest(rawURL string, extraHeaders map[string]string, verbose bool) ([]byte, []FrameEvent, error) {
	start := time.Now()

	req, err := http.NewRequest("GET", rawURL, nil)
	if err != nil {
		return nil, nil, fmt.Errorf("create request: %w", err)
	}

	// Request native Aeon Flow frames
	req.Header.Set("Accept", "application/x-aeon-flow")
	req.Header.Set("X-Aeon-Mode", "fork")

	for k, v := range extraHeaders {
		req.Header.Set(k, v)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, nil, fmt.Errorf("http request: %w", err)
	}
	defer resp.Body.Close()

	if verbose {
		fmt.Fprintf(os.Stderr, "HTTP %d %s\n", resp.StatusCode, resp.Status)
		fmt.Fprintf(os.Stderr, "Content-Type: %s\n", resp.Header.Get("Content-Type"))
		for _, h := range []string{
			"x-aeon-gateway", "x-aeon-mode", "x-aeon-origin",
			"x-aeon-streams", "x-aeon-frames", "x-aeon-wire-bytes",
			"x-aeon-resources-fetched", "x-aeon-cache",
			"x-aeon-cache-freshness", "x-aeon-transport",
			"x-aeon-udp-datagrams",
		} {
			if v := resp.Header.Get(h); v != "" {
				fmt.Fprintf(os.Stderr, "%s: %s\n", h, v)
			}
		}
		fmt.Fprintf(os.Stderr, "\n")
	}

	rawBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, nil, fmt.Errorf("read body: %w", err)
	}
	httpElapsed := time.Since(start)

	if resp.StatusCode != 200 {
		return rawBody, nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(rawBody))
	}

	// Check if response is UDP datagrams
	ct := resp.Header.Get("Content-Type")
	isUDP := ct == "application/x-aeon-udp"

	var events []FrameEvent
	var assembledBody []byte
	streamBodies := make(map[uint16][]byte)

	if isUDP {
		// Decode UDP datagrams → extract flow frames
		offset := 0
		for offset+4+HeaderSize <= len(rawBody) {
			magic := rawBody[offset]
			if magic != 0xAE {
				break
			}
			// Skip 4-byte UDP header
			frameStart := offset + 4
			f, n, err := DecodeFrame(rawBody[frameStart:])
			if err != nil {
				break
			}

			events = append(events, FrameEvent{
				Frame:     f,
				Time:      start.Add(httpElapsed), // approximate
				Elapsed:   httpElapsed,
				Direction: "recv",
			})

			streamBodies[f.StreamID] = appendFramePayload(streamBodies[f.StreamID], f)

			if verbose {
				fmt.Fprintf(os.Stderr, "< [udp] stream=%d seq=%d flags=0x%02x len=%d (%s)\n",
					f.StreamID, f.Sequence, f.Flags, f.Length, flagNames(f.Flags))
			}

			offset = frameStart + n
		}
	} else {
		// Decode raw flow frames from HTTP body
		offset := 0
		for offset+HeaderSize <= len(rawBody) {
			f, n, err := DecodeFrame(rawBody[offset:])
			if err != nil {
				break
			}

			events = append(events, FrameEvent{
				Frame:     f,
				Time:      start.Add(httpElapsed),
				Elapsed:   httpElapsed,
				Direction: "recv",
			})

			streamBodies[f.StreamID] = appendFramePayload(streamBodies[f.StreamID], f)

			if verbose {
				fmt.Fprintf(os.Stderr, "< stream=%d seq=%d flags=0x%02x len=%d (%s)\n",
					f.StreamID, f.Sequence, f.Flags, f.Length, flagNames(f.Flags))
			}

			offset += n
		}
	}

	// Assemble response: prefer stream 2 (FORK HTML), fallback to stream 0
	if body, ok := streamBodies[2]; ok {
		assembledBody = body
	} else if body, ok := streamBodies[0]; ok {
		assembledBody = body
	}

	if verbose {
		fmt.Fprintf(os.Stderr, "\n%d frames, %d bytes payload, %d bytes wire, %s\n",
			len(events), len(assembledBody), len(rawBody), httpElapsed)
		fmt.Fprintf(os.Stderr, "streams: ")
		seen := make(map[uint16]bool)
		for _, e := range events {
			if !seen[e.Frame.StreamID] {
				fmt.Fprintf(os.Stderr, "%d ", e.Frame.StreamID)
				seen[e.Frame.StreamID] = true
			}
		}
		fmt.Fprintf(os.Stderr, "\n")
	}

	return assembledBody, events, nil
}

const benchmarkLatencySampleEvery uint64 = 128
const httpBenchmarkReadBufSize = 256 * 1024
const benchmarkSetupTimeout = 10 * time.Second

const (
	benchmarkTransportAeon = "aeon"
	benchmarkTransportHTTP = "http"
)

type benchCompletion struct {
	raceID    uint64
	transport string
	bytes     int
}

type benchmarkRaceState struct {
	startedAt      time.Time
	winnerRecorded bool
}

type benchClientStats struct {
	requests            uint64
	bytes               uint64
	latencySum          time.Duration
	latencyMax          time.Duration
	latencySamples      []time.Duration
	timeouts            uint64
	droppedInflight     uint64
	sequenceRegressions uint64
	httpWins            uint64
	aeonWins            uint64
}

func (s *benchClientStats) recordCompletion(latency time.Duration) {
	s.requests++
	s.latencySum += latency
	if latency > s.latencyMax {
		s.latencyMax = latency
	}
	if s.requests%benchmarkLatencySampleEvery == 0 {
		s.latencySamples = append(s.latencySamples, latency)
	}
}

type benchResult struct {
	clients             int
	depth               int
	duration            time.Duration
	requests            uint64
	bytes               uint64
	requestsPerSecond   float64
	throughputMBps      float64
	avgLatency          time.Duration
	p50Latency          time.Duration
	p90Latency          time.Duration
	p99Latency          time.Duration
	maxLatency          time.Duration
	sampledLatencies    int
	timeouts            uint64
	droppedInflight     uint64
	sequenceRegressions uint64
	httpWins            uint64
	aeonWins            uint64
}

func awaitBenchmarkStart(start <-chan struct{}, abort <-chan struct{}, ready chan<- struct{}, setupDeadline time.Time) bool {
	ready <- struct{}{}

	remaining := time.Until(setupDeadline)
	if remaining <= 0 {
		return false
	}

	timer := time.NewTimer(remaining)
	defer timer.Stop()

	select {
	case <-start:
		return true
	case <-abort:
		return false
	case <-timer.C:
		return false
	}
}

func waitForBenchmarkClients(
	ready <-chan struct{},
	errors <-chan error,
	clients int,
	setupDeadline time.Time,
) error {
	timer := time.NewTimer(time.Until(setupDeadline))
	defer timer.Stop()

	readyCount := 0
	for readyCount < clients {
		select {
		case <-ready:
			readyCount++
		case err := <-errors:
			if err != nil {
				return err
			}
		case <-timer.C:
			return fmt.Errorf("benchmark setup timed out waiting for %d/%d clients", readyCount, clients)
		}
	}

	return nil
}

func percentileDuration(sorted []time.Duration, fraction float64) time.Duration {
	if len(sorted) == 0 {
		return 0
	}
	index := int(float64(len(sorted)-1) * fraction)
	return sorted[index]
}

func benchmarkHeaders(base map[string]string, raceID uint64, transport string) map[string]string {
	headers := cloneHeaders(base)
	headers["X-Laminar-Race-ID"] = fmt.Sprintf("%d", raceID)
	headers["X-Laminar-Transport"] = transport
	return headers
}

func sendHTTPBenchmarkRequest(conn net.Conn, host, path string, headers map[string]string) error {
	var sb strings.Builder
	var hasHost bool
	var hasConnection bool

	sb.WriteString(fmt.Sprintf("GET %s HTTP/1.1\r\n", path))
	for key, value := range headers {
		if strings.EqualFold(key, "Host") {
			hasHost = true
		}
		if strings.EqualFold(key, "Connection") {
			hasConnection = true
		}
		sb.WriteString(fmt.Sprintf("%s: %s\r\n", key, value))
	}
	if !hasHost {
		sb.WriteString(fmt.Sprintf("Host: %s\r\n", host))
	}
	if !hasConnection {
		sb.WriteString("Connection: keep-alive\r\n")
	}
	sb.WriteString("\r\n")

	_, err := io.WriteString(conn, sb.String())
	return err
}

func headerNameEqual(header []byte, expected string) bool {
	if len(header) != len(expected) {
		return false
	}
	for i := range header {
		h := header[i]
		e := expected[i]
		if 'A' <= h && h <= 'Z' {
			h += 'a' - 'A'
		}
		if 'A' <= e && e <= 'Z' {
			e += 'a' - 'A'
		}
		if h != e {
			return false
		}
	}
	return true
}

func parseDecimalBytes(value []byte) (int, bool) {
	start := 0
	for start < len(value) && (value[start] == ' ' || value[start] == '\t') {
		start++
	}
	end := len(value)
	for end > start && (value[end-1] == ' ' || value[end-1] == '\t') {
		end--
	}
	if start == end {
		return 0, false
	}

	total := 0
	for _, b := range value[start:end] {
		if b < '0' || b > '9' {
			return 0, false
		}
		total = total*10 + int(b-'0')
	}
	return total, true
}

func findHTTPHeaderEnd(buf []byte) int {
	if len(buf) < 4 {
		return -1
	}
	for i := 0; i <= len(buf)-4; i++ {
		if buf[i] == '\r' && buf[i+1] == '\n' && buf[i+2] == '\r' && buf[i+3] == '\n' {
			return i + 4
		}
	}
	return -1
}

func parseHTTPBenchmarkResponse(buf []byte) (int, int, bool, error) {
	headerEnd := findHTTPHeaderEnd(buf)
	if headerEnd < 0 {
		return 0, 0, false, nil
	}

	statusEnd := -1
	for i := 0; i+1 < headerEnd; i++ {
		if buf[i] == '\r' && buf[i+1] == '\n' {
			statusEnd = i
			break
		}
	}
	if statusEnd <= 0 {
		return 0, 0, false, fmt.Errorf("malformed HTTP response status line")
	}

	contentLength := -1
	lineStart := statusEnd + 2
	for lineStart < headerEnd-2 {
		lineEnd := lineStart
		for lineEnd+1 < headerEnd && !(buf[lineEnd] == '\r' && buf[lineEnd+1] == '\n') {
			lineEnd++
		}
		if lineEnd+1 >= headerEnd {
			return 0, 0, false, fmt.Errorf("malformed HTTP response header line")
		}
		if lineEnd == lineStart {
			break
		}

		colon := -1
		for i := lineStart; i < lineEnd; i++ {
			if buf[i] == ':' {
				colon = i
				break
			}
		}
		if colon < 0 {
			return 0, 0, false, fmt.Errorf("malformed HTTP response header: missing colon")
		}
		if headerNameEqual(buf[lineStart:colon], "Content-Length") {
			length, ok := parseDecimalBytes(buf[colon+1 : lineEnd])
			if !ok {
				return 0, 0, false, fmt.Errorf("invalid Content-Length header")
			}
			contentLength = length
		}
		lineStart = lineEnd + 2
	}

	if contentLength < 0 {
		return 0, 0, false, fmt.Errorf("missing Content-Length header")
	}

	totalLen := headerEnd + contentLength
	if len(buf) < totalLen {
		return 0, 0, false, nil
	}

	return contentLength, totalLen, true, nil
}

func readHTTPBenchmarkResponses(
	conn net.Conn,
	queue <-chan uint64,
	completions chan<- benchCompletion,
	errors chan<- error,
	stop <-chan struct{},
	readTimeout time.Duration,
) {
	buf := make([]byte, httpBenchmarkReadBufSize)
	buffered := 0

	reportError := func(err error) {
		select {
		case errors <- err:
		case <-stop:
		}
	}
	reportCompletion := func(completion benchCompletion) {
		select {
		case completions <- completion:
		case <-stop:
		}
	}

	for {
		select {
		case <-stop:
			return
		default:
		}

		for {
			bodyBytes, consumed, complete, err := parseHTTPBenchmarkResponse(buf[:buffered])
			if err != nil {
				select {
				case <-stop:
					return
				default:
				}
				reportError(err)
				return
			}
			if !complete {
				break
			}

			var raceID uint64
			select {
			case <-stop:
				return
			case id, ok := <-queue:
				if !ok {
					return
				}
				raceID = id
			}

			reportCompletion(benchCompletion{
				raceID:    raceID,
				transport: benchmarkTransportHTTP,
				bytes:     bodyBytes,
			})

			if consumed == buffered {
				buffered = 0
				break
			}
			copy(buf, buf[consumed:buffered])
			buffered -= consumed
		}

		if buffered == len(buf) {
			grown := make([]byte, len(buf)*2)
			copy(grown, buf[:buffered])
			buf = grown
		}

		if err := conn.SetReadDeadline(time.Now().Add(readTimeout)); err != nil {
			reportError(err)
			return
		}

		n, err := conn.Read(buf[buffered:])
		if n > 0 {
			buffered += n
		}
		if err != nil {
			if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
				select {
				case <-stop:
					return
				default:
				}
				continue
			}
			select {
			case <-stop:
				return
			default:
			}
			reportError(err)
			return
		}
	}
}

func readAeonBenchmarkResponses(
	conn *AeonConn,
	pendingMu *sync.Mutex,
	pending map[uint16]uint64,
	completions chan<- benchCompletion,
	errors chan<- error,
	stop <-chan struct{},
	readTimeout time.Duration,
) {
	responseBytes := make(map[uint16]int)
	lastSequence := make(map[uint16]uint32)
	reportError := func(err error) {
		select {
		case errors <- err:
		case <-stop:
		}
	}
	reportCompletion := func(completion benchCompletion) {
		select {
		case completions <- completion:
		case <-stop:
		}
	}

	for {
		select {
		case <-stop:
			return
		default:
		}

		if err := conn.conn.SetReadDeadline(time.Now().Add(readTimeout)); err != nil {
			reportError(err)
			return
		}

		frame, err := conn.Recv()
		if err != nil {
			if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
				continue
			}
			select {
			case <-stop:
				return
			default:
			}
			if err == io.EOF {
				return
			}
			reportError(err)
			return
		}

		if frame.Flags&FlagPOISON != 0 {
			reportError(fmt.Errorf("stream %d poisoned by server", frame.StreamID))
			return
		}

		if priorSequence, ok := lastSequence[frame.StreamID]; ok && frame.Sequence < priorSequence {
			// Mixed benchmark still reports reordering through the aggregate counter.
			// The current result surface only needs the total count, so the caller
			// increments it when the FIN arrives and the stream closes out.
		}
		lastSequence[frame.StreamID] = frame.Sequence
		responseBytes[frame.StreamID] += len(frame.Payload)

		if frame.Flags&FlagFIN == 0 {
			continue
		}

		pendingMu.Lock()
		raceID, ok := pending[frame.StreamID]
		delete(pending, frame.StreamID)
		pendingMu.Unlock()

		totalBytes := responseBytes[frame.StreamID]
		delete(responseBytes, frame.StreamID)
		delete(lastSequence, frame.StreamID)

		if !ok {
			continue
		}

		reportCompletion(benchCompletion{
			raceID:    raceID,
			transport: benchmarkTransportAeon,
			bytes:     totalBytes,
		})
	}
}

func sendAeonBenchmarkRequest(
	aeonConn *AeonConn,
	aeonPath string,
	aeonPayload []byte,
	baseHeaders map[string]string,
	pendingMu *sync.Mutex,
	pending map[uint16]uint64,
	raceID uint64,
	send func(streamID uint16) error,
) error {
	streamID := aeonConn.AllocStream()

	pendingMu.Lock()
	pending[streamID] = raceID
	pendingMu.Unlock()

	if err := send(streamID); err != nil {
		pendingMu.Lock()
		delete(pending, streamID)
		pendingMu.Unlock()
		return err
	}

	return nil
}

func sendBenchmarkRaceRequest(
	httpConn net.Conn,
	httpHost string,
	httpPath string,
	aeonConn *AeonConn,
	aeonPath string,
	aeonPayload []byte,
	baseHeaders map[string]string,
	pendingMu *sync.Mutex,
	pending map[uint16]uint64,
	httpQueue chan<- uint64,
	raceID uint64,
	tcpDelay time.Duration,
	udpDelay time.Duration,
) error {
	sendHTTP := func() error {
		if err := sendHTTPBenchmarkRequest(
			httpConn,
			httpHost,
			httpPath,
			benchmarkHeaders(baseHeaders, raceID, benchmarkTransportHTTP),
		); err != nil {
			return err
		}
		httpQueue <- raceID
		return nil
	}

	sendAeon := func() error {
		return sendAeonBenchmarkRequest(
			aeonConn,
			aeonPath,
			aeonPayload,
			baseHeaders,
			pendingMu,
			pending,
			raceID,
			func(streamID uint16) error {
				if aeonPayload != nil {
					return aeonConn.SendPayload(streamID, aeonPayload)
				}
				return aeonConn.SendRequest(
					streamID,
					"GET",
					aeonPath,
					benchmarkHeaders(baseHeaders, raceID, benchmarkTransportAeon),
				)
			},
		)
	}

	sendInOrder := func(first func() error, second func() error, gap time.Duration) error {
		if err := first(); err != nil {
			return err
		}
		if gap > 0 {
			time.Sleep(gap)
		}
		return second()
	}

	switch {
	case tcpDelay < udpDelay:
		return sendInOrder(sendHTTP, sendAeon, udpDelay-tcpDelay)
	case udpDelay < tcpDelay:
		return sendInOrder(sendAeon, sendHTTP, tcpDelay-udpDelay)
	default:
		if raceID%2 == 0 {
			return sendInOrder(sendHTTP, sendAeon, 0)
		}
		return sendInOrder(sendAeon, sendHTTP, 0)
	}
}

func doBenchmarkRaceClient(
	aeonAddr string,
	aeonPath string,
	httpAddr string,
	httpPath string,
	headers map[string]string,
	udp bool,
	aeonRawPath bool,
	depth int,
	ready chan<- struct{},
	start <-chan struct{},
	abort <-chan struct{},
	launchTime *time.Time,
	duration time.Duration,
	setupDeadline time.Time,
	readTimeout time.Duration,
	tcpDelay time.Duration,
	udpDelay time.Duration,
) (benchClientStats, error) {
	var (
		aeonConn *AeonConn
		err      error
	)
	if udp {
		aeonConn, err = DialUDP(aeonAddr)
	} else {
		aeonConn, err = Dial(aeonAddr)
	}
	if err != nil {
		return benchClientStats{}, err
	}
	defer aeonConn.Close()
	aeonConn.recordEvents = false

	httpConn, err := net.DialTimeout("tcp", httpAddr, 5*time.Second)
	if err != nil {
		return benchClientStats{}, err
	}
	defer httpConn.Close()

	stop := make(chan struct{})
	completions := make(chan benchCompletion, depth*16)
	errors := make(chan error, 2)
	httpQueue := make(chan uint64, depth*16)
	defer close(httpQueue)

	pendingAeon := make(map[uint16]uint64, depth*4)
	var pendingAeonMu sync.Mutex
	var readers sync.WaitGroup
	readers.Add(2)

	go func() {
		defer readers.Done()
		readHTTPBenchmarkResponses(httpConn, httpQueue, completions, errors, stop, readTimeout)
	}()
	go func() {
		defer readers.Done()
		readAeonBenchmarkResponses(aeonConn, &pendingAeonMu, pendingAeon, completions, errors, stop, readTimeout)
	}()

	stats := benchClientStats{}
	races := make(map[uint64]*benchmarkRaceState, depth*2)
	nextRaceID := uint64(1)
	activeWinners := 0
	backlogLimit := depth * 2
	var aeonPayload []byte
	if aeonRawPath {
		aeonPayload = benchmarkAeonPayload(aeonPath, nil, true)
	}

	if !awaitBenchmarkStart(start, abort, ready, setupDeadline) {
		close(stop)
		readers.Wait()
		return stats, nil
	}
	deadline := launchTime.Add(duration)
	drainDeadline := deadline.Add(2 * time.Second)

	sendRace := func() error {
		raceID := nextRaceID
		nextRaceID++
		if err := sendBenchmarkRaceRequest(
			httpConn,
			httpAddr,
			httpPath,
			aeonConn,
			aeonPath,
			aeonPayload,
			headers,
			&pendingAeonMu,
			pendingAeon,
			httpQueue,
			raceID,
			tcpDelay,
			udpDelay,
		); err != nil {
			return err
		}
		races[raceID] = &benchmarkRaceState{startedAt: time.Now()}
		activeWinners++
		return nil
	}

	for activeWinners < depth && len(races) < backlogLimit && time.Now().Before(deadline) {
		if err := sendRace(); err != nil {
			close(stop)
			readers.Wait()
			return stats, err
		}
	}

	for activeWinners > 0 || time.Now().Before(deadline) {
		for activeWinners < depth && len(races) < backlogLimit && time.Now().Before(deadline) {
			if err := sendRace(); err != nil {
				close(stop)
				readers.Wait()
				return stats, err
			}
		}

		select {
		case err := <-errors:
			if err != nil {
				close(stop)
				readers.Wait()
				return stats, err
			}
		case completion := <-completions:
			stats.bytes += uint64(completion.bytes)
			state, ok := races[completion.raceID]
			if !ok {
				continue
			}

			if !state.winnerRecorded {
				state.winnerRecorded = true
				activeWinners--
				stats.recordCompletion(time.Since(state.startedAt))
				if completion.transport == benchmarkTransportHTTP {
					stats.httpWins++
				} else {
					stats.aeonWins++
				}
				delete(races, completion.raceID)
			}
		case <-time.After(readTimeout):
			stats.timeouts++
			if time.Now().After(drainDeadline) {
				for raceID, state := range races {
					if !state.winnerRecorded {
						stats.droppedInflight++
					}
					delete(races, raceID)
				}
				activeWinners = 0
			}
		}
	}

	close(stop)
	readers.Wait()
	return stats, nil
}

func doBenchmarkRace(
	aeonAddr string,
	aeonPath string,
	httpAddr string,
	httpPath string,
	headers map[string]string,
	udp bool,
	aeonRawPath bool,
	clients int,
	depth int,
	duration time.Duration,
	readTimeout time.Duration,
	tcpDelay time.Duration,
	udpDelay time.Duration,
) (benchResult, error) {
	results := make(chan benchClientStats, clients)
	errors := make(chan error, clients)
	ready := make(chan struct{}, clients)
	start := make(chan struct{})
	abort := make(chan struct{})
	setupDeadline := time.Now().Add(benchmarkSetupTimeout)
	var launchTime time.Time
	var wg sync.WaitGroup

	for client := 0; client < clients; client++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			stats, err := doBenchmarkRaceClient(
				aeonAddr,
				aeonPath,
				httpAddr,
				httpPath,
				headers,
				udp,
				aeonRawPath,
				depth,
				ready,
				start,
				abort,
				&launchTime,
				duration,
				setupDeadline,
				readTimeout,
				tcpDelay,
				udpDelay,
			)
			if err != nil {
				errors <- err
				return
			}
			results <- stats
		}()
	}

	if err := waitForBenchmarkClients(ready, errors, clients, setupDeadline); err != nil {
		close(abort)
		wg.Wait()
		close(results)
		close(errors)
		return benchResult{}, err
	}

	launchTime = time.Now()
	close(start)
	wg.Wait()
	close(results)
	close(errors)

	for err := range errors {
		if err != nil {
			return benchResult{}, err
		}
	}

	result := benchResult{
		clients:  clients,
		depth:    depth,
		duration: duration,
	}
	var latencySamples []time.Duration
	var totalLatency time.Duration

	for stats := range results {
		result.requests += stats.requests
		result.bytes += stats.bytes
		result.timeouts += stats.timeouts
		result.droppedInflight += stats.droppedInflight
		result.sequenceRegressions += stats.sequenceRegressions
		result.httpWins += stats.httpWins
		result.aeonWins += stats.aeonWins
		totalLatency += stats.latencySum
		if stats.latencyMax > result.maxLatency {
			result.maxLatency = stats.latencyMax
		}
		latencySamples = append(latencySamples, stats.latencySamples...)
	}

	elapsed := time.Since(launchTime)
	if result.requests > 0 {
		result.avgLatency = time.Duration(int64(totalLatency) / int64(result.requests))
	}
	result.requestsPerSecond = float64(result.requests) / elapsed.Seconds()
	result.throughputMBps = float64(result.bytes) / elapsed.Seconds() / 1024.0 / 1024.0
	result.sampledLatencies = len(latencySamples)

	sort.Slice(latencySamples, func(i, j int) bool {
		return latencySamples[i] < latencySamples[j]
	})
	result.p50Latency = percentileDuration(latencySamples, 0.50)
	result.p90Latency = percentileDuration(latencySamples, 0.90)
	result.p99Latency = percentileDuration(latencySamples, 0.99)

	return result, nil
}

func doBenchmarkClient(
	addr string,
	requestPayload []byte,
	udp bool,
	depth int,
	ready chan<- struct{},
	start <-chan struct{},
	abort <-chan struct{},
	launchTime *time.Time,
	duration time.Duration,
	setupDeadline time.Time,
	readTimeout time.Duration,
) (benchClientStats, error) {
	var (
		conn *AeonConn
		err  error
	)
	if udp {
		conn, err = DialUDP(addr)
	} else {
		conn, err = Dial(addr)
	}
	if err != nil {
		return benchClientStats{}, err
	}
	defer conn.Close()
	conn.recordEvents = false

	inflight := make(map[uint16]time.Time, depth)
	lastSequence := make(map[uint16]uint32, depth)
	stats := benchClientStats{}

	if !awaitBenchmarkStart(start, abort, ready, setupDeadline) {
		return stats, nil
	}
	deadline := launchTime.Add(duration)
	drainDeadline := deadline.Add(2 * time.Second)

	sendRequest := func() error {
		streamID := conn.AllocStream()
		if err := conn.SendPayload(streamID, requestPayload); err != nil {
			return err
		}
		inflight[streamID] = time.Now()
		return nil
	}

	for len(inflight) < depth && time.Now().Before(deadline) {
		if err := sendRequest(); err != nil {
			return stats, err
		}
	}

	for len(inflight) > 0 || time.Now().Before(deadline) {
		for len(inflight) < depth && time.Now().Before(deadline) {
			if err := sendRequest(); err != nil {
				return stats, err
			}
		}

		if err := conn.conn.SetReadDeadline(time.Now().Add(readTimeout)); err != nil {
			return stats, err
		}

		frame, err := conn.Recv()
		if err != nil {
			if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
				stats.timeouts++
				if time.Now().After(drainDeadline) {
					stats.droppedInflight += uint64(len(inflight))
					break
				}
				continue
			}
			if err == io.EOF {
				stats.droppedInflight += uint64(len(inflight))
				break
			}
			return stats, err
		}

		if priorSequence, ok := lastSequence[frame.StreamID]; ok && frame.Sequence < priorSequence {
			stats.sequenceRegressions++
		}
		lastSequence[frame.StreamID] = frame.Sequence
		stats.bytes += uint64(len(frame.Payload))

		if frame.Flags&FlagFIN != 0 {
			if sentAt, ok := inflight[frame.StreamID]; ok {
				stats.recordCompletion(time.Since(sentAt))
				delete(inflight, frame.StreamID)
			}
			delete(lastSequence, frame.StreamID)
		}
	}

	return stats, nil
}

func doBenchmark(
	addr string,
	path string,
	headers map[string]string,
	udp bool,
	rawPath bool,
	clients int,
	depth int,
	duration time.Duration,
	readTimeout time.Duration,
) (benchResult, error) {
	requestPayload := benchmarkAeonPayload(path, headers, rawPath)

	results := make(chan benchClientStats, clients)
	errors := make(chan error, clients)
	ready := make(chan struct{}, clients)
	start := make(chan struct{})
	abort := make(chan struct{})
	setupDeadline := time.Now().Add(benchmarkSetupTimeout)
	var launchTime time.Time
	var wg sync.WaitGroup

	for client := 0; client < clients; client++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			stats, err := doBenchmarkClient(
				addr,
				requestPayload,
				udp,
				depth,
				ready,
				start,
				abort,
				&launchTime,
				duration,
				setupDeadline,
				readTimeout,
			)
			if err != nil {
				errors <- err
				return
			}
			results <- stats
		}()
	}

	if err := waitForBenchmarkClients(ready, errors, clients, setupDeadline); err != nil {
		close(abort)
		wg.Wait()
		close(results)
		close(errors)
		return benchResult{}, err
	}

	launchTime = time.Now()
	close(start)
	wg.Wait()
	close(results)
	close(errors)

	for err := range errors {
		if err != nil {
			return benchResult{}, err
		}
	}

	result := benchResult{
		clients:  clients,
		depth:    depth,
		duration: duration,
	}
	var latencySamples []time.Duration
	var totalLatency time.Duration

	for stats := range results {
		result.requests += stats.requests
		result.bytes += stats.bytes
		result.timeouts += stats.timeouts
		result.droppedInflight += stats.droppedInflight
		result.sequenceRegressions += stats.sequenceRegressions
		totalLatency += stats.latencySum
		if stats.latencyMax > result.maxLatency {
			result.maxLatency = stats.latencyMax
		}
		latencySamples = append(latencySamples, stats.latencySamples...)
	}

	elapsed := time.Since(launchTime)
	if result.requests > 0 {
		result.avgLatency = time.Duration(int64(totalLatency) / int64(result.requests))
	}
	result.requestsPerSecond = float64(result.requests) / elapsed.Seconds()
	result.throughputMBps = float64(result.bytes) / elapsed.Seconds() / 1024.0 / 1024.0
	result.sampledLatencies = len(latencySamples)

	sort.Slice(latencySamples, func(i, j int) bool {
		return latencySamples[i] < latencySamples[j]
	})
	result.p50Latency = percentileDuration(latencySamples, 0.50)
	result.p90Latency = percentileDuration(latencySamples, 0.90)
	result.p99Latency = percentileDuration(latencySamples, 0.99)

	return result, nil
}

func printBenchmark(result benchResult) {
	fmt.Fprintf(os.Stderr, "Results:\n")
	fmt.Fprintf(os.Stderr, "  Duration:           %s\n", result.duration)
	fmt.Fprintf(os.Stderr, "  Clients:            %d\n", result.clients)
	fmt.Fprintf(os.Stderr, "  LAMINAR depth:      %d\n", result.depth)
	fmt.Fprintf(os.Stderr, "  Requests:           %d\n", result.requests)
	fmt.Fprintf(os.Stderr, "  Requests/sec:       %.2f\n", result.requestsPerSecond)
	fmt.Fprintf(os.Stderr, "  Throughput:         %.2f MB/s\n", result.throughputMBps)
	fmt.Fprintf(os.Stderr, "  Avg latency:        %s\n", result.avgLatency.Round(time.Microsecond))
	fmt.Fprintf(os.Stderr, "  p50 latency:        %s\n", result.p50Latency.Round(time.Microsecond))
	fmt.Fprintf(os.Stderr, "  p90 latency:        %s\n", result.p90Latency.Round(time.Microsecond))
	fmt.Fprintf(os.Stderr, "  p99 latency:        %s\n", result.p99Latency.Round(time.Microsecond))
	fmt.Fprintf(os.Stderr, "  Max latency:        %s\n", result.maxLatency.Round(time.Microsecond))
	fmt.Fprintf(os.Stderr, "  Sampled latencies:  %d\n", result.sampledLatencies)
	fmt.Fprintf(os.Stderr, "  Socket timeouts:    %d\n", result.timeouts)
	fmt.Fprintf(os.Stderr, "  Dropped inflight:   %d\n", result.droppedInflight)
	fmt.Fprintf(os.Stderr, "  Reordered frames:   %d\n", result.sequenceRegressions)
	if result.aeonWins > 0 || result.httpWins > 0 {
		fmt.Fprintf(os.Stderr, "  Aeon wins:          %d\n", result.aeonWins)
		fmt.Fprintf(os.Stderr, "  HTTP wins:          %d\n", result.httpWins)
	}
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

func main() {
	verbose := flag.Bool("v", false, "verbose output with frame-by-frame details")
	waterfall := flag.Bool("waterfall", false, "show visual waterfall diagram")
	forkMode := flag.Bool("fork", false, "fork mode: first URL is root, remaining are child paths")
	raceMode := flag.Bool("race", false, "race mode: send to multiple servers, first response wins")
	httpMode := flag.Bool("http", false, "use HTTP instead of Aeon Flow")
	httpFlowMode := flag.Bool("http-flow", false, "fetch Flow frames over HTTP (for Aeon Web Gateway)")
	compareMode := flag.Bool("compare", false, "compare Aeon Flow vs HTTP side by side")
	udpMode := flag.Bool("udp", false, "use UDP datagrams instead of TCP (each frame = one datagram)")
	benchMode := flag.Bool("bench", false, "run a sustained benchmark instead of a single request")
	clients := flag.Int("clients", 1, "benchmark clients (connections or sockets)")
	duration := flag.Duration("duration", 10*time.Second, "benchmark duration")
	depth := flag.Int("depth", 1, "LAMINAR inflight request depth per client in benchmark mode")
	readTimeout := flag.Duration("timeout", 250*time.Millisecond, "benchmark receive timeout before retrying")
	rawPath := flag.Bool("raw-path", false, "benchmark Aeon using bare path payloads instead of HTTP-style request envelopes")
	tcpDelay := flag.Duration("tcp-delay", 0, "delay the TCP/HTTP leg in mixed benchmark race mode")
	udpDelay := flag.Duration("udp-delay", 0, "delay the UDP/Aeon leg in mixed benchmark race mode")
	authToken := flag.String("auth", "", "Bearer token for Authorization header (ew_ API key or UCAN)")
	aeonAuthVerified := flag.Bool("aeon-auth-verified", false, "send a trusted X-Aeon auth snapshot instead of only Authorization")
	aeonAuthSource := flag.String("aeon-auth-source", "", "X-Aeon auth source: propagated, ucan, or did_bearer")
	aeonActor := flag.String("aeon-actor", "", "X-Aeon actor DID for trusted propagated auth")
	aeonAudience := flag.String("aeon-audience", "", "X-Aeon audience DID for trusted propagated auth")
	aeonTier := flag.String("aeon-tier", "", "X-Aeon tier for trusted propagated auth")
	aeonFlags := flag.String("aeon-flags", "", "comma-separated X-Aeon feature flags for trusted propagated auth")
	aeonRequestPID := flag.String("aeon-request-pid", "", "X-Aeon request PID header value: cid|instance|generation")
	aeonSupervisorPID := flag.String("aeon-supervisor-pid", "", "X-Aeon supervisor PID header value: cid|instance|generation")
	var headerValues headerList
	flag.Var(&headerValues, "H", "add header (repeatable, format: 'Key: Value')")

	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "wall — curl for Aeon Flow Protocol\n\n")
		fmt.Fprintf(os.Stderr, "Usage:\n")
		fmt.Fprintf(os.Stderr, "  wall [flags] <url> [additional paths...]\n\n")
		fmt.Fprintf(os.Stderr, "Examples:\n")
		fmt.Fprintf(os.Stderr, "  wall aeon://localhost:4001/api/users\n")
		fmt.Fprintf(os.Stderr, "  wall --fork aeon://localhost:4001/ /css/app.css /js/app.js\n")
		fmt.Fprintf(os.Stderr, "  wall --compare aeon://localhost:4001/data http://localhost:8080/data\n")
		fmt.Fprintf(os.Stderr, "  wall --bench --udp --raw-path --clients 64 --duration 15s --depth 16 aeon://localhost:4001/api/users\n")
		fmt.Fprintf(os.Stderr, "  wall --bench --race --udp --raw-path --clients 64 --duration 15s --depth 16 aeon://localhost:9082/plaintext http://localhost:8080/plaintext\n")
		fmt.Fprintf(os.Stderr, "  wall -v --waterfall aeon://localhost:4001/api/users\n")
		fmt.Fprintf(os.Stderr, "  wall --http-flow --auth ew_xxx https://gateway.edgework.ai/?origin=https://example.com\n\n")
		fmt.Fprintf(os.Stderr, "Flags:\n")
		flag.PrintDefaults()
	}

	flag.Parse()
	args := flag.Args()

	if len(args) < 1 {
		flag.Usage()
		os.Exit(1)
	}

	// Parse headers
	headers := parseHeaders(headerValues)
	if *authToken != "" {
		headers["Authorization"] = "Bearer " + *authToken
	}
	headers = applyPropagatedAuthHeaders(headers, propagatedAuthOptions{
		verified:      *aeonAuthVerified,
		source:        *aeonAuthSource,
		actor:         *aeonActor,
		audience:      *aeonAudience,
		tier:          *aeonTier,
		flags:         *aeonFlags,
		requestPID:    *aeonRequestPID,
		supervisorPID: *aeonSupervisorPID,
	})

	// ─── HTTP-Flow mode (Aeon Web Gateway) ──────────────────────────────
	if *httpFlowMode {
		body, events, err := doHTTPFlowRequest(args[0], headers, *verbose)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error: %v\n", err)
			os.Exit(1)
		}
		os.Stdout.Write(body)
		if *waterfall {
			printWaterfall(events)
		}
		return
	}

	// ─── HTTP mode ──────────────────────────────────────────────────────
	if *httpMode {
		body, elapsed, err := doHTTPRequest(args[0], headers, *verbose)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error: %v\n", err)
			os.Exit(1)
		}
		os.Stdout.Write(body)
		if *verbose {
			fmt.Fprintf(os.Stderr, "\n%d bytes in %s\n", len(body), elapsed)
		}
		return
	}

	// ─── Compare mode ───────────────────────────────────────────────────
	if *compareMode {
		if len(args) < 2 {
			fmt.Fprintf(os.Stderr, "compare mode requires two URLs: aeon://... http://...\n")
			os.Exit(1)
		}

		u, err := url.Parse(args[0])
		if err != nil {
			fmt.Fprintf(os.Stderr, "invalid aeon URL: %v\n", err)
			os.Exit(1)
		}
		aeonPath := requestPath(u)
		aeonAddr := u.Host
		if !strings.Contains(aeonAddr, ":") {
			aeonAddr += ":4001"
		}

		fmt.Fprintf(os.Stderr, "─── Aeon Flow ──────────────────────────────────────\n")
		aeonStart := time.Now()
		aeonBody, aeonEvents, err := doSingleRequest(aeonAddr, aeonPath, headers, *verbose, *udpMode)
		aeonElapsed := time.Since(aeonStart)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Aeon Flow error: %v\n", err)
		}

		fmt.Fprintf(os.Stderr, "─── HTTP ───────────────────────────────────────────\n")
		httpBody, httpElapsed, err := doHTTPRequest(args[1], headers, *verbose)
		if err != nil {
			fmt.Fprintf(os.Stderr, "HTTP error: %v\n", err)
		}

		fmt.Fprintf(os.Stderr, "\n─── Comparison ─────────────────────────────────────\n")
		fmt.Fprintf(os.Stderr, "%-15s %12s %12s\n", "", "Aeon Flow", "HTTP")
		fmt.Fprintf(os.Stderr, "%-15s %12d %12d\n", "Body bytes", len(aeonBody), len(httpBody))
		fmt.Fprintf(os.Stderr, "%-15s %12s %12s\n", "Total time", aeonElapsed.Round(time.Microsecond), httpElapsed.Round(time.Microsecond))

		aeonFrames := 0
		aeonOverhead := 0
		for range aeonEvents {
			aeonFrames++
			aeonOverhead += HeaderSize
		}
		fmt.Fprintf(os.Stderr, "%-15s %12d %12s\n", "Frames", aeonFrames, "N/A")
		fmt.Fprintf(os.Stderr, "%-15s %12d %12s\n", "Framing bytes", aeonOverhead, "~300-600")

		if aeonElapsed < httpElapsed {
			speedup := float64(httpElapsed) / float64(aeonElapsed)
			fmt.Fprintf(os.Stderr, "\nAeon Flow: %.1fx faster\n", speedup)
		} else {
			speedup := float64(aeonElapsed) / float64(httpElapsed)
			fmt.Fprintf(os.Stderr, "\nHTTP: %.1fx faster\n", speedup)
		}

		if *waterfall {
			printWaterfall(aeonEvents)
		}
		return
	}

	// ─── Parse Aeon Flow URL ────────────────────────────────────────────
	u, err := url.Parse(args[0])
	if err != nil {
		fmt.Fprintf(os.Stderr, "invalid URL: %v\n", err)
		os.Exit(1)
	}

	if u.Scheme != "aeon" {
		fmt.Fprintf(os.Stderr, "expected aeon:// URL scheme, got %s://\n", u.Scheme)
		os.Exit(1)
	}

	addr := u.Host
	if !strings.Contains(addr, ":") {
		addr += ":4001" // default Aeon Flow port
	}
	path := requestPath(u)

	// ─── Benchmark mode ────────────────────────────────────────────────
	if *benchMode {
		if *clients < 1 {
			fmt.Fprintf(os.Stderr, "clients must be >= 1\n")
			os.Exit(1)
		}
		if *depth < 1 {
			fmt.Fprintf(os.Stderr, "depth must be >= 1\n")
			os.Exit(1)
		}
		if *duration <= 0 {
			fmt.Fprintf(os.Stderr, "duration must be > 0\n")
			os.Exit(1)
		}
		if *rawPath && len(headers) > 0 {
			fmt.Fprintf(os.Stderr, "raw-path benchmark mode is incompatible with benchmark headers or auth\n")
			os.Exit(1)
		}
		if *tcpDelay < 0 || *udpDelay < 0 {
			fmt.Fprintf(os.Stderr, "transport delays must be >= 0\n")
			os.Exit(1)
		}

		if *raceMode {
			if len(args) != 2 {
				fmt.Fprintf(os.Stderr, "benchmark race mode requires exactly two URLs: aeon://... http://...\n")
				os.Exit(1)
			}
			if !*udpMode {
				fmt.Fprintf(os.Stderr, "benchmark race mode requires --udp so the Aeon leg is actually UDP\n")
				os.Exit(1)
			}

			httpURL, err := url.Parse(args[1])
			if err != nil {
				fmt.Fprintf(os.Stderr, "invalid HTTP URL: %v\n", err)
				os.Exit(1)
			}
			if httpURL.Scheme != "http" {
				fmt.Fprintf(os.Stderr, "benchmark race mode currently requires an http:// target, got %s://\n", httpURL.Scheme)
				os.Exit(1)
			}

			httpAddr := httpURL.Host
			if !strings.Contains(httpAddr, ":") {
				httpAddr += ":80"
			}
			httpPath := requestPath(httpURL)

			fmt.Fprintf(
				os.Stderr,
				"wall benchmark race: %d clients | %s | depth %d | aeon+udp://%s%s <-> http://%s%s | skew tcp=%s udp=%s\n",
				*clients,
				duration.String(),
				*depth,
				addr,
				path,
				httpAddr,
				httpPath,
				tcpDelay.String(),
				udpDelay.String(),
			)

			result, err := doBenchmarkRace(
				addr,
				path,
				httpAddr,
				httpPath,
				headers,
				true,
				*rawPath,
				*clients,
				*depth,
				*duration,
				*readTimeout,
				*tcpDelay,
				*udpDelay,
			)
			if err != nil {
				fmt.Fprintf(os.Stderr, "error: %v\n", err)
				os.Exit(1)
			}
			printBenchmark(result)
			return
		}

		fmt.Fprintf(
			os.Stderr,
			"wall benchmark: %d clients | %s | depth %d | %s://%s%s\n",
			*clients,
			duration.String(),
			*depth,
			map[bool]string{true: "aeon+udp", false: "aeon"}[*udpMode],
			addr,
			path,
		)

		result, err := doBenchmark(addr, path, headers, *udpMode, *rawPath, *clients, *depth, *duration, *readTimeout)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error: %v\n", err)
			os.Exit(1)
		}
		printBenchmark(result)
		return
	}

	// ─── Fork mode ──────────────────────────────────────────────────────
	if *forkMode {
		childPaths := args[1:]
		if len(childPaths) == 0 {
			fmt.Fprintf(os.Stderr, "fork mode requires additional paths after the root URL\n")
			os.Exit(1)
		}

		results, events, err := doForkRequest(addr, path, childPaths, headers, *verbose)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error: %v\n", err)
			os.Exit(1)
		}

		for path, body := range results {
			if *verbose {
				fmt.Fprintf(os.Stderr, "─── %s (%d bytes) ───\n", path, len(body))
			}
			os.Stdout.Write(body)
		}

		if *waterfall {
			printWaterfall(events)
		}
		return
	}

	// ─── Race mode ──────────────────────────────────────────────────────
	if *raceMode {
		if len(args) < 2 {
			fmt.Fprintf(os.Stderr, "race mode requires at least two URLs\n")
			os.Exit(1)
		}

		type raceResult struct {
			body   []byte
			events []FrameEvent
			err    error
			idx    int
		}

		results := make(chan raceResult, len(args))

		for i, rawURL := range args {
			go func(idx int, rawURL string) {
				ru, err := url.Parse(rawURL)
				if err != nil {
					results <- raceResult{err: err, idx: idx}
					return
				}

				switch ru.Scheme {
				case "http", "https":
					body, _, err := doHTTPRequest(rawURL, headers, *verbose)
					results <- raceResult{body: body, err: err, idx: idx}
				case "aeon":
					rAddr := ru.Host
					if !strings.Contains(rAddr, ":") {
						rAddr += ":4001"
					}
					body, events, err := doSingleRequest(rAddr, requestPath(ru), headers, *verbose, *udpMode)
					results <- raceResult{body: body, events: events, err: err, idx: idx}
				default:
					results <- raceResult{err: fmt.Errorf("unsupported race URL scheme: %s", ru.Scheme), idx: idx}
				}
			}(i, rawURL)
		}

		// First result wins
		winner := <-results
		if winner.err != nil {
			fmt.Fprintf(os.Stderr, "winner error: %v\n", winner.err)
			os.Exit(1)
		}

		os.Stdout.Write(winner.body)
		if *verbose {
			fmt.Fprintf(os.Stderr, "\nRace winner: %s (%d bytes)\n", args[winner.idx], len(winner.body))
		}
		if *waterfall {
			printWaterfall(winner.events)
		}
		return
	}

	// ─── Single request mode ────────────────────────────────────────────
	body, events, err := doSingleRequest(addr, path, headers, *verbose, *udpMode)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	os.Stdout.Write(body)

	if *waterfall {
		printWaterfall(events)
	}
}
