package main

import (
	"bufio"
	"encoding/binary"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"runtime"
	"strings"
	"sync"
	"testing"
	"time"
)

func TestBenchmarkHeadersAddRaceMetadata(t *testing.T) {
	base := map[string]string{"Accept": "*/*"}
	headers := benchmarkHeaders(base, 42, benchmarkTransportAeon)

	if headers["X-Laminar-Race-ID"] != "42" {
		t.Fatalf("expected race header 42, got %q", headers["X-Laminar-Race-ID"])
	}
	if headers["X-Laminar-Transport"] != benchmarkTransportAeon {
		t.Fatalf("expected transport header %q, got %q", benchmarkTransportAeon, headers["X-Laminar-Transport"])
	}
	if headers["Accept"] != "*/*" {
		t.Fatalf("expected original header to survive, got %q", headers["Accept"])
	}
	if _, ok := base["X-Laminar-Race-ID"]; ok {
		t.Fatalf("expected benchmarkHeaders to clone instead of mutating the base map")
	}
}

func TestParseHeadersSupportsRepeatedValues(t *testing.T) {
	headers := parseHeaders([]string{
		"Accept: */*",
		"X-Aeon-Tier: pro",
		"BrokenHeader",
	})

	if headers["Accept"] != "*/*" {
		t.Fatalf("expected Accept header, got %q", headers["Accept"])
	}
	if headers["X-Aeon-Tier"] != "pro" {
		t.Fatalf("expected X-Aeon-Tier header, got %q", headers["X-Aeon-Tier"])
	}
	if _, ok := headers["BrokenHeader"]; ok {
		t.Fatalf("expected malformed header to be ignored")
	}
}

func TestApplyPropagatedAuthHeadersAddsTrustedSnapshot(t *testing.T) {
	base := map[string]string{"Accept": "*/*"}
	headers := applyPropagatedAuthHeaders(base, propagatedAuthOptions{
		actor:      "did:key:test-user",
		tier:       "enterprise",
		flags:      "alpha,beta",
		requestPID: "request:abc|feedface|0",
	})

	if headers["X-Aeon-Auth-Verified"] != "1" {
		t.Fatalf("expected trusted snapshot marker, got %q", headers["X-Aeon-Auth-Verified"])
	}
	if headers["X-Aeon-Auth-Source"] != "propagated" {
		t.Fatalf("expected default propagated source, got %q", headers["X-Aeon-Auth-Source"])
	}
	if headers["X-Aeon-Actor"] != "did:key:test-user" {
		t.Fatalf("expected actor DID, got %q", headers["X-Aeon-Actor"])
	}
	if headers["X-Aeon-Tier"] != "enterprise" {
		t.Fatalf("expected propagated tier, got %q", headers["X-Aeon-Tier"])
	}
	if headers["X-Aeon-Flags"] != "alpha,beta" {
		t.Fatalf("expected propagated flags, got %q", headers["X-Aeon-Flags"])
	}
	if headers["X-Aeon-Request-Pid"] != "request:abc|feedface|0" {
		t.Fatalf("expected request pid, got %q", headers["X-Aeon-Request-Pid"])
	}
	if headers["X-Aeon-Supervisor-Pid"] != "request:abc|feedface|0" {
		t.Fatalf("expected supervisor pid to default to request pid, got %q", headers["X-Aeon-Supervisor-Pid"])
	}
	if base["Accept"] != "*/*" {
		t.Fatalf("expected base map to remain unchanged")
	}
	if _, ok := base["X-Aeon-Auth-Verified"]; ok {
		t.Fatalf("expected propagated auth helper to clone instead of mutating the base map")
	}
}

