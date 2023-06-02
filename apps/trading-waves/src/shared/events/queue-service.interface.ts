import { IDomainEvent } from "./domain-event.interface";

export interface IQueueService {
    add(data: IDomainEvent): Promise<void>;
  }
  