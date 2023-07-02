import { Processor, WorkerHost } from '@nestjs/bullmq';
import { WAVE_COMPLETED } from '../../shared/events/infarstructure/redis-queue.constant';
import { Logger } from '@nestjs/common';
import { WaveCompletedEvent } from '../../wave-analyzer/domain/events/wave-completed.event';
import { Job } from 'bullmq';
import { WaveCompletedEventDTO } from '../dto/wave-completed-event.dto';
import { IFormationStrategy } from '../domain/formation-strategy.interface';
import { DogFormationStrategy } from '../domain/dog-formation.strategy';

@Processor(WAVE_COMPLETED)
export class WaveCompletedProcessor extends WorkerHost {
  private readonly strategies: IFormationStrategy[];

  constructor(private readonly dogFormationStrategy: DogFormationStrategy) {
    super();
    this.strategies = [dogFormationStrategy];
  }

  async process(job: Job<WaveCompletedEvent>) {
    console.log('WaveCompletedProcessor');

    const wave = WaveCompletedEventDTO.fromWaveCompletedEvent(job.data);

    for (const strategy of this.strategies) {
      strategy.isFormationDetected(wave);
    }
  }
}
