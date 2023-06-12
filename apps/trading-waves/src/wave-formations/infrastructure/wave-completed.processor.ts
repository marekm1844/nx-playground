import { Processor, WorkerHost } from '@nestjs/bullmq';
import { WAVE_COMPLETED } from '../../shared/events/infarstructure/redis-queue.constant';
import { IWave } from '../../shared/models/wave-entity.interface';
import { Logger } from '@nestjs/common';
import { WaveType } from '../../shared/models/wave-type.enum';
import { getTaskKey } from '../../shared/events/domain/getTaskKey.utils';

@Processor(WAVE_COMPLETED)
export class WaveCompletedProcessor extends WorkerHost {
  private readonly waves: Map<string, IWave[]> = new Map();

  async process(job) {
    console.log('WaveCompletedProcessor');
    console.log(job.data);
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
      wave4.corpse >= Math.max(wave2.corpse, wave1.corpse) &&
      wave4.shadow >= Math.max(wave2.shadow, wave1.shadow)
    ) {
      Logger.log('Dog Formation Detected');
    }
  }
}