func TestDoHTTPRequestSendsPropagatedAuthHeaders(t *testing.T) {
	received := make(chan http.Header, 1)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		received <- r.Header.Clone()
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	}))
	defer server.Close()

	headers := applyPropagatedAuthHeaders(map[string]string{
		"Accept": "*/*",
	}, propagatedAuthOptions{
		actor:      "did:key:test-user",
		audience:   "did:web:x-gnosis.test",
		tier:       "enterprise",
		flags:      "alpha,beta",
		requestPID: "request:abc|feedface|0",
	})

	body, _, err := doHTTPRequest(server.URL, headers, false)
	if err != nil {
		t.Fatalf("doHTTPRequest: %v", err)
	}
	if string(body) != "ok" {
		t.Fatalf("expected body ok, got %q", string(body))
	}

	select {
	case got := <-received:
		if got.Get("X-Aeon-Auth-Verified") != "1" {
			t.Fatalf("expected verified header, got %q", got.Get("X-Aeon-Auth-Verified"))
		}
		if got.Get("X-Aeon-Actor") != "did:key:test-user" {
			t.Fatalf("expected actor header, got %q", got.Get("X-Aeon-Actor"))
		}
		if got.Get("X-Aeon-Audience") != "did:web:x-gnosis.test" {
			t.Fatalf("expected audience header, got %q", got.Get("X-Aeon-Audience"))
		}
		if got.Get("X-Aeon-Tier") != "enterprise" {
			t.Fatalf("expected tier header, got %q", got.Get("X-Aeon-Tier"))
		}
		if got.Get("X-Aeon-Flags") != "alpha,beta" {
			t.Fatalf("expected flags header, got %q", got.Get("X-Aeon-Flags"))
		}
		if got.Get("X-Aeon-Request-Pid") != "request:abc|feedface|0" {
			t.Fatalf("expected request pid header, got %q", got.Get("X-Aeon-Request-Pid"))
		}
		if got.Get("X-Aeon-Supervisor-Pid") != "request:abc|feedface|0" {
			t.Fatalf("expected supervisor pid header, got %q", got.Get("X-Aeon-Supervisor-Pid"))
		}
	case <-time.After(2 * time.Second):
		t.Fatalf("timed out waiting for HTTP server to receive request")
	}
}

func TestAwaitBenchmarkStartWaitsForRelease(t *testing.T) {
	start := make(chan struct{})
	abort := make(chan struct{})
	ready := make(chan struct{}, 1)
	done := make(chan bool, 1)

	go func() {
		done <- awaitBenchmarkStart(start, abort, ready, time.Now().Add(250*time.Millisecond))
	}()

	select {
	case <-ready:
	case <-time.After(50 * time.Millisecond):
		t.Fatalf("expected client to report ready before waiting on start")
	}

	select {
	case started := <-done:
		t.Fatalf("expected start gate to remain closed, got started=%t", started)
	case <-time.After(20 * time.Millisecond):
	}

	close(start)

	select {
	case started := <-done:
		if !started {
			t.Fatalf("expected start gate to release successfully")
		}
	case <-time.After(50 * time.Millisecond):
		t.Fatalf("timed out waiting for start gate release")
	}
}

func TestSendAeonBenchmarkRequestRegistersPendingBeforeSend(t *testing.T) {
	conn := &AeonConn{}
	pending := make(map[uint16]uint64)
	var pendingMu sync.Mutex

	err := sendAeonBenchmarkRequest(
		conn,
		"/ping",
		[]byte("/ping"),
		nil,
		&pendingMu,
		pending,
		77,
		func(streamID uint16) error {
			pendingMu.Lock()
			raceID, ok := pending[streamID]
			pendingMu.Unlock()
			if !ok {
				t.Fatalf("expected stream %d to be registered before send", streamID)
			}
			if raceID != 77 {
				t.Fatalf("expected race id 77, got %d", raceID)
			}
			return nil
		},
	)
	if err != nil {
		t.Fatalf("sendAeonBenchmarkRequest: %v", err)
	}
}

