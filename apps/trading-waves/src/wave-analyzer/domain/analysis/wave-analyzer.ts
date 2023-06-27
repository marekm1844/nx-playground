import { Logger } from '@nestjs/common';
import { ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';
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
import { IQueueService } from '../../../shared/events/queue-service.interface';
import { ITrendPublisherStrategy } from '../../../shared/events/domain/trend-strategy.interface';
import { WaveUptrendEventStrategy } from '../../../shared/events/domain/waveuptrend-strategy.publisher';
import { WaveDowntrendEventStrategy } from '../../../shared/events/domain/wavedowntrend-stratefy.publisher';
import { WebSocketNotFoundError } from '../../infrastructure/websocket/websocket-notfound.error';
import { getTaskKey } from '../../../shared/events/domain/getTaskKey.utils';
import { WaveCompletedEventDTO } from '../../dto/wave-completed-event.dto';
import { WaveCompletedEventStrategy } from '../../../shared/events/domain/wavecomplete-strategy.publisher';
import { WaveCompletedEvent } from '../events/wave-completed.event';

export class WaveAnalyzer {
  private waves: Map<string, IWave[]> = new Map<string, IWave[]>();
  private rules: IRule[] = [];
  private readonly cacheKeys: Set<string> = new Set<string>();
  private uptrendStrategy: ITrendPublisherStrategy;
  private downtrendStrategy: ITrendPublisherStrategy;
  private completedStrategy: WaveCompletedEventStrategy;

  constructor(
    private readonly candleDataProvider: ICandleDataProvider,
    private readonly waveRepository: IWaveRepository,
    private readonly waveFactory: IWaveFactory,
    private readonly uptrendQueue: IQueueService,
    private readonly downtrendQueue: IQueueService,
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
    const task = this.analyzeSymbolInterval(symbol, interval);
    task.finally(() => {
      this.candleDataProvider.close(symbol, interval, true);
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

      //log number of waves and from last wave with number of candels in each wave and start date and type and log candle data as json
      this.logWaveDetails(symbol, interval);

      await this.publishWaveEvent(symbol, interval);
    }
  }

  stop(symbol: string, interval: string): void {
    this.candleDataProvider.close(symbol, interval, true);
  }

  private checkIfCandleExistsInCache(candle1: ICandle, symbol: string, interval: string): boolean {
    const cacheKey = `${candle1.openTime.getTime()}-${symbol}-${interval}`;

    if (this.cacheKeys.has(cacheKey)) {
      return true;
    }
    this.cacheKeys.add(cacheKey);
    if (this.cacheKeys.size > 1000) {
      const oldestCacheKey = this.cacheKeys.values().next().value;
      this.cacheKeys.delete(oldestCacheKey);
    }
    return false;
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

      const waveCompleet = new WaveCompletedEventDTO(
        lastWave.getStartDateTime(),
        lastWave.getLastCandle().close,
        symbol,
        interval,
        lastWave.shadow,
        lastWave.corpse,
        lastWave.type,
      );
      await this.completedStrategy.publishEvent(new WaveCompletedEvent(waveCompleet));
    }
  }
}
