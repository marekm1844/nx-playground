import { WaveType } from "../analysis/wave-type.enum";
import { Candle } from "../models/candle.entity";
import { BaseRule } from "./base-rule";

export class CloseWithinPreviousCorpseRule extends BaseRule{
    evaluate(candles: Candle[]): boolean {
        if (candles.length < 2) {
            return false;
        }

        const lastIndex = candles.length - 1;
        return candles[lastIndex].close >= candles[lastIndex - 1].minimumCorpse && candles[lastIndex].close <= candles[lastIndex - 1].maximumCorpse;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRuleType() {
        return WaveType.Unknown;
    }
}