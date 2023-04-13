import { Injectable } from '@nestjs/common';
import { Wave } from '../models/wave.entity';
import { ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';
import { IRule } from '../rules/rule.interface';
import { UptrendCorpseCompareRule } from '../rules/uptrend-corpse-compare-rule';

@Injectable()
export class WaveAnalyzer {
  private wave: Wave;
  private corpseCompareRule : IRule

  constructor(private readonly candleDataProvider: ICandleDataProvider) {
    this.wave = new Wave();
    this.corpseCompareRule = new UptrendCorpseCompareRule();
  }

  async analyze(symbol: string, interval: string): Promise<void> {
    for await (const candle of this.candleDataProvider.candles(symbol, interval)) {
      this.wave.addCandle(candle);


      // Check if the wave is an uptrend wave
      if (this.corpseCompareRule.evaluate(this.wave.getCandles())) {
        console.log('Uptrend wave detected');
      }
    }
  }

  stop(): void {
    this.candleDataProvider.close();
  }
}
