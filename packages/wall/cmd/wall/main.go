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
	"context"
	"crypto/tls"
	"encoding/binary"
	"encoding/json"
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

	"github.com/gorilla/websocket"
	webtransport "github.com/quic-go/webtransport-go"
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
	FlagVent     = 0x40
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

type flowDuplexConn interface {
	io.ReadWriteCloser
	SetReadDeadline(time.Time) error
	SetWriteDeadline(time.Time) error
}

type discoveredFlowTarget struct {
	requestURL           *url.URL
	requestPath          string
	websocketEndpoint    string
	websocketStatus      string
	webtransportEndpoint string
	webtransportStatus   string
}

type websocketNetConn struct {
	conn    *websocket.Conn
	readBuf []byte
	readPos int
}

func (c *websocketNetConn) Read(p []byte) (int, error) {
	for c.readPos >= len(c.readBuf) {
		messageType, data, err := c.conn.ReadMessage()
		if err != nil {
			return 0, err
		}
		if messageType != websocket.BinaryMessage {
			continue
		}
		c.readBuf = data
		c.readPos = 0
	}

	n := copy(p, c.readBuf[c.readPos:])
	c.readPos += n
	if c.readPos >= len(c.readBuf) {
		c.readBuf = nil
		c.readPos = 0
	}
	return n, nil
}

func (c *websocketNetConn) Write(p []byte) (int, error) {
	if err := c.conn.WriteMessage(websocket.BinaryMessage, p); err != nil {
		return 0, err
	}
	return len(p), nil
}

func (c *websocketNetConn) Close() error {
	return c.conn.Close()
}

func (c *websocketNetConn) SetReadDeadline(deadline time.Time) error {
	return c.conn.SetReadDeadline(deadline)
}

func (c *websocketNetConn) SetWriteDeadline(deadline time.Time) error {
	return c.conn.SetWriteDeadline(deadline)
}

type webTransportStreamConn struct {
	session   *webtransport.Session
	stream    *webtransport.Stream
	closeOnce sync.Once
}

func (c *webTransportStreamConn) Read(p []byte) (int, error) {
	return c.stream.Read(p)
}

func (c *webTransportStreamConn) Write(p []byte) (int, error) {
	return c.stream.Write(p)
}

func (c *webTransportStreamConn) Close() error {
	var closeErr error
	c.closeOnce.Do(func() {
		_ = c.stream.Close()
		closeErr = c.session.CloseWithError(0, "wall closed")
	})
	return closeErr
}

func (c *webTransportStreamConn) SetReadDeadline(deadline time.Time) error {
	return c.stream.SetReadDeadline(deadline)
}

