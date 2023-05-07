import { ICandle } from '../domain/models/candle-entity.interface';
export const CANDLE_DATA_PROVIDER = Symbol('ICandleDataProvider');

export interface ICandleDataProvider {
  candles(symbol: string, interval: string): AsyncIterableIterator<ICandle>;
  close(): void;
}
