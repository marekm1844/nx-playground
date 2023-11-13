import { Logger } from '@nestjs/common';
import { IOrderProps } from '../models/order.interface';
import { Order } from '../order.aggregate';
import { IOrderEvent, OrderEventType } from './order-events.interface';

export class OrderCreatedEvent implements IOrderEvent {
  eventType: OrderEventType = OrderEventType.CREATED;
  constructor(public readonly payload: Partial<IOrderProps>) {
    Logger.log(`[OrderCreatedEvent] - ${payload.id}`);
  }
}
