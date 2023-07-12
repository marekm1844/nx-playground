import { IOrderProps } from '../models/order.interface';

export enum OrderEventType {
  CREATED = 'OrderCreated',
  CANCELLED = 'OrderCancelled',
  FILLED = 'OrderFilled',
  PARTIALLY_FILLED = 'OrderPartiallyFilled',
  UPDATED = 'OrderUpdated',
}

export interface IOrderEvent {
  id: string;
  sequenceNumber?: number;
  orderId: string;
  eventType: string;
  eventData: Partial<IOrderProps>;
  createdAt: Date;
}
