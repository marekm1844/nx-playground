import { EventsHandler } from '@nestjs/cqrs';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';
import { IEventStore } from '../../domain/repositories/event-store.interface';

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler {
  constructor(private readonly eventStore: IEventStore) {}

  async handle(event: OrderCreatedEvent) {
    //TODO: Implement this
    // await this.eventStore.save(event);
  }
}
