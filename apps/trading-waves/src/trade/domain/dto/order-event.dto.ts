import { IEvent } from '@nestjs/cqrs';
import { IOrderProps } from '../models/order.interface';

export class OrderEventDto implements IEvent {
  orderId: string;
  eventData: Partial<IOrderProps>;
}
