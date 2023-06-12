import { ICandle } from '../../../shared/models/candle-entity.interface';
import { WaveType } from '../../../shared/models/wave-type.enum';
import { BaseRule } from './base-rule';
import { Logger } from '@nestjs/common';

export class CloseWithinPreviousCorpseRule extends BaseRule {
  protected ruleName = 'CloseWithinPreviousCorpseRule';
  evaluate(candles: ICandle[]): boolean {
    if (candles.length < 2) {
      return false;
    }

    const lastIndex = candles.length - 1;
    const result = candles[lastIndex].close >= candles[lastIndex - 1].minimumCorpse && candles[lastIndex].close <= candles[lastIndex - 1].maximumCorpse;
    if (result) {
      Logger.debug('CloseWithinPreviousCorpseRule');
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRuleType() {
    return WaveType.Unknown;
  }
}
