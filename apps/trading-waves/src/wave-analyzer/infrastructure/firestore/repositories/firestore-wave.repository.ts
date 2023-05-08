import { Inject, Injectable, Logger } from "@nestjs/common";
import { IWave } from "../../../domain/models/wave-entity.interface";
import { IWaveRepository } from "../../../domain/repositories/wave-repository.interface";
import * as firebaseAdmin from 'firebase-admin';
import { FirestoreWave } from "../entities/firestorm-wave.entity";
import { FirestoreClient } from "../firestore.client";
import { log } from "console";

@Injectable()
export class FirestoreWaveRepository implements IWaveRepository {
  private readonly collection = this.firestoreClient.firestore.collection('waves');

  constructor( private firestoreClient: FirestoreClient ) {}

  async save(wave: IWave): Promise<IWave> {
    const firestoreWave = wave as FirestoreWave;
    const documentRef = await this.collection.add(firestoreWave.toFirestoreDocument());
    const savedWaveDocument = await documentRef.get();
    return FirestoreWave.fromFirestoreDocument(savedWaveDocument);  
  }

  async getWaves(): Promise<IWave[]> {
    throw new Error("Method not implemented.");
  }
}