import { Candle } from '../domain/models/candle.entity';

export interface ICandleDataProvider {
  candles(symbol: string, interval: string): AsyncIterableIterator<Candle>;
  close(): void;
}
