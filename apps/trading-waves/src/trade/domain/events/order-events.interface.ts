import { IEvent } from '@nestjs/cqrs';
import { IOrderProps } from '../models/order.interface';
import { Order } from '../order.aggregate';

export enum OrderEventType {
  CREATED = 'OrderCreated',
  CANCELLED = 'OrderCancelled',
  FILLED = 'OrderFilled',
  PARTIALLY_FILLED = 'OrderPartiallyFilled',
  UPDATED = 'OrderUpdated',
}
export interface IOrderEventMetadata {
  eventId: string;
  aggregateId: string;
  sequenceNumber: number;
  createdAt: Date;
  version: number;
  correlationId?: string;
  causationId?: string;
}

export interface IOrderEvent {
  eventType: OrderEventType;
  payload: Partial<IOrderProps>;
}
export interface ISavedOrderEvent extends IOrderEventMetadata, IOrderEvent {}

export function isOrderEvent(event: IEvent): event is IOrderEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'eventType' in event &&
    Object.values(OrderEventType).includes(event.eventType as OrderEventType) &&
    'payload' in event &&
    typeof event.payload === 'object' &&
    event.payload !== null &&
    'id' in event.payload
  );
}
