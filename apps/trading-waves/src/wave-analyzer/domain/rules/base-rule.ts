
import { WaveType } from "../analysis/wave-type.enum";
import { IWaveType } from "../analysis/wave-type.interface";
import { Candle } from "../models/candle.entity";
import { IRule } from "./rule.interface";

export abstract class BaseRule implements IRule {
    abstract evaluate(candles: Candle[], type: WaveType ): boolean;
    
    //implement getRuleType to return the type of the rule (Uptrend, Downtrend, etc)
    

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abstract getRuleType(): WaveType
    

    and(...rules: IRule[]): IRule {
        return {
            evaluate: (candles: Candle[], type: WaveType): boolean => {
                return this.evaluate(candles,type) && rules.every((rule) => rule.evaluate(candles,type));
            },
            getRuleType : () => {
                return this.getRuleType();
            }
        }
    }

    or(...rules: IRule[]): IRule {
        return {
            evaluate: (candles: Candle[], type: WaveType): boolean => {
                return this.evaluate(candles, type) || rules.some((rule) => rule.evaluate(candles, type));
            },
            getRuleType : () => {
                return this.getRuleType();
            }
        }
    }
}

