import { IEvent } from '@nestjs/cqrs';
import { IOrderProps } from '../models/order.interface';

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
  return (event as IOrderEvent).payload.id !== undefined;
}
