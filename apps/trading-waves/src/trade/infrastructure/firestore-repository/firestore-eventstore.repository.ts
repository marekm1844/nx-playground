import { Injectable } from '@nestjs/common';
import { FirestoreClient } from '../../../wave-analyzer/infrastructure/firestore/firestore.client';
import { IEventStore } from '../../domain/repositories/event-store.interface';
import { IOrderEvent } from '../../domain/events/order-events.interface';

@Injectable()
export class FirestoreEventStore implements IEventStore {
  private readonly collection;

  constructor(private firestoreClient: FirestoreClient) {
    const env = process.env.NODE_ENV || 'development';
    const collectionName = env === 'production' ? 'order_events' : 'order_events_test';
    this.collection = this.firestoreClient.firestore.collection(collectionName);
  }

  async save(event: IOrderEvent): Promise<IOrderEvent> {
    // Retrieve the current max sequence number for this order
    const maxSeqNumberSnapshot = await this.collection.where('orderId', '==', event.orderId).orderBy('sequenceNumber', 'desc').limit(1).get();

    let sequenceNumber = 1;
    if (!maxSeqNumberSnapshot.empty) {
      sequenceNumber = maxSeqNumberSnapshot.docs[0].data().sequenceNumber + 1;
    }

    const eventWithSeqNumber = { ...event, sequenceNumber };

    const documentRef = await this.collection.add(eventWithSeqNumber);
    const savedEventDocument = await documentRef.get();
    return savedEventDocument.data() as IOrderEvent;
  }

  async getEventsForOrder(orderId: string): Promise<IOrderEvent[]> {
    const querySnapshot = await this.collection.where('orderId', '==', orderId).orderBy('sequenceNumber').get();
    return querySnapshot.docs.map(doc => doc.data() as IOrderEvent);
  }
}
