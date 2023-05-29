import { IDomainEvent } from "../../../shared/events/domain-event.interface";

export interface IEventProcessor {
    process(event: IDomainEvent): Promise<void>;
  }