import { WaveType } from "../analysis/wave-type.enum";
import { Candle } from "../models/candle.entity";
import { BaseRule } from "./base-rule";

export class DowntrendCorpseCompareRule extends BaseRule {

    //! We don't need to check the type of the wave because it's first rule in the chain and to detect wave change 
    evaluate(candles: Candle[], type: WaveType): boolean {
        if (candles.length < 2) {
        return false;
        }

    
        const lastIndex = candles.length - 1;
        return candles[lastIndex].minimumCorpse <= candles[lastIndex - 1].minimumCorpse;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRuleType() {
        return WaveType.Downtrend;
    }
    
}