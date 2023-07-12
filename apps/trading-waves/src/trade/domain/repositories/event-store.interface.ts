import { IOrderEvent } from '../events/order-events.interface';

export interface IEventStore {
  save(event: IOrderEvent): Promise<IOrderEvent>;
  getEventsForOrder(orderId: string): Promise<IOrderEvent[]>;
}
