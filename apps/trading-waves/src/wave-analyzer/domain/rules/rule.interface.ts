import { WaveType } from '../analysis/wave-type.enum';
import { Candle } from '../models/candle.entity';

export interface IRule {
  evaluate(candles: Candle[], currentType: WaveType | undefined): boolean;
  getRuleType(): WaveType | undefined;
}