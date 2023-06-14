import { WaveCompletedEvent } from '../../../wave-analyzer/domain/events/wave-completed.event';
import { IQueueService } from '../queue-service.interface';

export class WaveCompletedEventStrategy {
  constructor(private readonly queue: IQueueService) {}

  async publishEvent(event: WaveCompletedEvent): Promise<void> {
    await this.queue.add(event);
  }
}
