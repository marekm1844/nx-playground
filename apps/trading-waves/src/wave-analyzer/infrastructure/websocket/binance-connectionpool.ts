import { Injectable, Logger } from '@nestjs/common';
import { IWebSocketConnectionPool } from '../../../shared/events/infarstructure/websocket-connection-pool.interface';
import { WebSocket } from 'ws';
import { WebSocketNotFoundError } from './websocket-notfound.error';
@Injectable()
export class BinanceConnectionPool implements IWebSocketConnectionPool {
  private pool: Map<string, WebSocket>;

  constructor() {
    this.pool = new Map<string, WebSocket>();
  }

  async connect(symbol: string, interval: string): Promise<WebSocket | WebSocketNotFoundError> {
    const key = this.getKey(symbol, interval);
    let connection = this.pool.get(key);
    if (!connection) {
      try {
        Logger.debug(`[connect] connection created for ${key}`);
        connection = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
        this.pool.set(key, connection);
        this.pool.forEach((value, key) => {
          Logger.debug(`key: ${key}`);
        });
      } catch (error) {
        return new WebSocketNotFoundError(symbol, interval);
      }
    }
    return connection;
  }
  disconnect(symbol: string, interval: string): void {
    const key = this.getKey(symbol, interval);
    const ws = this.pool.get(key);
    if (ws) {
      ws.close();
      this.pool.delete(key);
    }
  }

  get(symbol: string, interval: string): WebSocket | undefined {
    const key = this.getKey(symbol, interval);
    return this.pool.get(key);
  }

  private getKey(symbol: string, interval: string): string {
    return `${symbol}-${interval}`;
  }
}
