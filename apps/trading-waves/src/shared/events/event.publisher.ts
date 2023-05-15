import { Injectable } from "@nestjs/common";
import { IDomainEvent } from "./domain-event.interface";
import { IQueueService } from "./queue-service.interface";

@Injectable()
export class EventPublisher<T> {
  constructor( private readonly queue: IQueueService) {}

  async publish(event: IDomainEvent<T>) {
    const eventName = event.constructor.name;
    this.queue.add(eventName, event);
  }
}