import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from 'eventemitter2';
import { IDomainEvent } from "./domain-event.interface";

@Injectable()
export class EventPublisher {
  constructor( private readonly evenrEmitter: EventEmitter2 ) {}

  publish<T>(event: IDomainEvent<T>) {
    const eventName = event.constructor.name;
    this.evenrEmitter.emit(eventName, event);
  }
}