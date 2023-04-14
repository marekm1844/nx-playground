import { Candle } from "../models/candle.entity";
import { BaseRule } from "./base-rule";
import { IRule } from "./rule.interface";

export class UptrendCorpseCompareRule extends BaseRule  {

   evaluate(candles: Candle[]): boolean {
     if (candles.length < 2) {
       return  false ;
    }

     const  lastIndex = candles.length - 1;
     return  candles[lastIndex].maximumCorpse > candles[lastIndex - 1].maximumCorpse;
  }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRuleType(): { new (...args: any[]): IRule } {
      return UptrendCorpseCompareRule;
    } 
}