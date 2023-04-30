import { WaveType } from '../models/wave-type.enum';
import { Candle } from '../models/candle.entity';

export interface IRule {
  evaluate(candles: Candle[], currentType: WaveType | undefined): boolean;
  getRuleType(): WaveType | undefined;
  getResultsTree(candles: Candle[], type: WaveType): { name: string; result: string }[]
}