func TestSendAeonBenchmarkRequestRollsBackPendingOnError(t *testing.T) {
	conn := &AeonConn{}
	pending := make(map[uint16]uint64)
	var pendingMu sync.Mutex

	err := sendAeonBenchmarkRequest(
		conn,
		"/ping",
		[]byte("/ping"),
		nil,
		&pendingMu,
		pending,
		78,
		func(streamID uint16) error {
			pendingMu.Lock()
			_, ok := pending[streamID]
			pendingMu.Unlock()
			if !ok {
				t.Fatalf("expected stream %d to be registered before send error", streamID)
			}
			return io.ErrClosedPipe
		},
	)
	if err == nil {
		t.Fatalf("expected sendAeonBenchmarkRequest to return the send error")
	}

	pendingMu.Lock()
	defer pendingMu.Unlock()
	if len(pending) != 0 {
		t.Fatalf("expected pending map rollback after send error, found %d entries", len(pending))
	}
}

func TestParseHTTPBenchmarkResponseParsesPipelinedResponses(t *testing.T) {
	first := []byte("HTTP/1.1 200 OK\r\nContent-Length: 4\r\nConnection: keep-alive\r\n\r\npong")
	second := []byte("HTTP/1.1 200 OK\r\nServer: gnosis-uring\r\nContent-Length: 5\r\n\r\nhello")
	buf := append(append([]byte{}, first...), second...)

	bodyBytes, consumed, complete, err := parseHTTPBenchmarkResponse(buf)
	if err != nil {
		t.Fatalf("parse first response: %v", err)
	}
	if !complete {
		t.Fatalf("expected first response to be complete")
	}
	if bodyBytes != 4 {
		t.Fatalf("expected 4-byte body, got %d", bodyBytes)
	}
	if consumed != len(first) {
		t.Fatalf("expected to consume %d bytes, got %d", len(first), consumed)
	}

	bodyBytes, consumed, complete, err = parseHTTPBenchmarkResponse(buf[len(first):])
	if err != nil {
		t.Fatalf("parse second response: %v", err)
	}
	if !complete {
		t.Fatalf("expected second response to be complete")
	}
	if bodyBytes != 5 {
		t.Fatalf("expected 5-byte body, got %d", bodyBytes)
	}
	if consumed != len(second) {
		t.Fatalf("expected to consume %d bytes, got %d", len(second), consumed)
	}
}

func TestParseHTTPBenchmarkResponseWaitsForCompleteBody(t *testing.T) {
	incomplete := []byte("HTTP/1.1 200 OK\r\nContent-Length: 4\r\n\r\npo")

	bodyBytes, consumed, complete, err := parseHTTPBenchmarkResponse(incomplete)
	if err != nil {
		t.Fatalf("parse incomplete response: %v", err)
	}
	if complete {
		t.Fatalf("expected incomplete response, got body=%d consumed=%d", bodyBytes, consumed)
	}
}

func TestAppendFramePayloadIncludesFinPayload(t *testing.T) {
	frame := Frame{
		StreamID: 2,
		Sequence: 0,
		Flags:    FlagFIN,
		Length:   5,
		Payload:  []byte("hello"),
	}

	body := appendFramePayload(nil, frame)
	if string(body) != "hello" {
		t.Fatalf("expected FIN payload to be preserved, got %q", string(body))
	}
}

func TestRecvUDPReadsSingleDatagramFrame(t *testing.T) {
	server, err := net.ListenUDP("udp", &net.UDPAddr{IP: net.ParseIP("127.0.0.1"), Port: 0})
	if err != nil {
		t.Fatalf("listen udp: %v", err)
	}
	defer server.Close()

	responsePayload := []byte("pong")
	errs := make(chan error, 1)
	go func() {
		buf := make([]byte, 4096)
		_, addr, err := server.ReadFromUDP(buf)
		if err != nil {
			errs <- err
			return
		}

		frame := EncodeFrame(Frame{
			StreamID: 0,
			Sequence: 0,
			Flags:    FlagFIN,
			Length:   uint32(len(responsePayload)),
			Payload:  responsePayload,
		})
		_, err = server.WriteToUDP(frame, addr)
		errs <- err
	}()

	conn, err := DialUDP(server.LocalAddr().String())
	if err != nil {
		t.Fatalf("dial udp: %v", err)
	}
	defer conn.Close()

	if err := conn.SendRequest(conn.AllocStream(), "GET", "/ping", nil); err != nil {
		t.Fatalf("send request: %v", err)
	}

	frame, err := conn.Recv()
	if err != nil {
		t.Fatalf("recv udp frame: %v", err)
	}
	if string(frame.Payload) != "pong" {
		t.Fatalf("expected payload %q, got %q", "pong", string(frame.Payload))
	}
	if frame.Flags&FlagFIN == 0 {
		t.Fatalf("expected FIN flag to be set")
	}

	if err := <-errs; err != nil {
		t.Fatalf("udp server error: %v", err)
	}
}

