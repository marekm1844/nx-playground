import { WaveType } from "../models/wave-type.enum";
import { Candle } from "../models/candle.entity";
import { BaseRule } from "./base-rule";
import { Logger } from "@nestjs/common";

export class DowntrendCorpseCompareRule extends BaseRule {
    protected ruleName = 'DowntrendCorpseCompareRule';

    //! We don't need to check the type of the wave because it's first rule in the chain and to detect wave change 
    evaluate(candles: Candle[], type: WaveType): boolean {
        if (candles.length < 2) {
        return false;
        }

    
        const lastIndex = candles.length - 1;
        const result = candles[lastIndex].minimumCorpse <= candles[lastIndex - 1].minimumCorpse;
        if(result)
        {
            Logger.debug('DowntrendCorpseCompareRule');
        }
        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRuleType() {
        return WaveType.Downtrend;
    }
    
}