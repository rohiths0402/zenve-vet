import { useCallback, useEffect, useRef } from "react";
import { getAccessToken, getSocketUrl } from "../services/messageService";

const PING_INTERVAL = 25000;
const MAX_RETRY_DELAY = 15000;

export default function useChatSocket(onEvent) {
  const socketRef = useRef(null);
  const handlerRef = useRef(onEvent);

  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  const sendEvent = useCallback((payload) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  useEffect(() => {
    let stopped = false;
    let attempts = 0;
    let retryTimer = null;
    let pingTimer = null;

    const connect = () => {
      const token = getAccessToken();

      if (!token) {
        retryTimer = setTimeout(connect, 3000);
        return;
      }

      const socket = new WebSocket(getSocketUrl(), ["zenve", token]);
      socketRef.current = socket;

      socket.onopen = () => {
        attempts = 0;
        pingTimer = setInterval(() => {
          sendEvent({ type: "ping" });
        }, PING_INTERVAL);
      };

      socket.onmessage = (message) => {
        try {
          handlerRef.current(JSON.parse(message.data), sendEvent);
        } catch {
          return;
        }
      };

      socket.onclose = () => {
        clearInterval(pingTimer);

        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (stopped) return;

        handlerRef.current({ type: "socket.closed" }, sendEvent);

        const delay = Math.min(1000 * 2 ** attempts, MAX_RETRY_DELAY);
        attempts += 1;
        retryTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      clearInterval(pingTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [sendEvent]);

  return { sendEvent };
}
