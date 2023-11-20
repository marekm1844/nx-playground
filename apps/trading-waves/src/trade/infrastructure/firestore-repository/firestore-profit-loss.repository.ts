import { Inject, Injectable, Logger } from '@nestjs/common';
import { FirestoreClient } from '../../../shared/repository/firestore.client';
import { IProfitLossRepository } from '../../domain/repositories/profit-loss.interface';
import { IDailyProfitLossTracker, IProfitLossTracker } from '../../app/queries/profit-loss.readmodel.interface';

@Injectable()
export class FirestoreProfitLossRepository implements IProfitLossRepository {
  private readonly collection;

  constructor(private firestoreClient: FirestoreClient, @Inject('FIREBASE_PROFITLOST_TRACKER_COLLECTION') private readonly collectionName: string) {
    this.collection = this.firestoreClient.firestore.collection(collectionName);
  }

  async save(tracker: IProfitLossTracker): Promise<void> {
    try {
      await this.collection.doc(tracker.symbol).set(tracker, { merge: true });
    } catch (error) {
      Logger.error(`[FirestoreProfitLossRepository] Error saving profit loss tracker ${JSON.stringify(tracker)}: ${error}]`);
    }
  }

  async saveDaily(tracker: IDailyProfitLossTracker): Promise<void> {
    try {
      await this.collection.doc(tracker.date + ':' + tracker.symbol).set(tracker, { merge: true });
    } catch (error) {
      Logger.error(`[FirestoreProfitLossRepository] Error saving daily profit loss tracker ${JSON.stringify(tracker)}: ${error}]`);
    }
  }

  async getDailyProfitLoss(symbol: string, date: number): Promise<IDailyProfitLossTracker> {
    const querySnapshot = await this.collection.where('symbol', '==', symbol).where('date', '==', date).get();
    const dailyProfitLossTracker = querySnapshot.docs.map(doc => doc.data() as IDailyProfitLossTracker)[0];

    if (!dailyProfitLossTracker) {
      return null;
    }

    Logger.debug(`Retrieved daily profit loss tracker for symbol ${symbol}: ${JSON.stringify(dailyProfitLossTracker)}`);
    return dailyProfitLossTracker;
  }

  async getProfitLoss(symbol: string): Promise<IProfitLossTracker> {
    const querySnapshot = await this.collection.doc(symbol).get();
    const profitLossTracker = querySnapshot.data() as IProfitLossTracker;

    if (!profitLossTracker) {
      return null;
    }

    Logger.debug(`Retrieved profit loss tracker for symbol ${symbol}: ${JSON.stringify(profitLossTracker)}`);
    return profitLossTracker;
  }
}
