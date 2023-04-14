import { Inject, Injectable, Logger } from '@nestjs/common';
import { Wave } from '../models/wave.entity';
import { CANDLE_DATA_PROVIDER, ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';
import { IRule } from '../rules/rule.interface';


@Injectable()
export class WaveAnalyzer {
  private wave: Wave;
  private rules: IRule[] = [];

  constructor(@Inject(CANDLE_DATA_PROVIDER)  private readonly candleDataProvider: ICandleDataProvider) {
    this.wave = new Wave();
  }

  addRule(rule: IRule): void {
    this.rules.push(rule);
  }

  removeRule(rule: IRule): void {
    this.rules = this.rules.filter((r) => r !== rule);
  }

  async analyze(symbol: string, interval: string): Promise<void> {
    for await (const candle of this.candleDataProvider.candles(symbol, interval)) {
      
      if (this.wave.addCandle(candle)){
        
        //execute rules
        this.rules
        .filter((rule) => rule.evaluate(this.wave.getCandles()))
        .forEach((rule) => {
          Logger.log('rule detected  and passed');

          // Add other rule types here with additional conditions
        });


        //log 5 last candles from wave using Logger and display only open and close price, high and low price
        Logger.log(this.wave.getCandles().slice(-5).map((candle) => {
          return {
            openTime: candle.openTime,
            open: candle.open,
            close: candle.close,
            high: candle.high,
            low: candle.low,
            completed: candle.completed,
          }
        }));

      }
     
    }
  }

  stop(): void {
    this.candleDataProvider.close();
  }
}
