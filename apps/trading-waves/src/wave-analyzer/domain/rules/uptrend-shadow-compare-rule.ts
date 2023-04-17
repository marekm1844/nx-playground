import { WaveType } from "../analysis/wave-type.enum";
import { Candle } from "../models/candle.entity"
import { BaseRule } from "./base-rule";

export class UptrendShadowCompareRule extends BaseRule {

    evaluate(candles: Candle[], type: WaveType): boolean {
        if (candles.length < 2) {
            return false;
        }

        if (type === WaveType.Downtrend) {
            return  false ;
          }

        const lastIndex = candles.length - 1;
        return candles[lastIndex].high >= candles[lastIndex - 1].high;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRuleType(){
        return WaveType.Uptrend;
    }
}