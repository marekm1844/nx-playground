import { IDomainEvent } from '../domain-event.interface';

export interface IEventProcessor {
  process(event: IDomainEvent): Promise<void>;
}
