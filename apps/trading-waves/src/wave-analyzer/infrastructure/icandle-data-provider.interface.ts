import { Candle } from '../domain/models/candle.entity';

export const CANDLE_DATA_PROVIDER = Symbol('ICandleDataProvider');

export interface ICandleDataProvider {
  candles(symbol: string, interval: string): AsyncIterableIterator<Candle>;
  close(): void;
}
