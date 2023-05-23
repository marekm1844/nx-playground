import { Injectable } from "@nestjs/common";
import { IDomainEvent } from "./domain-event.interface";
import { IQueueService } from "./queue-service.interface";

@Injectable()
export class EventPublisher<T extends IDomainEvent = IDomainEvent> {
  constructor( private readonly queue: IQueueService) {}

  async publish(event: T) {
    const eventName = event.constructor.name;
    await this.queue.add(eventName, event);
    console.log(`Event published: ${eventName}`);
  }
}