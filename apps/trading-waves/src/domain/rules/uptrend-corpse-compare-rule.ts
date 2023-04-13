import { Candle } from "../models/candle.entity";
import { IRule } from "./rule.interface";

export class UptrendCorpseCompareRule implements IRule  {

   evaluate(candles: Candle[]): boolean {
     if (candles.length < 2) {
       return  false ;
    }

     const  lastIndex = candles.length - 1;
     return  candles[lastIndex].maximumCorpse > candles[lastIndex - 1].maximumCorpse;
  }
}