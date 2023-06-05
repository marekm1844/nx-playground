import { WebSocket} from 'ws';


export interface IWebSocketConnectionPool {
    connect(symbol: string, interval: string): Promise<WebSocket | Error> ;
    disconnect(symbol: string, interval: string): void;
    get(symbol: string, interval: string): WebSocket | undefined;
  }
  