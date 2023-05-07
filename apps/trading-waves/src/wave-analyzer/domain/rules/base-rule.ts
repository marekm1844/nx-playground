
import { ICandle } from "../models/candle-entity.interface";
import { WaveType } from "../models/wave-type.enum";
import { IRule } from "./rule.interface";

export abstract class BaseRule implements IRule {
    abstract evaluate(candles: ICandle[], type: WaveType ): boolean;
    protected abstract ruleName: string;
    
    //implement getRuleType to return the type of the rule (Uptrend, Downtrend, etc)
    

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abstract getRuleType(): WaveType

    getResultsTree(candles: ICandle[], type: WaveType): { name: string; result: string }[] {
        const name = this.ruleName;
        const result = this.evaluate(candles, type) ? 'true' : 'false';
        return [{ name, result }];
      }
      getName(): string {
        return this.ruleName;
      }
    

    and(...rules: IRule[]): IRule {
        return {
            evaluate: (candles: ICandle[], type: WaveType): boolean => {
                return this.evaluate(candles,type) && rules.every((rule) => rule.evaluate(candles,type));
            },
            getRuleType : () => {
                return this.getRuleType();
            },
            getResultsTree: (candles: ICandle[], type: WaveType): { name: string; result: string }[] => {
                const thisRuleResult = this.getResultsTree(candles, type);
                const otherRuleResults = rules.flatMap((rule) => rule.getResultsTree(candles, type));
                return [...thisRuleResult, ...otherRuleResults];
              },
        }
    }

    or(...rules: IRule[]): IRule {
        return {
            evaluate: (candles: ICandle[], type: WaveType): boolean => {
                return this.evaluate(candles, type) || rules.some((rule) => rule.evaluate(candles, type));
            },
            getRuleType : () => {
                return this.getRuleType();
            },
            getResultsTree: (candles: ICandle[], type: WaveType): { name: string; result: string }[] => {
                const thisRuleResult = this.getResultsTree(candles, type);
                const otherRuleResults = rules.flatMap((rule) => rule.getResultsTree(candles, type));
                return [...thisRuleResult, ...otherRuleResults];
              },           
        }
    }
}

