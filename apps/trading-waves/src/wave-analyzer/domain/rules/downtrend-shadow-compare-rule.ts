import { DowntrendWaveType } from "../analysis/downtrend-wave-type";
import { UptrendWaveType } from "../analysis/uptrend-wave-type";
import { WaveType } from "../analysis/wave-type.enum";
import { IWaveType } from "../analysis/wave-type.interface";
import { Candle } from "../models/candle.entity";
import { BaseRule } from "./base-rule";

export class DowntrendShadowCompareRule extends BaseRule{
    evaluate(candles: Candle[], type : WaveType): boolean {
        if (candles.length < 2) {
            return false;
        }

        if (type === WaveType.Uptrend) {
            return  false ;
          }
    

        const lastIndex = candles.length - 1;
        return candles[lastIndex].low <= candles[lastIndex - 1].low;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRuleType(){
        return WaveType.Downtrend;
    }
}