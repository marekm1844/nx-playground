import { Injectable } from '@nestjs/common';
import { IWave } from '../../../../shared/models/wave-entity.interface';
import { IWaveRepository } from '../../../domain/repositories/wave-repository.interface';
import { FirestoreWave } from '../entities/firestorm-wave.entity';
import { FirestoreClient } from '../firestore.client';

@Injectable()
export class FirestoreWaveRepository implements IWaveRepository {
  private readonly collection;

  constructor(private firestoreClient: FirestoreClient) {
    const env = process.env.NODE_ENV || 'development';
    const collectionName = env === 'production' ? 'waves' : 'waves_test';
    this.collection = this.firestoreClient.firestore.collection(collectionName);
  }

  async save(wave: IWave): Promise<IWave> {
    const firestoreWave = wave as FirestoreWave;
    const documentRef = await this.collection.add(firestoreWave.toFirestoreDocument());
    const savedWaveDocument = await documentRef.get();
    return FirestoreWave.fromFirestoreDocument(savedWaveDocument);
  }

  async getWaves(symbol: string, interval: string): Promise<IWave[]> {
    throw new Error('Method not implemented.');
  }
}