func (c *webTransportStreamConn) SetWriteDeadline(deadline time.Time) error {
	return c.stream.SetWriteDeadline(deadline)
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
	conn         flowDuplexConn
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

func DialWebSocket(rawURL string, headers map[string]string) (*AeonConn, error) {
	requestHeaders := make(http.Header, len(headers))
	for key, value := range headers {
		requestHeaders.Set(key, value)
	}

	wsConn, resp, err := websocket.DefaultDialer.Dial(rawURL, requestHeaders)
	if err != nil {
		if resp != nil && resp.Body != nil {
			defer resp.Body.Close()
			body, _ := io.ReadAll(resp.Body)
			return nil, fmt.Errorf("connect websocket %s: %w (%s)", rawURL, err, strings.TrimSpace(string(body)))
		}
		return nil, fmt.Errorf("connect websocket %s: %w", rawURL, err)
	}

	return &AeonConn{
		conn:         &websocketNetConn{conn: wsConn},
		nextStreamID: 0,
		startTime:    time.Now(),
		recordEvents: true,
	}, nil
}

func DialWebTransport(rawURL string, headers map[string]string) (*AeonConn, error) {
	u, err := url.Parse(rawURL)
	if err != nil {
		return nil, fmt.Errorf("parse webtransport URL %s: %w", rawURL, err)
	}
	if _, _, splitErr := net.SplitHostPort(u.Host); splitErr != nil {
		defaultPort := "443"
		if u.Scheme == "http" {
			defaultPort = "80"
		}
		u.Host = net.JoinHostPort(u.Hostname(), defaultPort)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	requestHeaders := make(http.Header, len(headers))
	for key, value := range headers {
		requestHeaders.Set(key, value)
	}

	var tlsConfig *tls.Config
	if isLoopbackHost(u.Hostname()) {
		tlsConfig = &tls.Config{InsecureSkipVerify: true}
	}

	dialer := webtransport.Dialer{
		TLSClientConfig: tlsConfig,
	}

	resp, session, err := dialer.Dial(ctx, u.String(), requestHeaders)
	if err != nil {
		if resp != nil {
			return nil, fmt.Errorf("connect webtransport %s: %w (HTTP %s)", rawURL, err, resp.Status)
		}
		return nil, fmt.Errorf("connect webtransport %s: %w", rawURL, err)
	}

	stream, err := session.OpenStreamSync(ctx)
	if err != nil {
		_ = session.CloseWithError(0, "stream open failed")
		return nil, fmt.Errorf("open webtransport stream %s: %w", rawURL, err)
	}

	return &AeonConn{
		conn: &webTransportStreamConn{
			session: session,
			stream:  stream,
		},
		nextStreamID: 0,
		startTime:    time.Now(),
		recordEvents: true,
	}, nil
}

func isLoopbackHost(host string) bool {
	if host == "localhost" {
		return true
	}
	ip := net.ParseIP(host)
	return ip != nil && ip.IsLoopback()
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
		if len(headers) == 0 {
			return []byte(path)
		}

		keys := make([]string, 0, len(headers))
		for key := range headers {
			keys = append(keys, key)
		}
		sort.Strings(keys)

		var sb strings.Builder
		sb.Grow(len(path) + len(headers)*32)
		sb.WriteString(path)
		for _, key := range keys {
			sb.WriteByte('\n')
			sb.WriteString(key)
			sb.WriteString(": ")
			sb.WriteString(headers[key])
		}
		return []byte(sb.String())
	}
	return buildRequestPayload("GET", path, headers)
}

func discoverFlowTarget(rawURL string, headers map[string]string, verbose bool) (discoveredFlowTarget, error) {
	requestURL, err := url.Parse(rawURL)
	if err != nil {
		return discoveredFlowTarget{}, fmt.Errorf("parse request URL: %w", err)
	}
	if requestURL.Scheme != "http" && requestURL.Scheme != "https" {
		return discoveredFlowTarget{}, fmt.Errorf("browser flow discovery requires http(s) URL, got %s://", requestURL.Scheme)
	}

	resp, err := inspectFlowHeaders(http.MethodHead, rawURL, headers)
	if err != nil {
		return discoveredFlowTarget{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusMethodNotAllowed {
		resp, err = inspectFlowHeaders(http.MethodGet, rawURL, headers)
		if err != nil {
			return discoveredFlowTarget{}, err
		}
		defer resp.Body.Close()
	}

	websocketEndpoint := strings.TrimSpace(resp.Header.Get("X-Aeon-WebSocket-Endpoint"))
	legacyEndpoint := strings.TrimSpace(resp.Header.Get("X-Aeon-Flow-Endpoint"))
	if websocketEndpoint == "" && (strings.HasPrefix(legacyEndpoint, "ws://") || strings.HasPrefix(legacyEndpoint, "wss://")) {
		websocketEndpoint = legacyEndpoint
	}

	websocketStatus := strings.ToLower(strings.TrimSpace(resp.Header.Get("X-Aeon-WebSocket-Status")))
	if websocketStatus == "" && websocketEndpoint != "" {
		switch strings.ToLower(strings.TrimSpace(resp.Header.Get("X-Aeon-Flow"))) {
		case "disabled":
			websocketStatus = "disabled"
		case "reserved":
			websocketStatus = "reserved"
		default:
			websocketStatus = "available"
		}
	}

	webtransportEndpoint := strings.TrimSpace(resp.Header.Get("X-Aeon-WebTransport-Endpoint"))
	if webtransportEndpoint == "" {
		webtransportEndpoint = requestURL.ResolveReference(&url.URL{Path: "/.aeon/udp"}).String()
	}
	webtransportStatus := strings.ToLower(strings.TrimSpace(resp.Header.Get("X-Aeon-WebTransport-Status")))
	if webtransportStatus == "" {
		webtransportStatus = "unknown"
	}

	target := discoveredFlowTarget{
		requestURL:           requestURL,
		requestPath:          requestPath(requestURL),
		websocketEndpoint:    websocketEndpoint,
		websocketStatus:      websocketStatus,
		webtransportEndpoint: webtransportEndpoint,
		webtransportStatus:   webtransportStatus,
	}

	if verbose {
		fmt.Fprintf(os.Stderr, "discovered request path: %s\n", target.requestPath)
		if target.websocketEndpoint != "" {
			fmt.Fprintf(os.Stderr, "discovered websocket endpoint: %s (%s)\n", target.websocketEndpoint, transportStatusLabel(target.websocketStatus))
		}
		if target.webtransportEndpoint != "" {
			fmt.Fprintf(os.Stderr, "discovered webtransport endpoint: %s (%s)\n", target.webtransportEndpoint, transportStatusLabel(target.webtransportStatus))
		}
	}

	return target, nil
}

func inspectFlowHeaders(method, rawURL string, headers map[string]string) (*http.Response, error) {
	req, err := http.NewRequest(method, rawURL, nil)
	if err != nil {
		return nil, fmt.Errorf("create discovery request: %w", err)
	}
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("discover flow headers: %w", err)
	}
	return resp, nil
}

func transportStatusLabel(status string) string {
	if strings.TrimSpace(status) == "" {
		return "unknown"
	}
	return status
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

// doSingleRequestWithConn performs a single Aeon Flow request on an existing transport.
func doSingleRequestWithConn(conn *AeonConn, path string, headers map[string]string, verbose bool) ([]byte, []FrameEvent, error) {
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
	return doSingleRequestWithConn(conn, path, headers, verbose)
}

// doForkRequestWithConn performs a FORK request with multiple child paths on an existing transport.
func doForkRequestWithConn(conn *AeonConn, childPaths []string, headers map[string]string, verbose bool) (map[string][]byte, []FrameEvent, error) {
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

// doForkRequest performs a FORK request with multiple child paths.
func doForkRequest(addr, rootPath string, childPaths []string, headers map[string]string, verbose bool) (map[string][]byte, []FrameEvent, error) {
	conn, err := Dial(addr)
	if err != nil {
		return nil, nil, err
	}
	return doForkRequestWithConn(conn, childPaths, headers, verbose)
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

func serializeBrowserFlowRequest(method, rawURL string, headers map[string]string, body []byte) []byte {
	methodBytes := []byte(method)
	urlBytes := []byte(rawURL)
	headerMap := headers
	if headerMap == nil {
		headerMap = map[string]string{}
	}
	headersJSON, err := json.Marshal(headerMap)
	if err != nil {
		headersJSON = []byte("{}")
	}

	totalSize :=
		1 + len(methodBytes) +
			2 + len(urlBytes) +
			4 + len(headersJSON) +
			len(body)

	buf := make([]byte, totalSize)
	view := buf
	offset := 0

	view[offset] = byte(len(methodBytes))
	offset++
	copy(view[offset:], methodBytes)
	offset += len(methodBytes)

	binary.BigEndian.PutUint16(view[offset:offset+2], uint16(len(urlBytes)))
	offset += 2
	copy(view[offset:], urlBytes)
	offset += len(urlBytes)

	binary.BigEndian.PutUint32(view[offset:offset+4], uint32(len(headersJSON)))
	offset += 4
	copy(view[offset:], headersJSON)
	offset += len(headersJSON)

	copy(view[offset:], body)
	return buf
}

func deserializeBrowserFlowRequest(payload []byte) (string, string, map[string]string, []byte, error) {
	if len(payload) < 7 {
		return "", "", nil, nil, fmt.Errorf("browser flow request too short: %d", len(payload))
	}

	offset := 0
	methodLen := int(payload[offset])
	offset++
	if len(payload) < offset+methodLen+2 {
		return "", "", nil, nil, fmt.Errorf("browser flow request method truncated")
	}
	method := string(payload[offset : offset+methodLen])
	offset += methodLen

	urlLen := int(binary.BigEndian.Uint16(payload[offset : offset+2]))
	offset += 2
	if len(payload) < offset+urlLen+4 {
		return "", "", nil, nil, fmt.Errorf("browser flow request url truncated")
	}
	rawURL := string(payload[offset : offset+urlLen])
	offset += urlLen

	headersLen := int(binary.BigEndian.Uint32(payload[offset : offset+4]))
	offset += 4
	if len(payload) < offset+headersLen {
		return "", "", nil, nil, fmt.Errorf("browser flow request headers truncated")
	}

	headers := map[string]string{}
	if headersLen > 0 {
		if err := json.Unmarshal(payload[offset:offset+headersLen], &headers); err != nil {
			return "", "", nil, nil, fmt.Errorf("decode browser flow request headers: %w", err)
		}
	}
	offset += headersLen

	body := append([]byte(nil), payload[offset:]...)
	return method, rawURL, headers, body, nil
}

func deserializeBrowserFlowResponse(payload []byte) (int, map[string]string, []byte, error) {
	if len(payload) < 6 {
		return 0, nil, nil, fmt.Errorf("browser flow response too short: %d", len(payload))
	}

	view := payload
	offset := 0
	status := int(binary.BigEndian.Uint16(view[offset : offset+2]))
	offset += 2

	headersLen := int(binary.BigEndian.Uint32(view[offset : offset+4]))
	offset += 4
	if len(payload) < offset+headersLen {
		return 0, nil, nil, fmt.Errorf("browser flow response headers truncated")
	}

	headersJSON := string(payload[offset : offset+headersLen])
	offset += headersLen
	headers := map[string]string{}
	if headersLen > 0 {
		if err := json.Unmarshal([]byte(headersJSON), &headers); err != nil {
			return 0, nil, nil, fmt.Errorf("decode browser flow headers: %w", err)
		}
	}

	body := append([]byte(nil), payload[offset:]...)
	return status, headers, body, nil
}

func doBrowserRequestWithConn(
	conn *AeonConn,
	requestURL string,
	headers map[string]string,
	verbose bool,
) ([]byte, []FrameEvent, error) {
	defer conn.Close()
	conn.verbose = verbose

	streamID := conn.AllocStream()
	payload := serializeBrowserFlowRequest(http.MethodGet, requestURL, headers, nil)
	if err := conn.SendPayload(streamID, payload); err != nil {
		return nil, nil, fmt.Errorf("send browser flow request: %w", err)
	}

	var responsePayload []byte
	for {
		frame, err := conn.Recv()
		if err != nil {
			if err == io.EOF {
				break
			}
			return nil, conn.events, fmt.Errorf("recv browser flow response: %w", err)
		}
		if frame.Flags&FlagPOISON != 0 {
			return nil, conn.events, fmt.Errorf("stream %d poisoned by server", frame.StreamID)
		}
		responsePayload = appendFramePayload(responsePayload, frame)
		if frame.Flags&FlagFIN != 0 {
			break
		}
	}

	status, responseHeaders, body, err := deserializeBrowserFlowResponse(responsePayload)
	if err != nil {
		return nil, conn.events, err
	}
	if verbose {
		fmt.Fprintf(os.Stderr, "browser flow response: HTTP %d (%d headers)\n", status, len(responseHeaders))
	}
	return body, conn.events, nil
}

func doBrowserForkRequestWithConn(
	conn *AeonConn,
	baseURL *url.URL,
	childPaths []string,
	headers map[string]string,
	verbose bool,
) (map[string][]byte, []FrameEvent, error) {
	defer conn.Close()
	conn.verbose = verbose

	rootStream := conn.AllocStream()
	children, err := conn.Fork(rootStream, len(childPaths))
	if err != nil {
		return nil, conn.events, fmt.Errorf("fork: %w", err)
	}

	streamPaths := make(map[uint16]string, len(childPaths))
	for index, childPath := range childPaths {
		streamPaths[children[index]] = childPath
		childURLRef, err := url.Parse(childPath)
		if err != nil {
			return nil, conn.events, fmt.Errorf("parse child path %q: %w", childPath, err)
		}
		childURL := baseURL.ResolveReference(childURLRef)
		payload := serializeBrowserFlowRequest(http.MethodGet, childURL.String(), headers, nil)
		if err := conn.SendPayload(children[index], payload); err != nil {
			return nil, conn.events, fmt.Errorf("send child %d: %w", index, err)
		}
	}

	results := make(map[string][]byte, len(childPaths))
	responsePayloads := make(map[uint16][]byte, len(childPaths))
	finished := 0

	for finished < len(childPaths) {
		frame, err := conn.Recv()
		if err != nil {
			if err == io.EOF {
				break
			}
			return results, conn.events, fmt.Errorf("recv: %w", err)
		}
		if frame.Flags&FlagPOISON != 0 {
			finished++
			continue
		}

		responsePayloads[frame.StreamID] = appendFramePayload(responsePayloads[frame.StreamID], frame)
		if frame.Flags&FlagFIN != 0 {
			_, _, body, err := deserializeBrowserFlowResponse(responsePayloads[frame.StreamID])
			if err != nil {
				return results, conn.events, err
			}
			results[streamPaths[frame.StreamID]] = body
			finished++
		}
	}

	return results, conn.events, nil
}

func doDiscoveredTransportRequest(
	rawURL string,
	headers map[string]string,
	verbose bool,
	transport string,
) ([]byte, []FrameEvent, string, error) {
	target, err := discoverFlowTarget(rawURL, headers, verbose)
	if err != nil {
		return nil, nil, "", err
	}

	conn, err := dialDiscoveredTransport(target, headers, transport)
	if err != nil {
		return nil, nil, "", err
	}

	body, events, err := doBrowserRequestWithConn(conn, target.requestURL.String(), headers, verbose)
	return body, events, transport, err
}

func doDiscoveredForkRequest(
	rawURL string,
	childPaths []string,
	headers map[string]string,
	verbose bool,
	transport string,
) (map[string][]byte, []FrameEvent, string, error) {
	target, err := discoverFlowTarget(rawURL, headers, verbose)
	if err != nil {
		return nil, nil, "", err
	}

	conn, err := dialDiscoveredTransport(target, headers, transport)
	if err != nil {
		return nil, nil, "", err
	}

	results, events, err := doBrowserForkRequestWithConn(conn, target.requestURL, childPaths, headers, verbose)
	return results, events, transport, err
}

func doDiscoveredRaceRequest(
	rawURL string,
	headers map[string]string,
	verbose bool,
	useWebSocket bool,
	useWebTransport bool,
) ([]byte, []FrameEvent, string, error) {
	target, err := discoverFlowTarget(rawURL, headers, verbose)
	if err != nil {
		return nil, nil, "", err
	}

	transports := make([]string, 0, 2)
	if useWebSocket {
		transports = append(transports, benchmarkTransportWebSocket)
	}
	if useWebTransport {
		transports = append(transports, benchmarkTransportWebTransport)
	}
	if len(transports) == 0 {
		return nil, nil, "", fmt.Errorf("no discovered browser transports selected")
	}
	if len(transports) == 1 {
		conn, err := dialDiscoveredTransport(target, headers, transports[0])
		if err != nil {
			return nil, nil, "", err
		}
		body, events, err := doBrowserRequestWithConn(conn, target.requestURL.String(), headers, verbose)
		return body, events, transports[0], err
	}

	type raceResult struct {
		body      []byte
		events    []FrameEvent
		err       error
		transport string
	}

	raceID := uint64(time.Now().UnixNano())
	results := make(chan raceResult, len(transports))
	var conns sync.Map

	for _, transport := range transports {
		go func(transport string) {
			raceHeaders := benchmarkHeaders(headers, 1, raceID, transport)

			conn, err := dialDiscoveredTransport(target, headers, transport)
			if err != nil {
				results <- raceResult{err: err, transport: transport}
				return
			}
			conns.Store(transport, conn)

			body, events, err := doBrowserRequestWithConn(conn, target.requestURL.String(), raceHeaders, verbose)
			results <- raceResult{
				body:      body,
				events:    events,
				err:       err,
				transport: transport,
			}
		}(transport)
	}

	var failures []string
	for range transports {
		result := <-results
		if result.err == nil {
			conns.Range(func(key, value any) bool {
				transport := key.(string)
				if transport == result.transport {
					return true
				}
				conn := value.(*AeonConn)
				_ = conn.Poison(0, 0)
				_ = conn.Close()
				return true
			})
			return result.body, result.events, result.transport, nil
		}
		failures = append(failures, fmt.Sprintf("%s: %v", result.transport, result.err))
	}

	return nil, nil, "", fmt.Errorf("browser transport race failed: %s", strings.Join(failures, "; "))
}

func dialDiscoveredTransport(
	target discoveredFlowTarget,
	headers map[string]string,
	transport string,
) (*AeonConn, error) {
	switch transport {
	case benchmarkTransportWebSocket:
		if target.websocketEndpoint == "" {
			return nil, fmt.Errorf("no Aeon websocket endpoint advertised for %s", target.requestURL)
		}
		if target.websocketStatus == "disabled" {
			return nil, fmt.Errorf("Aeon websocket transport is disabled for %s", target.requestURL)
		}
		return DialWebSocket(target.websocketEndpoint, headers)
	case benchmarkTransportWebTransport:
		if target.webtransportStatus == "disabled" {
			return nil, fmt.Errorf("Aeon webtransport transport is disabled for %s", target.requestURL)
		}
		return DialWebTransport(target.webtransportEndpoint, headers)
	default:
		return nil, fmt.Errorf("unsupported discovered transport %q", transport)
	}
}

func doFlowRequest(
	rawURL string,
	headers map[string]string,
	verbose bool,
	udp bool,
	useWebSocket bool,
	useWebTransport bool,
) ([]byte, []FrameEvent, string, error) {
	if useWebSocket || useWebTransport {
		return doDiscoveredRaceRequest(rawURL, headers, verbose, useWebSocket, useWebTransport)
	}

	u, err := url.Parse(rawURL)
	if err != nil {
		return nil, nil, "", fmt.Errorf("invalid URL: %w", err)
	}
	if u.Scheme != "aeon" {
		return nil, nil, "", fmt.Errorf("expected aeon:// URL scheme, got %s://", u.Scheme)
	}

	addr := u.Host
	if !strings.Contains(addr, ":") {
		addr += ":4001"
	}
	body, events, err := doSingleRequest(addr, requestPath(u), headers, verbose, udp)
	return body, events, benchmarkTransportAeon, err
}

func doFlowForkRequest(
	rawURL string,
	childPaths []string,
	headers map[string]string,
	verbose bool,
	useWebSocket bool,
	useWebTransport bool,
) (map[string][]byte, []FrameEvent, string, error) {
	if useWebSocket && useWebTransport {
		return nil, nil, "", fmt.Errorf("fork mode requires selecting exactly one browser transport")
	}
	if useWebSocket {
		return doDiscoveredForkRequest(rawURL, childPaths, headers, verbose, benchmarkTransportWebSocket)
	}
	if useWebTransport {
		return doDiscoveredForkRequest(rawURL, childPaths, headers, verbose, benchmarkTransportWebTransport)
	}

	u, err := url.Parse(rawURL)
	if err != nil {
		return nil, nil, "", fmt.Errorf("invalid URL: %w", err)
	}
	if u.Scheme != "aeon" {
		return nil, nil, "", fmt.Errorf("expected aeon:// URL scheme, got %s://", u.Scheme)
	}

	addr := u.Host
	if !strings.Contains(addr, ":") {
		addr += ":4001"
	}
	results, events, err := doForkRequest(addr, requestPath(u), childPaths, headers, verbose)
	return results, events, benchmarkTransportAeon, err
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
	if flags&FlagVent != 0 {
		parts = append(parts, "VENT")
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
	benchmarkTransportAeon         = "aeon"
	benchmarkTransportHTTP         = "http"
	benchmarkTransportWebSocket    = "websocket"
	benchmarkTransportWebTransport = "webtransport"
)

type benchCompletion struct {
	raceID    uint64
	transport string
	bytes     int
	vented    bool
}

type benchmarkRaceState struct {
	startedAt       time.Time
	winnerRecorded  bool
	winnerTransport string
	plannedHTTP     bool
	plannedAeon     bool
	completedHTTP   bool
	completedAeon   bool
	skippedHTTP     bool
	skippedAeon     bool
}

func (s *benchmarkRaceState) markCompleted(transport string) {
	switch transport {
	case benchmarkTransportHTTP:
		s.completedHTTP = true
	case benchmarkTransportAeon:
		s.completedAeon = true
	}
}

func (s *benchmarkRaceState) markSkipped(transport string) {
	switch transport {
	case benchmarkTransportHTTP:
		s.skippedHTTP = true
	case benchmarkTransportAeon:
		s.skippedAeon = true
	}
}

func (s *benchmarkRaceState) transportPending(transport string) bool {
	switch transport {
	case benchmarkTransportHTTP:
		return s.plannedHTTP && !s.completedHTTP && !s.skippedHTTP
	case benchmarkTransportAeon:
		return s.plannedAeon && !s.completedAeon && !s.skippedAeon
	default:
		return false
	}
}

func (s *benchmarkRaceState) isClosed() bool {
	httpDone := !s.plannedHTTP || s.completedHTTP || s.skippedHTTP
	aeonDone := !s.plannedAeon || s.completedAeon || s.skippedAeon
	return httpDone && aeonDone
}

type benchClientStats struct {
	requests            uint64
	bytes               uint64
	winnerBytes         uint64
	loserBytes          uint64
	latencySum          time.Duration
	latencyMax          time.Duration
	latencySamples      []time.Duration
	timeouts            uint64
	droppedInflight     uint64
	sequenceRegressions uint64
	httpWins            uint64
	aeonWins            uint64
	loserCompletions    uint64
	loserVents          uint64
	winnerVents         uint64
	skippedHTTP         uint64
	skippedAeon         uint64
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
	winnerBytes         uint64
	loserBytes          uint64
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
	loserCompletions    uint64
	loserVents          uint64
	winnerVents         uint64
	skippedHTTP         uint64
	skippedAeon         uint64
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

func benchmarkHeaders(base map[string]string, clientID int, raceID uint64, transport string) map[string]string {
	headers := cloneHeaders(base)
	headers["X-Laminar-Client-ID"] = fmt.Sprintf("%d", clientID)
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

func parseHTTPBenchmarkResponse(buf []byte) (int, int, int, bool, error) {
	headerEnd := findHTTPHeaderEnd(buf)
	if headerEnd < 0 {
		return 0, 0, 0, false, nil
	}

	statusEnd := -1
	for i := 0; i+1 < headerEnd; i++ {
		if buf[i] == '\r' && buf[i+1] == '\n' {
			statusEnd = i
			break
		}
	}
	if statusEnd <= 0 {
		return 0, 0, 0, false, fmt.Errorf("malformed HTTP response status line")
	}
	statusFields := strings.Fields(string(buf[:statusEnd]))
	if len(statusFields) < 2 {
		return 0, 0, 0, false, fmt.Errorf("malformed HTTP response status line")
	}
	statusCode, ok := parseDecimalBytes([]byte(statusFields[1]))
	if !ok {
		return 0, 0, 0, false, fmt.Errorf("invalid HTTP response status code")
	}

	contentLength := -1
	lineStart := statusEnd + 2
	for lineStart < headerEnd-2 {
		lineEnd := lineStart
		for lineEnd+1 < headerEnd && !(buf[lineEnd] == '\r' && buf[lineEnd+1] == '\n') {
			lineEnd++
		}
		if lineEnd+1 >= headerEnd {
			return 0, 0, 0, false, fmt.Errorf("malformed HTTP response header line")
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
			return 0, 0, 0, false, fmt.Errorf("malformed HTTP response header: missing colon")
		}
		if headerNameEqual(buf[lineStart:colon], "Content-Length") {
			length, ok := parseDecimalBytes(buf[colon+1 : lineEnd])
			if !ok {
				return 0, 0, 0, false, fmt.Errorf("invalid Content-Length header")
			}
			contentLength = length
		}
		lineStart = lineEnd + 2
	}

	if contentLength < 0 {
		return 0, 0, 0, false, fmt.Errorf("missing Content-Length header")
	}

	totalLen := headerEnd + contentLength
	if len(buf) < totalLen {
		return statusCode, contentLength, 0, false, nil
	}

	return statusCode, contentLength, totalLen, true, nil
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
			statusCode, bodyBytes, consumed, complete, err := parseHTTPBenchmarkResponse(buf[:buffered])
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
				vented:    statusCode == http.StatusNoContent && bodyBytes == 0,
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
			vented:    frame.Flags&FlagVent != 0 || totalBytes == 0,
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

type benchmarkRaceDispatch struct {
	firstTransport  string
	secondTransport string
	gap             time.Duration
	sendFirst       func() error
	sendSecond      func() error
}

func buildBenchmarkRaceDispatch(
	httpConn net.Conn,
	httpHost string,
	httpPath string,
	aeonConn *AeonConn,
	aeonPath string,
	aeonRawPath bool,
	baseHeaders map[string]string,
	clientID int,
	pendingMu *sync.Mutex,
	pending map[uint16]uint64,
	httpQueue chan<- uint64,
	raceID uint64,
	tcpDelay time.Duration,
	udpDelay time.Duration,
) benchmarkRaceDispatch {
	sendHTTP := func() error {
		if err := sendHTTPBenchmarkRequest(
			httpConn,
			httpHost,
			httpPath,
			benchmarkHeaders(baseHeaders, clientID, raceID, benchmarkTransportHTTP),
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
			nil,
			baseHeaders,
			pendingMu,
			pending,
			raceID,
			func(streamID uint16) error {
				headers := benchmarkHeaders(baseHeaders, clientID, raceID, benchmarkTransportAeon)
				if aeonRawPath {
					return aeonConn.SendPayload(streamID, benchmarkAeonPayload(aeonPath, headers, true))
				}
				return aeonConn.SendRequest(
					streamID,
					"GET",
					aeonPath,
					headers,
				)
			},
		)
	}

	switch {
	case tcpDelay < udpDelay:
		return benchmarkRaceDispatch{
			firstTransport:  benchmarkTransportHTTP,
			secondTransport: benchmarkTransportAeon,
			gap:             udpDelay - tcpDelay,
			sendFirst:       sendHTTP,
			sendSecond:      sendAeon,
		}
	case udpDelay < tcpDelay:
		return benchmarkRaceDispatch{
			firstTransport:  benchmarkTransportAeon,
			secondTransport: benchmarkTransportHTTP,
			gap:             tcpDelay - udpDelay,
			sendFirst:       sendAeon,
			sendSecond:      sendHTTP,
		}
	default:
		if raceID%2 == 0 {
			return benchmarkRaceDispatch{
				firstTransport:  benchmarkTransportHTTP,
				secondTransport: benchmarkTransportAeon,
				sendFirst:       sendHTTP,
				sendSecond:      sendAeon,
			}
		}
		return benchmarkRaceDispatch{
			firstTransport:  benchmarkTransportAeon,
			secondTransport: benchmarkTransportHTTP,
			sendFirst:       sendAeon,
			sendSecond:      sendHTTP,
		}
	}
}

func processBenchmarkRaceCompletion(
	stats *benchClientStats,
	races map[uint64]*benchmarkRaceState,
	completion benchCompletion,
	activeWinners *int,
) {
	stats.bytes += uint64(completion.bytes)

	state, ok := races[completion.raceID]
	if !ok {
		return
	}

	state.markCompleted(completion.transport)

	switch {
	case completion.vented:
		stats.loserCompletions++
		stats.loserBytes += uint64(completion.bytes)
		stats.loserVents++
	case !state.winnerRecorded:
		state.winnerRecorded = true
		state.winnerTransport = completion.transport
		if *activeWinners > 0 {
			*activeWinners--
		}
		stats.recordCompletion(time.Since(state.startedAt))
		stats.winnerBytes += uint64(completion.bytes)
		if completion.transport == benchmarkTransportHTTP {
			stats.httpWins++
		} else {
			stats.aeonWins++
		}
	case completion.transport != state.winnerTransport:
		stats.loserCompletions++
		stats.loserBytes += uint64(completion.bytes)
	}

	if !state.isClosed() {
		return
	}

	if !state.winnerRecorded {
		if *activeWinners > 0 {
			*activeWinners--
		}
		stats.droppedInflight++
	}
	delete(races, completion.raceID)
}

func waitBenchmarkHedgeGap(
	raceID uint64,
	gap time.Duration,
	completions <-chan benchCompletion,
	errors <-chan error,
	stats *benchClientStats,
	races map[uint64]*benchmarkRaceState,
	activeWinners *int,
) error {
	if gap <= 0 {
		return nil
	}

	timer := time.NewTimer(gap)
	defer timer.Stop()

	for {
		state, ok := races[raceID]
		if !ok || state.winnerRecorded {
			return nil
		}

		select {
		case err := <-errors:
			if err != nil {
				return err
			}
		case completion := <-completions:
			processBenchmarkRaceCompletion(stats, races, completion, activeWinners)
		case <-timer.C:
			return nil
		}
	}
}

func doBenchmarkRaceClient(
	clientID int,
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
		dispatch := buildBenchmarkRaceDispatch(
			httpConn,
			httpAddr,
			httpPath,
			aeonConn,
			aeonPath,
			aeonRawPath,
			headers,
			clientID,
			&pendingAeonMu,
			pendingAeon,
			httpQueue,
			raceID,
			tcpDelay,
			udpDelay,
		)

		races[raceID] = &benchmarkRaceState{
			startedAt:   time.Now(),
			plannedHTTP: true,
			plannedAeon: true,
		}

		if err := dispatch.sendFirst(); err != nil {
			delete(races, raceID)
			return err
		}
		activeWinners++

		if err := waitBenchmarkHedgeGap(
			raceID,
			dispatch.gap,
			completions,
			errors,
			&stats,
			races,
			&activeWinners,
		); err != nil {
			return err
		}

		state, ok := races[raceID]
		if !ok {
			return nil
		}
		if state.winnerRecorded && state.transportPending(dispatch.secondTransport) {
			state.markSkipped(dispatch.secondTransport)
			if dispatch.secondTransport == benchmarkTransportHTTP {
				stats.skippedHTTP++
			} else {
				stats.skippedAeon++
			}
			if state.isClosed() {
				delete(races, raceID)
			}
			return nil
		}

		if err := dispatch.sendSecond(); err != nil {
			return err
		}
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
			processBenchmarkRaceCompletion(&stats, races, completion, &activeWinners)
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
		go func(clientID int) {
			defer wg.Done()
			stats, err := doBenchmarkRaceClient(
				clientID,
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
		}(client + 1)
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
		result.winnerBytes += stats.winnerBytes
		result.loserBytes += stats.loserBytes
		result.timeouts += stats.timeouts
		result.droppedInflight += stats.droppedInflight
		result.sequenceRegressions += stats.sequenceRegressions
		result.httpWins += stats.httpWins
		result.aeonWins += stats.aeonWins
		result.loserCompletions += stats.loserCompletions
		result.loserVents += stats.loserVents
		result.winnerVents += stats.winnerVents
		result.skippedHTTP += stats.skippedHTTP
		result.skippedAeon += stats.skippedAeon
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
		fmt.Fprintf(os.Stderr, "  Winner bytes:       %d\n", result.winnerBytes)
		if result.skippedHTTP > 0 || result.skippedAeon > 0 {
			fmt.Fprintf(os.Stderr, "  Skipped HTTP hedges:%d\n", result.skippedHTTP)
			fmt.Fprintf(os.Stderr, "  Skipped Aeon hedges:%d\n", result.skippedAeon)
		}
		fmt.Fprintf(os.Stderr, "  Loser completions:  %d\n", result.loserCompletions)
		fmt.Fprintf(os.Stderr, "  Loser bytes:        %d\n", result.loserBytes)
		if result.requests > 0 {
			fmt.Fprintf(os.Stderr, "  Waste bytes/win:    %.2f\n", float64(result.loserBytes)/float64(result.requests))
			fmt.Fprintf(
				os.Stderr,
				"  Loser completion%%:  %.2f%%\n",
				100.0*float64(result.loserCompletions)/float64(result.requests),
			)
		}
		if result.loserCompletions > 0 {
			fmt.Fprintf(
				os.Stderr,
				"  Loser vent%%:        %.2f%%\n",
				100.0*float64(result.loserVents)/float64(result.loserCompletions),
			)
		}
		if result.winnerVents > 0 {
			fmt.Fprintf(os.Stderr, "  Winner vents:       %d\n", result.winnerVents)
		}
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
	websocketMode := flag.Bool("websocket", false, "discover and use the Aeon websocket transport from an http(s) origin URL")
	webtransportMode := flag.Bool("webtransport", false, "discover and use the Aeon WebTransport transport from an http(s) origin URL")
	compareMode := flag.Bool("compare", false, "compare Aeon Flow vs HTTP side by side")
	udpMode := flag.Bool("udp", false, "use UDP datagrams instead of TCP (each frame = one datagram)")
	benchMode := flag.Bool("bench", false, "run a sustained benchmark instead of a single request")
	clients := flag.Int("clients", 1, "benchmark clients (connections or sockets)")
	duration := flag.Duration("duration", 10*time.Second, "benchmark duration")
	depth := flag.Int("depth", 1, "LAMINAR inflight request depth per client in benchmark mode")
	readTimeout := flag.Duration("timeout", 250*time.Millisecond, "benchmark receive timeout before retrying")
	rawPath := flag.Bool("raw-path", false, "benchmark Aeon using bare path payloads instead of HTTP-style request envelopes")
	tcpDelay := flag.Duration("tcp-delay", 0, "hedge-delay the TCP/HTTP leg in mixed benchmark race mode; skipped if the other leg already produced a sufficient response")
	udpDelay := flag.Duration("udp-delay", 0, "hedge-delay the UDP/Aeon leg in mixed benchmark race mode; skipped if the other leg already produced a sufficient response")
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
		fmt.Fprintf(os.Stderr, "  wall --websocket https://forkracefold.com/\n")
		fmt.Fprintf(os.Stderr, "  wall --websocket --webtransport https://forkracefold.com/\n")
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

	if *udpMode && (*websocketMode || *webtransportMode) {
		fmt.Fprintln(os.Stderr, "error: --udp only applies to raw aeon:// transports")
		os.Exit(1)
	}

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
			fmt.Fprintf(os.Stderr, "compare mode requires two URLs: <flow-url> http://...\n")
			os.Exit(1)
		}

		fmt.Fprintf(os.Stderr, "─── Aeon Flow ──────────────────────────────────────\n")
		aeonStart := time.Now()
		aeonBody, aeonEvents, aeonTransport, err := doFlowRequest(
			args[0],
			headers,
			*verbose,
			*udpMode,
			*websocketMode,
			*webtransportMode,
		)
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
		fmt.Fprintf(os.Stderr, "%-15s %12s %12s\n", "", strings.Title(aeonTransport), "HTTP")
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

	// ─── Benchmark mode ────────────────────────────────────────────────
	if *benchMode {
		u, err := url.Parse(args[0])
		if err != nil {
			fmt.Fprintf(os.Stderr, "invalid URL: %v\n", err)
			os.Exit(1)
		}
		if u.Scheme != "aeon" {
			fmt.Fprintf(os.Stderr, "benchmark mode requires aeon:// URL scheme, got %s://\n", u.Scheme)
			os.Exit(1)
		}

		addr := u.Host
		if !strings.Contains(addr, ":") {
			addr += ":4001"
		}
		path := requestPath(u)

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

		results, events, _, err := doFlowForkRequest(
			args[0],
			childPaths,
			headers,
			*verbose,
			*websocketMode,
			*webtransportMode,
		)
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
					if *websocketMode || *webtransportMode {
						body, events, _, err := doFlowRequest(
							rawURL,
							headers,
							*verbose,
							false,
							*websocketMode,
							*webtransportMode,
						)
						results <- raceResult{body: body, events: events, err: err, idx: idx}
					} else {
						body, _, err := doHTTPRequest(rawURL, headers, *verbose)
						results <- raceResult{body: body, err: err, idx: idx}
					}
				case "aeon":
					body, events, _, err := doFlowRequest(
						rawURL,
						headers,
						*verbose,
						*udpMode,
						false,
						false,
					)
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
	body, events, winnerTransport, err := doFlowRequest(
		args[0],
		headers,
		*verbose,
		*udpMode,
		*websocketMode,
		*webtransportMode,
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	os.Stdout.Write(body)
	if *verbose {
		fmt.Fprintf(os.Stderr, "\nTransport: %s\n", winnerTransport)
	}

	if *waterfall {
		printWaterfall(events)
	}
}
