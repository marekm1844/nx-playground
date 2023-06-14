import { Inject, Injectable, Logger } from '@nestjs/common';
import { CANDLE_DATA_PROVIDER, ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';
import { IRule } from '../rules/rule.interface';
import { WaveType } from '../../../shared/models/wave-type.enum';
import { BaseRule } from '../rules/base-rule';
import { IWaveRepository } from '../repositories/wave-repository.interface';
import { IWaveFactory } from '../factories/wave.factory';
import { IWave } from '../../../shared/models/wave-entity.interface';
import { ICandle } from '../../../shared/models/candle-entity.interface';
import { WaveUptrendEvent } from '../events/wave-uptrend.event';
import { WaveEventDTO } from '../../dto/wave-event.dto';
import { WaveDowntrendEvent } from '../events/wave-downtrend.event';
import { DOWNTREND_QUEUE_SERVICE, UPTREND_QUEUE_SERVICE, WAVE_COMPLETED_QUEUE_SERVICE } from '../../../shared/events/infarstructure/redis-queue.constant';
import { IQueueService } from '../../../shared/events/queue-service.interface';
import { ITrendPublisherStrategy } from '../../../shared/events/domain/trend-strategy.interface';
import { WaveUptrendEventStrategy } from '../../../shared/events/domain/waveuptrend-strategy.publisher';
import { WaveDowntrendEventStrategy } from '../../../shared/events/domain/wavedowntrend-stratefy.publisher';
import { WebSocketNotFoundError } from '../../infrastructure/websocket/websocket-notfound.error';
import { getTaskKey } from '../../../shared/events/domain/getTaskKey.utils';
import { WaveCompletedEventDTO } from '../../dto/wave-completed-event.dto';
import { WaveCompletedEventStrategy } from '../../../shared/events/domain/wavecomplete-strategy.publisher';
import { Wave } from 'aws-cdk-lib/pipelines';
import { WaveCompletedEvent } from '../events/wave-completed.event';

@Injectable()
export class WaveAnalyzer {
  private waves: Map<string, IWave[]> = new Map<string, IWave[]>();
  private rules: IRule[] = [];
  private ruleEvaluationCache: string[] = [];
  private uptrendStrategy: ITrendPublisherStrategy;
  private downtrendStrategy: ITrendPublisherStrategy;
  private completedStrategy: WaveCompletedEventStrategy;
  private waveTasks: Map<string, Promise<void>> = new Map();

  constructor(
    @Inject(CANDLE_DATA_PROVIDER)
    private readonly candleDataProvider: ICandleDataProvider,
    @Inject('IWaveRepository') private readonly waveRepository: IWaveRepository,
    private readonly waveFactory: IWaveFactory,
    @Inject(UPTREND_QUEUE_SERVICE) private readonly uptrendQueue: IQueueService,
    @Inject(DOWNTREND_QUEUE_SERVICE)
    private readonly downtrendQueue: IQueueService,
    @Inject(WAVE_COMPLETED_QUEUE_SERVICE)
    private readonly waveCompletedQueue: IQueueService,
  ) {
    this.uptrendStrategy = new WaveUptrendEventStrategy(this.uptrendQueue);
    this.downtrendStrategy = new WaveDowntrendEventStrategy(this.downtrendQueue);
    this.completedStrategy = new WaveCompletedEventStrategy(this.waveCompletedQueue);
  }

  addRule(rule: IRule): void {
    this.rules.push(rule);
  }

  removeRule(rule: BaseRule): void {
    this.rules = this.rules.filter(r => r !== rule);
  }

  async analyze(symbol: string, interval: string): Promise<void> {
    const key = getTaskKey(symbol, interval);
    if (this.waveTasks.has(key)) {
      Logger.log(`Wave analysis for ${key} is already running`);
      return;
    }
    const task = this.analyzeSymbolInterval(symbol, interval);
    this.waveTasks.set(key, task);
    task.finally(() => {
      this.candleDataProvider.close(symbol, interval);
      this.waveTasks.delete(key);
    });
  }

  async analyzeSymbolInterval(symbol: string, interval: string): Promise<void> {
    let currentWave: IWave | null = null;

    const key = getTaskKey(symbol, interval);
    if (!this.waves.has(key)) {
      this.waves.set(key, []);
    }

    for await (const candle of this.candleDataProvider.candles(symbol, interval)) {
      if (candle instanceof WebSocketNotFoundError) {
        Logger.error(candle.message);
        break; // or continue with the next symbol/interval pair
      }

      //if no rules are added exit
      if (this.rules.length === 0) {
        Logger.log('No rules added');
        return;
      }

      const wavesForCurrentPair = this.waves.get(key);

      if (!currentWave) {
        currentWave = this.waveFactory.createWave(WaveType.Downtrend, symbol, interval, candle);
        wavesForCurrentPair.push(currentWave);
        continue;
      }

      //get last candle from current wave
      const lastCandleInCurrentWave = currentWave.getCandles().slice(-1)[0];
      let isUptrend = false;

      //execute rules
      this.rules.forEach(async rule => {
        if (rule.evaluate([lastCandleInCurrentWave, candle], currentWave.getType())) {
          if (this.checkIfCandleExistsInCache(candle, symbol, interval)) {
            return;
          }

          let newWaveType: WaveType;

          switch (rule.getRuleType()) {
            case WaveType.Unknown:
              Logger.log(`${rule.constructor.name} detected in unknown wave`);
              currentWave.addCandle(candle);
              isUptrend = currentWave.getType() === WaveType.Uptrend;
              break;

            case WaveType.Uptrend:
              if (currentWave.getType() === WaveType.Uptrend) {
                Logger.log(`${rule.constructor.name} detected in uptrend wave`);
                currentWave.addCandle(candle);
                isUptrend = true;
              } else {
                Logger.log(`Start ${rule.constructor.name} wave`);
                currentWave.addCandle(candle);
                await this.waveRepository.save(currentWave);

                currentWave = this.waveFactory.createWave(WaveType.Uptrend, symbol, interval, candle);
                wavesForCurrentPair.push(currentWave);
              }
              break;

            case WaveType.Downtrend:
              if (currentWave.getType() === WaveType.Downtrend) {
                Logger.log(`Start ${rule.constructor.name} detected in downtrend wave`);
                currentWave.addCandle(candle);
                isUptrend = false;
              } else {
                Logger.log(`Start ${rule.constructor.name} wave`);
                currentWave.addCandle(candle);
                await this.waveRepository.save(currentWave);

                currentWave = this.waveFactory.createWave(WaveType.Downtrend, symbol, interval, candle);
                wavesForCurrentPair.push(currentWave);
              }
              break;

            default:
              await this.waveRepository.save(currentWave);

              // If wave type has changed, create a new wave
              newWaveType = isUptrend ? WaveType.Uptrend : WaveType.Downtrend;

              currentWave = this.waveFactory.createWave(newWaveType, symbol, interval, candle);
              wavesForCurrentPair.push(currentWave);
              console.log(`Start of ${currentWave.getType()} wave at ${currentWave.getStartDateTime()}`);
              break;
          }
        }
      });

      await this.publishWaveEvent(symbol, interval);

      //log number of waves and from last wave with number of candels in each wave and start date and type and log candle data as json
      this.logWaveDetails(symbol, interval);
    }
  }

  stop(symbol: string, interval: string): void {
    this.candleDataProvider.close(symbol, interval);
  }

  private checkIfCandleExistsInCache(candle1: ICandle, symbol: string, interval: string): boolean {
    const cacheKey = `${candle1.openTime.getTime()}-${symbol}-${interval}`;

    if (!this.ruleEvaluationCache.includes(cacheKey)) {
      this.ruleEvaluationCache.push(cacheKey);
      return false;
    } else {
      return true;
    }
  }

  private logWaveDetails(symbol: string, interval: string): void {
    const key = getTaskKey(symbol, interval);
    const wavesForCurrentPair = this.waves.get(key);

    Logger.log(`Number of waves: ${wavesForCurrentPair.length} for int. ${interval}`);
    Logger.log(`Last wave: ${wavesForCurrentPair.slice(-1)[0].getType()} with ${wavesForCurrentPair.slice(-1)[0].getCandles().length} candles`);
    Logger.log(
      `Last candle: ${JSON.stringify(
        wavesForCurrentPair
          .slice(-1)[0]
          .getCandles()
          .map(candle => ({
            closeTime: candle.closeTime.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            open: candle.open,
            close: candle.close,
            low: candle.low,
          })),
      )}`,
    );
  }

  private async publishWaveEvent(symbol: string, interval: string) {
    const key = getTaskKey(symbol, interval);
    const wavesForCurrentPair = this.waves.get(key);

    if (wavesForCurrentPair.slice(-1)[0].getCandles().length === 2) {
      const lastWave = wavesForCurrentPair.slice(-1)[0];
      const dto = new WaveEventDTO(lastWave.getStartDateTime(), lastWave.getLastCandle().close, symbol, interval);
      lastWave.getType() === WaveType.Uptrend
        ? await this.uptrendStrategy.publishEvent(new WaveUptrendEvent(dto))
        : await this.downtrendStrategy.publishEvent(new WaveDowntrendEvent(dto));

      const waceCompleet = new WaveCompletedEventDTO(
        lastWave.getStartDateTime(),
        lastWave.getLastCandle().close,
        symbol,
        interval,
        lastWave.shadow,
        lastWave.corpse,
        lastWave.type,
      );
      await this.completedStrategy.publishEvent(new WaveCompletedEvent(waceCompleet));
    }
  }
}
