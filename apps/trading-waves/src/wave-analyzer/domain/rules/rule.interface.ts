import { ICandle } from '../../../shared/models/candle-entity.interface';
import { WaveType } from '../../../shared/models/wave-type.enum';

export interface IRule {
  evaluate(candles: ICandle[], currentType: WaveType | undefined): boolean;
  getRuleType(): WaveType | undefined;
  getResultsTree(candles: ICandle[], type: WaveType): { name: string; result: string }[];
}