func TestSendRequestUsesSingleFinDatagram(t *testing.T) {
	server, err := net.ListenUDP("udp", &net.UDPAddr{IP: net.ParseIP("127.0.0.1"), Port: 0})
	if err != nil {
		t.Fatalf("listen udp: %v", err)
	}
	defer server.Close()

	conn, err := DialUDP(server.LocalAddr().String())
	if err != nil {
		t.Fatalf("dial udp: %v", err)
	}
	defer conn.Close()

	if err := conn.SendRequest(conn.AllocStream(), "GET", "/ping", map[string]string{"Host": "localhost"}); err != nil {
		t.Fatalf("send request: %v", err)
	}

	buf := make([]byte, 4096)
	if err := server.SetReadDeadline(time.Now().Add(200 * time.Millisecond)); err != nil {
		t.Fatalf("set read deadline: %v", err)
	}

	n, _, err := server.ReadFromUDP(buf)
	if err != nil {
		t.Fatalf("read udp: %v", err)
	}

	frame, _, err := DecodeFrame(buf[:n])
	if err != nil {
		t.Fatalf("decode frame: %v", err)
	}
	if frame.Flags&FlagFIN == 0 {
		t.Fatalf("expected FIN flag on request frame")
	}
	if frame.Sequence != 0 {
		t.Fatalf("expected request sequence 0, got %d", frame.Sequence)
	}
	if !strings.Contains(string(frame.Payload), "GET /ping HTTP/1.1\r\n") {
		t.Fatalf("expected request payload, got %q", string(frame.Payload))
	}

	if err := server.SetReadDeadline(time.Now().Add(20 * time.Millisecond)); err != nil {
		t.Fatalf("set second read deadline: %v", err)
	}

	_, _, err = server.ReadFromUDP(buf)
	if err == nil {
		t.Fatalf("expected no second request datagram")
	}
	netErr, ok := err.(net.Error)
	if !ok || !netErr.Timeout() {
		t.Fatalf("expected timeout waiting for a second datagram, got %v", err)
	}
}

func TestDoBenchmarkRawPathSmoke(t *testing.T) {
	server, err := net.ListenUDP("udp", &net.UDPAddr{IP: net.ParseIP("127.0.0.1"), Port: 0})
	if err != nil {
		t.Fatalf("listen udp: %v", err)
	}
	defer server.Close()

	errs := make(chan error, 1)
	go func() {
		buf := make([]byte, 4096)
		for {
			n, addr, err := server.ReadFromUDP(buf)
			if err != nil {
				errs <- err
				return
			}

			frame, _, err := DecodeFrame(buf[:n])
			if err != nil {
				errs <- err
				return
			}
			if string(frame.Payload) != "/ping" {
				errs <- io.ErrUnexpectedEOF
				return
			}

			response := EncodeFrame(Frame{
				StreamID: frame.StreamID,
				Sequence: 0,
				Flags:    FlagFIN,
				Length:   4,
				Payload:  []byte("pong"),
			})
			if _, err := server.WriteToUDP(response, addr); err != nil {
				errs <- err
				return
			}
		}
	}()

	result, err := doBenchmark(server.LocalAddr().String(), "/ping", nil, true, true, 1, 2, 120*time.Millisecond, 20*time.Millisecond)
	if err != nil {
		t.Fatalf("doBenchmark raw path: %v", err)
	}
	if result.requests == 0 {
		t.Fatalf("expected raw-path benchmark to complete at least one request")
	}

	server.Close()
	if err := <-errs; err != nil && !strings.Contains(err.Error(), "use of closed network connection") {
		t.Fatalf("udp server error: %v", err)
	}
}

