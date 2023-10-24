import { Injectable, Logger } from '@nestjs/common';
import { FirestoreClient } from '../../../shared/repository/firestore.client';
import { IEventStore } from '../../domain/repositories/event-store.interface';
import { IOrderEvent, ISavedOrderEvent, isOrderEvent } from '../../domain/events/order-events.interface';
import { Order } from '../../domain/order.aggregate';
import { OrderInvalidEventTypeError } from '../../domain/errors/order.errors';
import * as uuid from 'uuid';

@Injectable()
export class FirestoreEventStore implements IEventStore {
  private readonly collection;

  constructor(private firestoreClient: FirestoreClient) {
    const env = process.env.NODE_ENV || 'development';
    const collectionName = env === 'production' ? 'order_events' : 'order_events_test';
    this.collection = this.firestoreClient.firestore.collection(collectionName);
  }

  async save(order: Order): Promise<void> {
    Logger.debug(`Saving events for order ${order.props.id}`);
    for (const event of order.getUncommittedEvents()) {
      if (!isOrderEvent(event)) {
        throw new OrderInvalidEventTypeError();
      }
      // Retrieve the current max sequence number for this order
      const maxSeqNumberSnapshot = await this.collection.where('orderId', '==', order.props.id).orderBy('sequenceNumber', 'desc').limit(1).get();

      let sequenceNumber = 1;
      if (!maxSeqNumberSnapshot.empty) {
        sequenceNumber = maxSeqNumberSnapshot.docs[0].data().sequenceNumber + 1;
      }

      const storedOrder: ISavedOrderEvent = {
        payload: event.payload,
        eventId: uuid.v4(),
        eventType: event.eventType,
        sequenceNumber: sequenceNumber,
        version: 1,
        createdAt: new Date(),
        aggregateId: order.props.id,
      };

      try {
        Logger.debug(`Saving event ${JSON.stringify(storedOrder)}`);
        await this.collection.add(storedOrder);
      } catch (error) {
        //TODO: retry after a while
        Logger.error(error);
      }
    }
  }

  async getEventsForOrder(orderId: string): Promise<IOrderEvent[]> {
    const querySnapshot = await this.collection.where('orderId', '==', orderId).orderBy('sequenceNumber').get();
    return querySnapshot.docs.map(doc => doc.data() as IOrderEvent);
  }
}
