import { OrderEventDto } from '../dto/order-event.dto';
import { IOrderProps } from '../models/order.interface';
import { IOrderEvent, OrderEventType } from './order-events.interface';
import { v4 as uuidv4 } from 'uuid';

export class OrderCancelledEvent implements IOrderEvent {
  id: string;
  orderId: string;
  eventType: OrderEventType = OrderEventType.CANCELLED;
  eventData: Partial<IOrderProps>;
  createdAt: Date;

  constructor(data: OrderEventDto) {
    this.id = uuidv4();
    this.orderId = data.orderId;
    this.eventData = data.eventData;
    this.createdAt = new Date();
  }
}
