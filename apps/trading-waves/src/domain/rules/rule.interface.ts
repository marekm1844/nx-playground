import { Candle } from '../models/candle.entity';

export interface IRule {
  evaluate(candles: Candle[]): boolean;
  getRuleType(): { new (...args: any[]): IRule };
}