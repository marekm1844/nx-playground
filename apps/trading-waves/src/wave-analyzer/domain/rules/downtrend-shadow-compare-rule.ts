import { ICandle } from "../models/candle-entity.interface";
import { WaveType } from "../models/wave-type.enum";
import { BaseRule } from "./base-rule";
import { Logger } from "@nestjs/common";

export class DowntrendShadowCompareRule extends BaseRule{
    protected ruleName = 'DowntrendShadowCompareRule';
    
    evaluate(candles: ICandle[], type : WaveType): boolean {
        if (candles.length < 2) {
            return false;
        }

        if (type === WaveType.Uptrend) {
            return  false ;
          }
    

        const lastIndex = candles.length - 1;
        const result = candles[lastIndex].low <= candles[lastIndex - 1].low;
        if(result)
        {
            Logger.debug('DowntrendShadowCompareRule');
        }
        return result;

    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRuleType(){
        return WaveType.Downtrend;
    }

}