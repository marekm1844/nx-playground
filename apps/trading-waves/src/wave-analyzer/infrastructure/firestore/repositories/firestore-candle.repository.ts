import { Inject, Injectable, Logger } from '@nestjs/common';
import { ICandle } from '../../../../shared/models/candle-entity.interface';
import { ICandleRepository } from '../../../domain/repositories/candle-repository.interface';
import { FirestoreCandle } from '../entities/firestore-candle.entity';
import * as firebaseAdmin from 'firebase-admin';
import { FirestoreClient } from '../firestore.client';

@Injectable()
export class FirestoreCandleRepository implements ICandleRepository {
  private readonly collection = this.firestoreClient.firestore.collection('candles');

  constructor(private firestoreClient: FirestoreClient) {}

  async save(candle: ICandle): Promise<ICandle> {
    const firestoreCandle = candle as FirestoreCandle;
    const documentData = firestoreCandle.toFirestoreDocument();
    const documentRef = await this.collection.add(documentData);
    const savedCandleDocument = await documentRef.get();
    return FirestoreCandle.fromFirestoreDocument(savedCandleDocument);
  }

  async getCandlesByWaveId(waveId: string): Promise<ICandle[]> {
    const querySnapshot = await this.collection.where('wave.id', '==', waveId).get();
    return querySnapshot.docs.map(doc => doc.data() as FirestoreCandle);
  }
}
