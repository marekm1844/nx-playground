import { IOrderProps } from '../models/order.interface';
import { IOrderEvent, OrderEventType } from './order-events.interface';

export class OrderFilledEvent implements IOrderEvent {
  eventType: OrderEventType = OrderEventType.FILLED;
  constructor(public readonly payload: Partial<IOrderProps>) {}
}
