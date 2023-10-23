import { IOrderProps } from '../models/order.interface';
import { IOrderEvent, OrderEventType } from './order-events.interface';

export class OrderCreatedEvent implements IOrderEvent {
  eventType: OrderEventType = OrderEventType.CREATED;
  constructor(public readonly payload: Partial<IOrderProps>) {}
}
