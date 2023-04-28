import { Inject, Injectable, Logger } from '@nestjs/common';
import { Wave } from '../models/wave.entity';
import { CANDLE_DATA_PROVIDER, ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';
import { IRule } from '../rules/rule.interface';
import { WaveType } from '../models/wave-type.enum';
import { BaseRule } from '../rules/base-rule';
import { Candle } from '../models/candle.entity';
import { ICandleRepository } from '../repositories/candle-repository.interface';
import { IWaveRepository } from '../repositories/wave-repository.interface';


@Injectable()
export class WaveAnalyzer {
  private wave: Wave;
  private waves: Wave[] = [];
  private rules: IRule[] = [];
  private ruleEvaluationCache: string[] = [];

    constructor(@Inject(CANDLE_DATA_PROVIDER)  private readonly candleDataProvider: ICandleDataProvider,
    @Inject('IWavesRepository') private readonly waveRepository: IWaveRepository,
    @Inject('ICandleRepository') private readonly candleRepository: ICandleRepository,
    ) {
  }

  addRule(rule: IRule): void {
    this.rules.push(rule);
  }

  removeRule(rule: BaseRule): void {
    this.rules = this.rules.filter((r) => r !== rule);
  }

  async analyze(symbol: string, interval: string): Promise<void> {
    let currentWave: Wave | null = null;



    for await (const candle of this.candleDataProvider.candles(symbol, interval)) {

      //if no rules are added exit
      if (this.rules.length === 0) {
        Logger.log('No rules added');
        return;
      }

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
        .forEach(async (rule) => {
          if ( rule.evaluate([lastCandleInCurrentWave, candle], currentWave.getType()))
          {
            if (this.checkIfCandleExistsInCache(candle)) {
              return;
            }

            if((rule.getRuleType() === WaveType.Uptrend) && currentWave.getType() === WaveType.Uptrend)
            {

              Logger.log(`${rule.constructor.name}  detected in uptrend wave`);
              currentWave.addCandle(candle);
              isUptrend = true;
              
              return;

            }
            else if((rule.getRuleType() === WaveType.Downtrend)  && currentWave.getType() === WaveType.Downtrend)
            {
 
              Logger.log(`Start ${rule.constructor.name}  detected in downtrend wave`);
              currentWave.addCandle(candle);
              isUptrend = false;
              
              return;
            }
            else if (rule.getRuleType() === WaveType.Uptrend && currentWave.getType() === WaveType.Downtrend)
            {
              Logger.log(`Start ${rule.constructor.name}  wave`);
              currentWave.addCandle(candle);

              //save current wave
              await this.waveRepository.save(currentWave);
              //await this.candleRepository.save({ ...candle, wave: savedWave });

              currentWave = new Wave(WaveType.Uptrend  ,candle);
              this.waves.push(currentWave);
              return;
            }
            else if (rule.getRuleType() === WaveType.Downtrend && currentWave.getType() === WaveType.Uptrend)
            {
              Logger.log(`Start ${rule.constructor.name}  wave`);
              currentWave.addCandle(candle);
              await this.waveRepository.save(currentWave);
              //await this.candleRepository.save({ ...candle, wave: savedWave });

              currentWave = new Wave(WaveType.Downtrend  ,candle);
              this.waves.push(currentWave);
              return;
            }
            else 
            {
              await this.waveRepository.save(currentWave);
              //await this.candleRepository.save({ ...candle, wave: savedWave });
              
              // If wave type has changed, create a new wave
              const newWaveType = isUptrend ? WaveType.Uptrend : WaveType.Downtrend;
        
              currentWave = new Wave(newWaveType ,candle);
              this.waves.push(currentWave);
              console.log(`Start of ${currentWave.getType()} wave at ${currentWave.getStartDateTime()}`);
              

            }
            
          }
        });


        //log number of waves and from last wave with number of candels in each wave and start date and type and log candle data as json
        Logger.log(`Number of waves: ${this.waves.length}`);
        Logger.log(`Last wave: ${this.waves.slice(-1)[0].getType()} with ${this.waves.slice(-1)[0].getCandles().length} candles`);
        Logger.log(`Last candle: ${JSON.stringify(this.waves.slice(-1)[0].getCandles().map((candle) =>({
          open: candle.open,
          close: candle.close,
          low: candle.low,
          high: candle.high
        }))
      )}`
    );





    }
  }

  stop(): void {
    this.candleDataProvider.close();
  }

  private checkIfCandleExistsInCache(candle1: Candle): boolean {
    const cacheKey = `${candle1.openTime.getTime()}`;


    if (!this.ruleEvaluationCache.includes(cacheKey)) {
      this.ruleEvaluationCache.push(cacheKey);
      return false;
    }
    else {    
      return true;
    }

  }


  private logWaveInfo(matchingRule: IRule): void {
    const lastWave = this.waves.slice(-1)[0];
    const waveCandles = lastWave.getCandles();
  
    Logger.log(`Number of waves: ${this.waves.length}`);
    Logger.log(`Last wave: ${lastWave.getType()} with ${waveCandles.length} candles`);
    Logger.log(`Last candle: ${JSON.stringify(waveCandles.map((candle) => ({
      open: candle.open,
      close: candle.close,
      low: candle.low,
      high: candle.high
    })) )}`);
  }
}
