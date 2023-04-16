import { Inject, Injectable, Logger } from '@nestjs/common';
import { Wave } from '../models/wave.entity';
import { CANDLE_DATA_PROVIDER, ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';
import { IRule } from '../rules/rule.interface';
import { UptrendCorpseCompareRule } from '../rules/uptrend-corpse-compare-rule';
import { WaveType } from './wave-type.enum';
import { DowntrendCorpseCompareRule } from '../rules/downtrend-corpse-compare-rule';
import { BaseRule } from '../rules/base-rule';
import { Candle } from '../models/candle.entity';


@Injectable()
export class WaveAnalyzer {
  private wave: Wave;
  private waves: Wave[] = [];
  private rules: BaseRule[] = [];

  constructor(@Inject(CANDLE_DATA_PROVIDER)  private readonly candleDataProvider: ICandleDataProvider) {
  }

  addRule(rule: BaseRule): void {
    this.rules.push(rule);
  }

  removeRule(rule: BaseRule): void {
    this.rules = this.rules.filter((r) => r !== rule);
  }

  async analyze(symbol: string, interval: string): Promise<void> {
    let currentWave: Wave | null = null;



    for await (const candle of this.candleDataProvider.candles(symbol, interval)) {

      if (!currentWave) {
        currentWave = new Wave(WaveType.Uptrend, candle);
        this.waves.push(currentWave);
        continue;
      }

      //get last candle from current wave
      const lastCandleInCurrentWave = currentWave.getCandles().slice(-1)[0];
      let isUptrend = false;
       
        //execute rules
        this.rules
        .forEach((rule) => {
          if (rule.evaluate([lastCandleInCurrentWave, candle]))
          {
            if(rule.getRuleType() === UptrendCorpseCompareRule && currentWave.getType() === WaveType.Uptrend)
            {
              Logger.log('UptrendCorpseCompareRule detected in uptrend wave');
              currentWave.addCandle(candle);
              isUptrend = true;
            }
            else if(rule.getRuleType() === DowntrendCorpseCompareRule && currentWave.getType() === WaveType.Downtrend)
            {
              Logger.log('DowntrendCorpseCompareRule detected in downtrend wave');
              currentWave.addCandle(candle);
              isUptrend = false;
            }
            else 
            {
              // If wave type has changed, create a new wave
              const newWaveType = isUptrend ? WaveType.Uptrend : WaveType.Downtrend;
              currentWave = new Wave(newWaveType ,candle);
              this.waves.push(currentWave);
              console.log(`Start of ${currentWave.getType} wave at ${currentWave.getStartDateTime()}`);

            }
            
          }
          Logger.log('rule detected  and passed');

          // Add other rule types here with additional conditions
        });


        //log number of waves and from last wave with number of candels in each wave and start date and type and log candle data as json
        Logger.log(`Number of waves: ${this.waves.length}`);
        Logger.log(`Last wave: ${this.waves.slice(-1)[0].getType()} with ${this.waves.slice(-1)[0].getCandles().length} candles`);
        Logger.log(`Last candle: ${JSON.stringify(this.waves.slice(-1)[0].getCandles())}`);





    }
  }

  stop(): void {
    this.candleDataProvider.close();
  }
}
