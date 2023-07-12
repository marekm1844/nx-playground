import { AggregateRoot } from '@nestjs/cqrs';
import { IOrderProps } from './models/order.interface';
import { IOrderEvent } from './events/order-events.interface';

export class Order extends AggregateRoot {
  constructor(public readonly props: IOrderProps, private readonly events: IOrderEvent[] = []) {
    super();
    this.applyEvents();
  }

  applyEvents() {
    this.events.forEach(event => this.apply(event));
  }
}
