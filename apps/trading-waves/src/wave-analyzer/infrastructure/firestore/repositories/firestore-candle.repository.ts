import { Injectable } from "@nestjs/common";
import { ICandle } from "../../../domain/models/candle-entity.interface";
import { ICandleRepository } from "../../../domain/repositories/candle-repository.interface";
import { FirestoreCandle } from "../entities/firestore-candle.entity";
import * as firebaseAdmin from 'firebase-admin';

@Injectable()
export class FirestoreCandleRepository implements ICandleRepository {
  private readonly collection = firebaseAdmin.firestore().collection('candles');

  async save(candle: ICandle): Promise<ICandle> {
    const firestoreCandle = candle as FirestoreCandle;
    const documentRef =  await this.collection.add(firestoreCandle.toFirestoreDocument());
    const savedCandleDocument = await documentRef.get();
    return FirestoreCandle.fromFirestoreDocument(savedCandleDocument);
  }

  async getCandlesByWaveId(waveId: string): Promise<ICandle[]> {
    const querySnapshot = await this.collection.where('wave.id', '==', waveId).get();
    return querySnapshot.docs.map(doc => doc.data() as FirestoreCandle);
  }
}