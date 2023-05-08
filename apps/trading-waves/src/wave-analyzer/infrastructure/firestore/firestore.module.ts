// firebase.module.ts
import { Module } from '@nestjs/common';
import { FirestoreClient } from './firestore.client';

@Module({
    providers: [FirestoreClient],
    exports: [FirestoreClient],
  })
export class FirestoreModule {}
