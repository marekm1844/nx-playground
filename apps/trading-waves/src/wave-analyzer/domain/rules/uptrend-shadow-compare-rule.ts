import { ICandle } from '../../../shared/models/candle-entity.interface';
import { WaveType } from '../../../shared/models/wave-type.enum';
import { BaseRule } from './base-rule';
import { Logger } from '@nestjs/common';

export class UptrendShadowCompareRule extends BaseRule {
  protected ruleName = 'UptrendShadowCompareRule';

  evaluate(candles: ICandle[], type: WaveType): boolean {
    if (candles.length < 2) {
      return false;
    }

    if (type === WaveType.Downtrend) {
      return false;
    }

    const lastIndex = candles.length - 1;
    const result = candles[lastIndex].high >= candles[lastIndex - 1].high;
    if (result) {
      Logger.debug('UptrendShadowCompareRule');
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRuleType() {
    return WaveType.Uptrend;
  }
}
