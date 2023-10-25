import { Order } from '../order.aggregate';

export interface IEventStore {
  save(order: Order): Promise<void>;
  getEventsForOrder(orderId: string): Promise<Order | null>;
}