func TestDoBenchmarkSmoke(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen tcp: %v", err)
	}
	defer listener.Close()

	done := make(chan struct{})
	go func() {
		for {
			conn, err := listener.Accept()
			if err != nil {
				select {
				case <-done:
					return
				default:
					return
				}
			}

			go func(conn net.Conn) {
				defer conn.Close()
				for {
					header := make([]byte, HeaderSize)
					if _, err := io.ReadFull(conn, header); err != nil {
						return
					}

					streamID := binary.BigEndian.Uint16(header[0:2])
					payloadLen := uint32(header[7])<<16 | uint32(header[8])<<8 | uint32(header[9])

					if payloadLen > 0 {
						payload := make([]byte, payloadLen)
						if _, err := io.ReadFull(conn, payload); err != nil {
							return
						}
					}

					response := EncodeFrame(Frame{
						StreamID: streamID,
						Sequence: 0,
						Flags:    FlagFIN,
						Length:   4,
						Payload:  []byte("pong"),
					})
					if _, err := conn.Write(response); err != nil {
						return
					}
				}
			}(conn)
		}
	}()
	defer close(done)

	result, err := doBenchmark(listener.Addr().String(), "/ping", nil, false, false, 2, 4, 150*time.Millisecond, 50*time.Millisecond)
	if err != nil {
		t.Fatalf("doBenchmark: %v", err)
	}
	if result.requests == 0 {
		t.Fatalf("expected benchmark to complete at least one request")
	}
	if result.depth != 4 {
		t.Fatalf("expected depth 4, got %d", result.depth)
	}
}

func TestDoBenchmarkRaceSmoke(t *testing.T) {
	httpListener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen tcp: %v", err)
	}
	defer httpListener.Close()

	httpDone := make(chan struct{})
	go func() {
		for {
			conn, err := httpListener.Accept()
			if err != nil {
				select {
				case <-httpDone:
					return
				default:
					return
				}
			}

			go func(conn net.Conn) {
				defer conn.Close()
				reader := bufio.NewReader(conn)
				for {
					requestLine, err := reader.ReadString('\n')
					if err != nil {
						return
					}
					if !strings.HasPrefix(requestLine, "GET /ping HTTP/1.1") {
						return
					}

					for {
						headerLine, err := reader.ReadString('\n')
						if err != nil {
							return
						}
						if headerLine == "\r\n" {
							break
						}
					}

					time.Sleep(3 * time.Millisecond)
					if _, err := io.WriteString(conn, "HTTP/1.1 200 OK\r\nContent-Length: 4\r\nConnection: keep-alive\r\n\r\npong"); err != nil {
						return
					}
				}
			}(conn)
		}
	}()
	defer close(httpDone)

	udpServer, err := net.ListenUDP("udp", &net.UDPAddr{IP: net.ParseIP("127.0.0.1"), Port: 0})
	if err != nil {
		t.Fatalf("listen udp: %v", err)
	}
	defer udpServer.Close()

	udpDone := make(chan struct{})
	go func() {
		buf := make([]byte, 4096)
		for {
			n, addr, err := udpServer.ReadFromUDP(buf)
			if err != nil {
				select {
				case <-udpDone:
					return
				default:
					return
				}
			}

			frame, _, err := DecodeFrame(buf[:n])
			if err != nil || frame.Length == 0 {
				continue
			}

			response := EncodeFrame(Frame{
				StreamID: frame.StreamID,
				Sequence: 0,
				Flags:    FlagFIN,
				Length:   4,
				Payload:  []byte("pong"),
			})
			if _, err := udpServer.WriteToUDP(response, addr); err != nil {
				return
			}
		}
	}()
	defer close(udpDone)

	result, err := doBenchmarkRace(
		udpServer.LocalAddr().String(),
		"/ping",
		httpListener.Addr().String(),
		"/ping",
		nil,
		true,
		false,
		1,
		2,
		150*time.Millisecond,
		20*time.Millisecond,
		0,
		0,
	)
	if err != nil {
		t.Fatalf("doBenchmarkRace: %v", err)
	}
	if result.requests == 0 {
		t.Fatalf("expected mixed benchmark to complete at least one request")
	}
	if result.requests != result.aeonWins+result.httpWins {
		t.Fatalf("expected requests to equal winner counts, got requests=%d aeon=%d http=%d", result.requests, result.aeonWins, result.httpWins)
	}
	if result.aeonWins == 0 {
		t.Fatalf("expected UDP Aeon leg to win at least one race")
	}
}

