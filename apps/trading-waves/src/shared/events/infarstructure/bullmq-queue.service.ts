import { Queue } from "bullmq";
import { IQueueService } from "../queue-service.interface";
import { IDomainEvent } from "../domain-event.interface";

export class BullMqQueueService implements IQueueService {
    constructor(private readonly queue: Queue) {}
  
    async add(event: IDomainEvent): Promise<void> {
      await this.queue.add(event.name, event);
    }
  }