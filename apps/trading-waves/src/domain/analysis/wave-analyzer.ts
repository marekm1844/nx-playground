import { Injectable } from '@nestjs/common';
import { Wave } from '../models/wave.entity';
import { ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';
import { IRule } from '../rules/rule.interface';
import { UptrendCorpseCompareRule } from '../rules/uptrend-corpse-compare-rule';

@Injectable()
export class WaveAnalyzer {
  private wave: Wave;
  private rules: IRule[] = [];

  constructor(private readonly candleDataProvider: ICandleDataProvider) {
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
      this.wave.addCandle(candle);

      //execute rules
      this.rules
        .filter((rule) => rule.evaluate(this.wave.getCandles()))
        .forEach((rule) => {
          if (rule.getRuleType() === UptrendCorpseCompareRule) {
            console.log('Uptrend wave detected');
          }
          // Add other rule types here with additional conditions
        });

    }
  }

  stop(): void {
    this.candleDataProvider.close();
  }
}
