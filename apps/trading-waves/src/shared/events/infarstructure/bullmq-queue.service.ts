import { Queue } from "bullmq";
import { IQueueService } from "../queue-service.interface";

export class BullMqQueueService implements IQueueService {
    constructor(private readonly queue: Queue) {}
  
    async add<T>(name: string, data: T): Promise<void> {
      await this.queue.add(name, data);
    }
  }