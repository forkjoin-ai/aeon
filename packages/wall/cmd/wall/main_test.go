package main

import (
	"bufio"
	"encoding/binary"
	"io"
	"net"
	"strings"
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
