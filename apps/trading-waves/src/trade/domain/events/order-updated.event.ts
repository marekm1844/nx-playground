import { IOrderProps } from '../models/order.interface';
import { IOrderEvent, OrderEventType } from './order-events.interface';

export class OrderUpdatedEvent implements IOrderEvent {
  eventType: OrderEventType = OrderEventType.UPDATED;
  constructor(public readonly payload: Partial<IOrderProps>) {}
}
