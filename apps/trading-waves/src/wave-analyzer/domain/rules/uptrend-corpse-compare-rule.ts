import { ICandle } from '../../../shared/models/candle-entity.interface';
import { WaveType } from '../../../shared/models/wave-type.enum';
import { BaseRule } from './base-rule';
import { Logger } from '@nestjs/common';

export class UptrendCorpseCompareRule extends BaseRule {
  protected ruleName = 'UptrendCorpseCompareRule';

  //! We don't need to check the type of the wave because it's first rule in the chain and to detect wave change
  evaluate(candles: ICandle[], type: WaveType): boolean {
    if (candles.length < 2) {
      return false;
    }

    const lastIndex = candles.length - 1;

    const result = candles[lastIndex].maximumCorpse >= candles[lastIndex - 1].maximumCorpse;
    if (result) {
      Logger.debug('UptrendCorpseCompareRule');
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRuleType() {
    return WaveType.Uptrend;
  }
}
