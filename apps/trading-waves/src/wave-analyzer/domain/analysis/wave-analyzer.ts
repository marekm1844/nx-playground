import { Inject, Injectable, Logger } from '@nestjs/common';
import { CANDLE_DATA_PROVIDER, ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';
import { IRule } from '../rules/rule.interface';
import { WaveType } from '../models/wave-type.enum';
import { BaseRule } from '../rules/base-rule';
import { ICandleRepository } from '../repositories/candle-repository.interface';
import { IWaveRepository } from '../repositories/wave-repository.interface';
import { IWaveFactory } from '../factories/wave.factory';
import { IWave } from '../models/wave-entity.interface';
import { ICandle } from '../models/candle-entity.interface';
import { EventPublisher } from '../../../shared/events/event.publisher';
import { WaveUptrendEvent } from '../events/wave-uptrend.event';
import { WaveEventDTO } from '../../dto/wave-uptrend-event.dto';
import { WAVE_ANALYZER_EVENT_PUBLISHER } from '../../infrastructure/bullmq/bullmq.constants';
import { WaveDowntrendEvent } from '../events/wave-downtrend.event';


@Injectable()
export class WaveAnalyzer {
  private wave: IWave;
  private waves: IWave[] = [];
  private rules: IRule[] = [];
  private ruleEvaluationCache: string[] = [];

    constructor(@Inject(CANDLE_DATA_PROVIDER)  private readonly candleDataProvider: ICandleDataProvider,
    @Inject('IWaveRepository') private readonly waveRepository: IWaveRepository,
    @Inject('ICandleRepository') private readonly candleRepository: ICandleRepository,
    private readonly waveFactory: IWaveFactory,
    @Inject(WAVE_ANALYZER_EVENT_PUBLISHER)
    private readonly eventPublisher: EventPublisher
    ) {
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

      await this.evaluateRules(candle, lastCandleInCurrentWave, currentWave);
    
        //log number of waves and from last wave with number of candels in each wave and start date and type and log candle data as json
        // log wave details
        this.logWaveDetails();
    }
  }

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

  private async saveAndCreateNewWave(currentWave: IWave, newWaveType: WaveType, candle: ICandle): Promise<IWave> {
    currentWave.addCandle(candle);
    await this.waveRepository.save(currentWave);
    currentWave = this.waveFactory.createWave(newWaveType, candle);
    this.waves.push(currentWave);
    const dto = new WaveEventDTO(currentWave.getStartDateTime());
    newWaveType === WaveType.Uptrend 
      ? await this.eventPublisher.publish(new WaveUptrendEvent(dto)) 
      : await this.eventPublisher.publish(new WaveDowntrendEvent(dto));
    return currentWave;
  }

  //this method evaluates the rules and creates new waves if needed and saves the current wave
  //if the rule type is different from the current wave type then a new wave is created
  private async evaluateRules(candle: ICandle, lastCandleInCurrentWave: ICandle, currentWave: IWave) {
    const rulesToExecute = this.rules
    .filter(rule => rule.evaluate([lastCandleInCurrentWave, candle], currentWave.getType()))
    .filter(() => !this.checkIfCandleExistsInCache(candle));

    for (const rule of rulesToExecute) {
        const ruleType = rule.getRuleType();
        const waveType = currentWave.getType();

        const isUptrend = this.processRule(ruleType, waveType, rule, candle, currentWave);
        const newWaveType = isUptrend ? WaveType.Uptrend : WaveType.Downtrend;

        if (ruleType !== waveType && ruleType !== WaveType.Unknown) {
            Logger.log(`Start ${rule.constructor.name}  wave`);
            await this.saveAndCreateNewWave(currentWave, ruleType, candle);
        } else {
            Logger.log(`Start of ${currentWave.getType()} wave at ${currentWave.getStartDateTime()}`);
            await this.saveAndCreateNewWave(currentWave, newWaveType, candle);
        }
    }
}


private processRule(ruleType: WaveType, waveType: WaveType, rule: IRule, candle: ICandle, currentWave: IWave): boolean {
  let isUptrend = false;

  switch(ruleType) {
      case WaveType.Unknown:
          Logger.log(`${rule.constructor.name}  detected in unknown wave`);
          currentWave.addCandle(candle);
          isUptrend = waveType === WaveType.Uptrend;
          break;
      case WaveType.Uptrend:
          if(waveType === WaveType.Uptrend) {
              Logger.log(`${rule.constructor.name}  detected in uptrend wave`);
              currentWave.addCandle(candle);
              isUptrend = true;
          }
          break;
      case WaveType.Downtrend:
          if(waveType === WaveType.Downtrend) {
              Logger.log(`Start ${rule.constructor.name}  detected in downtrend wave`);
              currentWave.addCandle(candle);
          }
          break;
  }

  return isUptrend;
}


  private logWaveDetails(): void {
    Logger.log(`Number of waves: ${this.waves.length}`);
    Logger.log(`Last wave: ${this.waves.slice(-1)[0].getType()} with ${this.waves.slice(-1)[0].getCandles().length} candles`);
    Logger.log(`Last candle: ${JSON.stringify(this.waves.slice(-1)[0].getCandles().map((candle) =>({
      closeTime: candle.closeTime.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      open: candle.open,
      close: candle.close,
      low: candle.low,
      high: candle.high
    }))
  )}`);
  }  
}
