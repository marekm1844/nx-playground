import { IOrderProps } from '../models/order.interface';
import { IOrderEvent, OrderEventType } from './order-events.interface';

export class OrderCancelledEvent implements IOrderEvent {
  eventType: OrderEventType = OrderEventType.CANCELLED;

  constructor(public readonly payload: Partial<IOrderProps>) {}
}
