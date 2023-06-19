import { Injectable, Inject } from '@nestjs/common';
import { WaveAnalyzer } from './wave-analyzer';
import { CANDLE_DATA_PROVIDER, ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';
import { UPTREND_QUEUE_SERVICE, DOWNTREND_QUEUE_SERVICE, WAVE_COMPLETED_QUEUE_SERVICE } from '../../../shared/events/infarstructure/redis-queue.constant';
import { IWaveRepository } from '../repositories/wave-repository.interface';
import { IWaveFactory } from '../factories/wave.factory';
import { IQueueService } from '../../../shared/events/queue-service.interface';
import { getTaskKey } from '../../../shared/events/domain/getTaskKey.utils';

@Injectable()
export class WaveAnalyzerFactory {
  private analyzers: Map<string, WaveAnalyzer> = new Map();

  constructor(
    @Inject(CANDLE_DATA_PROVIDER)
    private readonly candleDataProviderFactory: () => ICandleDataProvider,
    @Inject('IWaveRepository') private readonly waveRepository: IWaveRepository,
    private readonly waveFactory: IWaveFactory,
    @Inject(UPTREND_QUEUE_SERVICE) private readonly uptrendQueue: IQueueService,
    @Inject(DOWNTREND_QUEUE_SERVICE)
    private readonly downtrendQueue: IQueueService,
    @Inject(WAVE_COMPLETED_QUEUE_SERVICE)
    private readonly waveCompletedQueue: IQueueService,
  ) {}

  create(symbol: string, interval: string): WaveAnalyzer {
    const key = getTaskKey(symbol, interval);

    if (this.analyzers.has(key)) {
      return this.analyzers.get(key);
    }

    // Create a new instance of candleDataProvider
    const candleDataProvider = this.candleDataProviderFactory();
    // Create a new instance of waveRepository
    const newAnalyzer = new WaveAnalyzer(candleDataProvider, this.waveRepository, this.waveFactory, this.uptrendQueue, this.downtrendQueue, this.waveCompletedQueue);

    this.analyzers.set(key, newAnalyzer);
    return newAnalyzer;
  }

  stop(symbol: string, interval: string): void {
    const key = getTaskKey(symbol, interval);
    if (this.isRunning(symbol, interval)) {
      const analyzer = this.analyzers.get(key);
      analyzer?.stop(symbol, interval);
      this.analyzers.delete(key);
    }
  }

  isRunning(symbol: string, interval: string): boolean {
    const key = getTaskKey(symbol, interval);
    return this.analyzers.has(key);
  }
}
