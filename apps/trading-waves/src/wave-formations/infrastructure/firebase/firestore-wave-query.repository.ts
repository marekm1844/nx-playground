import { Injectable } from '@nestjs/common';
import { FirestoreClient } from '../../../wave-analyzer/infrastructure/firestore/firestore.client';
import { ILastWaveCompletedRepository } from '../../domain/wave-repository.interface';
import * as firabase from 'firebase-admin';
import { LastWaveCompletedDTO } from '../../dto/last-wave-completed.dto';
import { WaveType } from '../../../shared/models/wave-type.enum';

@Injectable()
export class FirestoreLastWaveRepository implements ILastWaveCompletedRepository {
  private readonly collection;

  constructor(private firestoreClient: FirestoreClient) {
    const env = process.env.NODE_ENV || 'development';
    const collectionName = env === 'production' ? 'waves' : 'waves_test';
    this.collection = this.firestoreClient.firestore.collection(collectionName);
  }

  async getLastWavesCompleted(symbol: string, interval: string, lastN: number): Promise<LastWaveCompletedDTO[]> {
    const snapshot = await this.collection
      .where('symbol', '==', symbol)
      .where('interval', '!=', interval)
      .orderBy('interval', 'asc')
      .orderBy('createdAt', 'desc')
      .limit(lastN)
      .get();

    if (snapshot.empty) {
      throw new Error(`No last waves completed for symbol: ${symbol} and interval: ${interval}`);
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      const startdatetime = (data.createdAt as firabase.firestore.Timestamp).toDate();
      const type = data.type as WaveType;
      const interval = data.interval;

      return new LastWaveCompletedDTO(startdatetime, symbol, interval, type);
    });
  }
}
