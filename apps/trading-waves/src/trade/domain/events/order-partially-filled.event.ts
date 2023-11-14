import { IOrderProps } from '../models/order.interface';
import { IOrderEvent, OrderEventType } from './order-events.interface';

export class OrderPartiallyFilledEvent implements IOrderEvent {
  eventType: OrderEventType = OrderEventType.PARTIALLY_FILLED;
  constructor(public readonly payload: Partial<IOrderProps>) {}
}
