import { ICandle } from '../domain/models/candle-entity.interface';
import { WebSocketNotFoundError } from './websocket/websocket-notfound.error';
export const CANDLE_DATA_PROVIDER = Symbol('ICandleDataProvider');

export interface ICandleDataProvider {
  candles(symbol: string, interval: string): AsyncIterableIterator<ICandle | WebSocketNotFoundError>;
  close(sympol: string, interval: string): void;
}
