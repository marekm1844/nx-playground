import { Injectable } from '@nestjs/common';
import { Wave } from '../models/wave.entity';
import { ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';

@Injectable()
export class WaveAnalyzer {
  private wave: Wave;

  constructor(private readonly candleDataProvider: ICandleDataProvider) {
    this.wave = new Wave();
  }

  async analyze(symbol: string, interval: string): Promise<void> {
    for await (const candle of this.candleDataProvider.candles(symbol, interval)) {
      this.wave.addCandle(candle);

      // Check if the wave is an uptrend wave
      if (this.wave.isLatestUptrend()) {
        console.log('Uptrend wave detected');
      }
    }
  }

  stop(): void {
    this.candleDataProvider.close();
  }
}
