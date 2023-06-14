import { IDomainEvent } from '../../../shared/events/domain-event.interface';
import { WaveCompletedEventDTO } from '../../dto/wave-completed-event.dto';

export class WaveCompletedEvent implements IDomainEvent<WaveCompletedEventDTO> {
  constructor(public readonly data: WaveCompletedEventDTO, public readonly occurredOn: Date = new Date(), public readonly name: string = 'WaveCompletedEvent') {}
}
