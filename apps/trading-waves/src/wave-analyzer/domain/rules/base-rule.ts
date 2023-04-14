import { Candle } from "../models/candle.entity";
import { IRule } from "./rule.interface";

export abstract class BaseRule implements IRule {
    abstract evaluate(candles: Candle[]): boolean;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRuleType(): { new (...args: any[]): IRule } {
        return this.constructor as { new (...args: any[]): IRule };
    }

    and(...rules: IRule[]): IRule {
        return {
            evaluate: (candles: Candle[]): boolean => {
                return this.evaluate(candles) && rules.every((rule) => rule.evaluate(candles));
            },
        }
    }

    or(...rules: IRule[]): IRule {
        return {
            evaluate: (candles: Candle[]): boolean => {
                return this.evaluate(candles) || rules.some((rule) => rule.evaluate(candles));
            },
        }
    }
}

