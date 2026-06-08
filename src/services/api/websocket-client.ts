import { env } from '@/lib/env';
import { refreshAccessToken } from '@/services/api/client';
import { getStoredTokens, isTokenExpired } from '@/services/api/token-storage';

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
  private manuallyClosed = false;
  private reconnectDelayMs = 3000;

  async connect(): Promise<void> {
    this.manuallyClosed = false;
    const token = await this.resolveAccessToken();

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
      this.reconnectDelayMs = 3000;
      for (const channel of this.subscribedChannels) {
        this.sendSubscribe(channel);
      }
    };

    this.socket.onclose = () => {
      if (this.manuallyClosed) {
        return;
      }
      this.scheduleReconnect();
    };
  }

  disconnect(): void {
    this.manuallyClosed = true;

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

  private async resolveAccessToken(): Promise<string | null> {
    const tokens = await getStoredTokens();

    if (!tokens) {
      return null;
    }

    if (isTokenExpired(tokens.expiresAt)) {
      return refreshAccessToken();
    }

    return tokens.accessToken;
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
    if (this.reconnectTimer || this.manuallyClosed) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
      this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, 30000);
    }, this.reconnectDelayMs);
  }
}

export const websocketClient = new WebSocketClient();
