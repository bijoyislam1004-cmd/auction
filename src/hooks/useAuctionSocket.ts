import { useState, useEffect, useRef, useCallback } from 'react';
import { AuctionState, WSMessage } from '../types/auction';
import { sounds } from '../utils/auctionUtils';
import confetti from 'canvas-confetti';

export function useAuctionSocket() {
  const [state, setState] = useState<AuctionState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isWsConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sound and visual effects handler
  const handleIncomingMessage = useCallback((msg: WSMessage) => {
    switch (msg.type) {
      case 'INIT_STATE':
      case 'STATE_UPDATE': {
        setState(msg.payload);
        break;
      }
      case 'BID_PLACED': {
        setState(msg.payload.state);
        sounds.playBidChime();
        break;
      }
      case 'HAMMER_EVENT': {
        setState(msg.payload.state);
        sounds.playGavel();
        break;
      }
      case 'SOUND': {
        if (msg.payload.sound === 'gavel') sounds.playGavel();
        else if (msg.payload.sound === 'bid') sounds.playBidChime();
        else if (msg.payload.sound === 'sold') {
          sounds.playSoldFanfare();
          try {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 }
            });
          } catch {
            // ignore confetti error if canvas unmounted
          }
        } else if (msg.payload.sound === 'unsold') {
          sounds.playUnsold();
        } else if (msg.payload.sound === 'countdown') {
          sounds.playTick();
        }
        break;
      }
      case 'ERROR': {
        setErrorMessage(msg.payload.message);
        break;
      }
    }
  }, []);

  // Primary WebSocket & Seamless SSE Fallback
  useEffect(() => {
    let unmounted = false;

    // Fetch initial state first
    fetch('/api/state')
      .then(res => res.json())
      .then(data => {
        if (!unmounted && data) {
          setState(data);
          setIsConnected(true);
        }
      })
      .catch(() => {});

    // Try WebSocket connection to /ws
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (unmounted) return;
          isWsConnectedRef.current = true;
          setIsConnected(true);
          setErrorMessage(null);
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const msg: WSMessage = JSON.parse(event.data);
            handleIncomingMessage(msg);
          } catch {
            // ignore parse error
          }
        };

        ws.onerror = () => {
          // Gracefully fail over without throwing an unhandled console error
          if (!isWsConnectedRef.current) {
            startSSEFallback();
          }
        };

        ws.onclose = () => {
          isWsConnectedRef.current = false;
          if (!unmounted) {
            startSSEFallback();
          }
        };
      } catch {
        startSSEFallback();
      }
    };

    // Fallback using Server-Sent Events (SSE)
    const startSSEFallback = () => {
      if (eventSourceRef.current || unmounted) return;

      try {
        const es = new EventSource('/api/events');
        eventSourceRef.current = es;

        es.onopen = () => {
          if (unmounted) return;
          setIsConnected(true);
        };

        es.onmessage = (event) => {
          if (unmounted) return;
          try {
            const msg: WSMessage = JSON.parse(event.data);
            handleIncomingMessage(msg);
          } catch {
            // ignore parse error
          }
        };

        es.onerror = () => {
          // Keep connected status based on polling if SSE fails
          if (es.readyState === EventSource.CLOSED) {
            setIsConnected(false);
          }
        };
      } catch {
        // Fallback gracefully
      }
    };

    connectWebSocket();

    return () => {
      unmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
      }
      if (eventSourceRef.current) {
        try {
          eventSourceRef.current.close();
        } catch {}
      }
    };
  }, [handleIncomingMessage]);

  // Dispatch actions to server
  const sendMessage = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    // If WebSocket is open, send via WS
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
      return;
    }

    // Otherwise, post to REST action endpoint (SSE will push update back!)
    fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload })
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.message) {
            setErrorMessage(data.message);
          }
        }
      })
      .catch(() => {
        setErrorMessage('Failed to send auction action. Check connection.');
      });
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    state,
    isConnected,
    errorMessage,
    clearError,
    sendMessage
  };
}
