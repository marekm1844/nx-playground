import { ICandle } from "../models/candle-entity.interface";
import { WaveType } from "../models/wave-type.enum";
import { BaseRule } from "./base-rule";
import { Logger } from "@nestjs/common";

export class CandleWithinPreviousCandleRule extends BaseRule {
    protected ruleName = 'CandleWithinPreviousCandleRule';
    evaluate(candles: ICandle[]): boolean {
        if (candles.length < 2) {
            return false;
        }

        const lastIndex = candles.length - 1;
        const result =    candles[lastIndex].low >= candles[lastIndex - 1].low &&
        candles[lastIndex].high >= candles[lastIndex - 1].low &&
        candles[lastIndex].low <= candles[lastIndex - 1].high;
        if(result)
        {
            Logger.debug('CandleWithinPreviousCandleRule');
        }
        return result;
     
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRuleType() {
        return WaveType.Unknown;
    }

}