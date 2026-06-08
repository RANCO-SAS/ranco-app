import { env } from '@/lib/env';
import { getAccessToken } from '@/services/api/token-storage';

export type WsEvent = {
  type: string;
  channel: string;
  payload: unknown;
};

type EventHandler = (event: WsEvent) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private handlers = new Map<string, Set<EventHandler>>();
  private subscribedChannels = new Set<string>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  async connect(): Promise<void> {
    const token = await getAccessToken();
    if (!token) {
      return;
    }

    const wsBase = env.wsUrl.replace(/\/$/, '');
    const url = `${wsBase}/ws?token=${encodeURIComponent(token)}`;

    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket?.close();
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(String(event.data)) as WsEvent;
        const channelHandlers = this.handlers.get(parsed.channel);
        channelHandlers?.forEach((handler) => handler(parsed));

        const globalHandlers = this.handlers.get('*');
        globalHandlers?.forEach((handler) => handler(parsed));
      } catch {
        // ignore malformed messages
      }
    };

    this.socket.onopen = () => {
      for (const channel of this.subscribedChannels) {
        this.sendSubscribe(channel);
      }
    };

    this.socket.onclose = () => {
      this.scheduleReconnect();
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  subscribe(channel: string, handler: EventHandler): () => void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);
    this.subscribedChannels.add(channel);
    void this.connect().then(() => this.sendSubscribe(channel));

    return () => {
      this.handlers.get(channel)?.delete(handler);
      if (this.handlers.get(channel)?.size === 0) {
        this.handlers.delete(channel);
        this.subscribedChannels.delete(channel);
        this.sendUnsubscribe(channel);
      }
    };
  }

  broadcast(channel: string, type: string, payload: unknown): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(
      JSON.stringify({ action: 'broadcast', channel, type, payload }),
    );
  }

  private sendSubscribe(channel: string): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(JSON.stringify({ action: 'subscribe', channel }));
  }

  private sendUnsubscribe(channel: string): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(JSON.stringify({ action: 'unsubscribe', channel }));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, 3000);
  }
}

export const websocketClient = new WebSocketClient();
