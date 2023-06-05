export class WebSocketNotFoundError extends Error {
    constructor(symbol: string, interval: string) {
      super(`Failed to get WebSocket for symbol "${symbol}" and interval "${interval}"`);
      this.name = 'WebSocketNotFoundError';
    }
  }