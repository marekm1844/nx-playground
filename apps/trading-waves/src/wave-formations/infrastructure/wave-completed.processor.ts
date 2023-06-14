import { Processor, WorkerHost } from '@nestjs/bullmq';
import { WAVE_COMPLETED } from '../../shared/events/infarstructure/redis-queue.constant';
import { Logger } from '@nestjs/common';
import { WaveType } from '../../shared/models/wave-type.enum';
import { getTaskKey } from '../../shared/events/domain/getTaskKey.utils';
import { WaveCompletedEvent } from '../../wave-analyzer/domain/events/wave-completed.event';
import { Job } from 'bullmq';
import { WaveCompletedEventDTO } from '../../wave-analyzer/dto/wave-completed-event.dto';

@Processor(WAVE_COMPLETED)
export class WaveCompletedProcessor extends WorkerHost {
  private readonly waves: Map<string, WaveCompletedEventDTO[]> = new Map();

  async process(job: Job<WaveCompletedEvent>) {
    console.log('WaveCompletedProcessor');

    const wave = job.data;
    const key = getTaskKey(wave.data.symbol, wave.data.interval);
    if (!this.waves.has(key)) {
      this.waves.set(key, []);
    }
    this.waves.get(key).push(wave.data);
    this.ensureUptrendWaveIsFirst(key);
    this.ensureMaxFourWaves(key);
    await this.detectDogFormation(wave.data.symbol, wave.data.interval);
  }

  private ensureUptrendWaveIsFirst(key: string): void {
    while (this.waves.get(key).length > 0 && this.waves.get(key)[0].type !== WaveType.Uptrend) {
      this.waves.get(key).shift();
    }
  }

  private ensureMaxFourWaves(key: string): void {
    while (this.waves.get(key).length > 4) {
      this.waves.get(key).shift();
    }
  }

  private async detectDogFormation(symbol: string, interval: string): Promise<void> {
    const key = getTaskKey(symbol, interval);
    const wavesForCurrentPair = this.waves.get(key);

    if (wavesForCurrentPair.length < 4) {
      return;
    }

    const [wave1, wave2, wave3, wave4] = wavesForCurrentPair.slice(-4);

    if (
      wave1.type === WaveType.Uptrend &&
      wave2.type === WaveType.Downtrend &&
      wave3.type === WaveType.Uptrend &&
      wave4.type === WaveType.Downtrend &&
      (wave4.corpse >= wave2.corpse || wave4.shadow >= wave2.shadow)
    ) {
      Logger.log('Dog Formation Detected');

      // Log all for waves as jason without candles
      Logger.debug(`wave1: ${JSON.stringify(wave1)}`);
      Logger.debug(`wave2: ${JSON.stringify(wave2)}`);
      Logger.debug(`wave3: ${JSON.stringify(wave3)}`);
      Logger.debug(`wave4: ${JSON.stringify(wave4)}`);
    }
  }
}