func TestDoBenchmarkRaceWarmupScaleSmoke(t *testing.T) {
	httpListener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen tcp: %v", err)
	}
	defer httpListener.Close()

	httpDone := make(chan struct{})
	go func() {
		for {
			conn, err := httpListener.Accept()
			if err != nil {
				select {
				case <-httpDone:
					return
				default:
					return
				}
			}

			go func(conn net.Conn) {
				defer conn.Close()
				reader := bufio.NewReader(conn)
				for {
					requestLine, err := reader.ReadString('\n')
					if err != nil {
						return
					}
					if !strings.HasPrefix(requestLine, "GET /ping HTTP/1.1") {
						return
					}

					for {
						headerLine, err := reader.ReadString('\n')
						if err != nil {
							return
						}
						if headerLine == "\r\n" {
							break
						}
					}

					if _, err := io.WriteString(conn, "HTTP/1.1 200 OK\r\nContent-Length: 4\r\nConnection: keep-alive\r\n\r\npong"); err != nil {
						return
					}
				}
			}(conn)
		}
	}()
	defer close(httpDone)

	udpServer, err := net.ListenUDP("udp", &net.UDPAddr{IP: net.ParseIP("127.0.0.1"), Port: 0})
	if err != nil {
		t.Fatalf("listen udp: %v", err)
	}
	defer udpServer.Close()

	udpDone := make(chan struct{})
	go func() {
		buf := make([]byte, 4096)
		for {
			n, addr, err := udpServer.ReadFromUDP(buf)
			if err != nil {
				select {
				case <-udpDone:
					return
				default:
					return
				}
			}

			frame, _, err := DecodeFrame(buf[:n])
			if err != nil || frame.Length == 0 {
				continue
			}

			response := EncodeFrame(Frame{
				StreamID: frame.StreamID,
				Sequence: 0,
				Flags:    FlagFIN,
				Length:   4,
				Payload:  []byte("pong"),
			})
			if _, err := udpServer.WriteToUDP(response, addr); err != nil {
				return
			}
		}
	}()
	defer close(udpDone)

	type raceResult struct {
		result benchResult
		err    error
	}

	done := make(chan raceResult, 1)
	go func() {
		result, err := doBenchmarkRace(
			udpServer.LocalAddr().String(),
			"/ping",
			httpListener.Addr().String(),
			"/ping",
			nil,
			true,
			true,
			8,
			4,
			200*time.Millisecond,
			20*time.Millisecond,
			0,
			0,
		)
		done <- raceResult{result: result, err: err}
	}()

	select {
	case outcome := <-done:
		if outcome.err != nil {
			t.Fatalf("doBenchmarkRace scaled warmup: %v", outcome.err)
		}
		if outcome.result.requests == 0 {
			t.Fatalf("expected scaled warmup benchmark to complete at least one request")
		}
	case <-time.After(3 * time.Second):
		buf := make([]byte, 1<<20)
		n := runtime.Stack(buf, true)
		t.Fatalf("scaled warmup benchmark did not complete; likely mixed benchmark hang\n%s", string(buf[:n]))
	}
}
