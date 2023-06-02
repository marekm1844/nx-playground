import { Inject, Injectable, Logger } from '@nestjs/common';
import { CANDLE_DATA_PROVIDER, ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';
import { IRule } from '../rules/rule.interface';
import { WaveType } from '../models/wave-type.enum';
import { BaseRule } from '../rules/base-rule';
import { IWaveRepository } from '../repositories/wave-repository.interface';
import { IWaveFactory } from '../factories/wave.factory';
import { IWave } from '../models/wave-entity.interface';
import { ICandle } from '../models/candle-entity.interface';
import { WaveUptrendEvent } from '../events/wave-uptrend.event';
import { WaveEventDTO } from '../../dto/wave-event.dto';
import { WaveDowntrendEvent } from '../events/wave-downtrend.event';
import { DOWNTREND_QUEUE_SERVICE, UPTREND_QUEUE_SERVICE } from '../../../shared/events/infarstructure/redis-queue.constant';
import { IQueueService } from '../../../shared/events/queue-service.interface';
import { ITrendPublisherStrategy } from '../../../shared/events/domain/trend-strategy.interface';
import { WaveUptrendEventStrategy } from '../../../shared/events/domain/waveuptrend-strategy.publisher';
import { WaveDowntrendEventStrategy } from '../../../shared/events/domain/wavedowntrend-stratefy.publisher';


@Injectable()
export class WaveAnalyzer {
  private wave: IWave;
  private waves: IWave[] = [];
  private rules: IRule[] = [];
  private ruleEvaluationCache: string[] = [];
  private uptrendStrategy: ITrendPublisherStrategy;
  private downtrendStrategy: ITrendPublisherStrategy;

    constructor(@Inject(CANDLE_DATA_PROVIDER)  private readonly candleDataProvider: ICandleDataProvider,
    @Inject('IWaveRepository') private readonly waveRepository: IWaveRepository,
    private readonly waveFactory: IWaveFactory,
    @Inject(UPTREND_QUEUE_SERVICE) private readonly uptrendQueue: IQueueService,
    @Inject(DOWNTREND_QUEUE_SERVICE) private readonly downtrendQueue: IQueueService,
    ) {
      this.uptrendStrategy = new WaveUptrendEventStrategy(this.uptrendQueue);
      this.downtrendStrategy = new WaveDowntrendEventStrategy(this.downtrendQueue);
  }

  addRule(rule: IRule): void {
    this.rules.push(rule);
  }

  removeRule(rule: BaseRule): void {
    this.rules = this.rules.filter((r) => r !== rule);
  }

  async analyze(symbol: string, interval: string): Promise<void> {
    let currentWave: IWave | null = null;

    for await (const candle of this.candleDataProvider.candles(symbol, interval)) {

      //if no rules are added exit
      if (this.rules.length === 0) {
        Logger.log('No rules added');
        return;
      }

      if (!currentWave) {
        currentWave = this.waveFactory.createWave(WaveType.Downtrend, candle);        
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

            if (rule.getRuleType() === WaveType.Unknown) {
              Logger.log(`${rule.constructor.name}  detected in unknown wave`);
              currentWave.addCandle(candle);
              isUptrend = currentWave.getType() === WaveType.Uptrend;
              return;
            }
            else if((rule.getRuleType() === WaveType.Uptrend) && currentWave.getType() === WaveType.Uptrend)
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

              currentWave = this.waveFactory.createWave(WaveType.Uptrend  ,candle);
              this.waves.push(currentWave);
              return;
            }
            else if (rule.getRuleType() === WaveType.Downtrend && currentWave.getType() === WaveType.Uptrend)
            {
              Logger.log(`Start ${rule.constructor.name}  wave`);
              currentWave.addCandle(candle);
              await this.waveRepository.save(currentWave);

              currentWave = this.waveFactory.createWave(WaveType.Downtrend  ,candle);
              this.waves.push(currentWave);
              return;
            }
            else 
            {
              await this.waveRepository.save(currentWave);
              
              // If wave type has changed, create a new wave
              const newWaveType = isUptrend ? WaveType.Uptrend : WaveType.Downtrend;
        
              currentWave = this.waveFactory.createWave(newWaveType ,candle);
              this.waves.push(currentWave);
              console.log(`Start of ${currentWave.getType()} wave at ${currentWave.getStartDateTime()}`);
            }
            
          }
        });

       await this.publishWaveEvent(symbol,interval);
   
        //log number of waves and from last wave with number of candels in each wave and start date and type and log candle data as json
        this.logWaveDetails();
    }
  };

  stop(): void {
    this.candleDataProvider.close();
  }

  private checkIfCandleExistsInCache(candle1: ICandle): boolean {
    const cacheKey = `${candle1.openTime.getTime()}`;


    if (!this.ruleEvaluationCache.includes(cacheKey)) {
      this.ruleEvaluationCache.push(cacheKey);
      return false;
    }
    else {    
      return true;
    }

  }

  

  private logWaveDetails(): void {
      Logger.log(`Number of waves: ${this.waves.length}`);
      Logger.log(`Last wave: ${this.waves.slice(-1)[0].getType()} with ${this.waves.slice(-1)[0].getCandles().length} candles`);
      Logger.log(`Last candle: ${JSON.stringify(this.waves.slice(-1)[0].getCandles().map((candle) =>({
        closeTime: candle.closeTime.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        open: candle.open,
        close: candle.close,
        low: candle.low,
      }))
    )}`
  );
  }

  private async publishWaveEvent(symbol: string, interval: string)
  {
    if(this.waves.slice(-1)[0].getCandles().length === 2)
    {
    const lastWave = this.waves.slice(-1)[0];
    const dto = new WaveEventDTO(lastWave.getStartDateTime(), lastWave.getLastCandle().close,symbol,interval);
    lastWave.getType() === WaveType.Uptrend ? await this.uptrendStrategy.publishEvent(new WaveUptrendEvent(dto)) : await this.downtrendStrategy.publishEvent(new WaveDowntrendEvent(dto));
    }
  }

}
