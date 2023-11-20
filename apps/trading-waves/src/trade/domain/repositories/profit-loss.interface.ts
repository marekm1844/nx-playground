import { IDailyProfitLossTracker, IProfitLossTracker } from '../../app/queries/profit-loss.readmodel.interface';

export interface IProfitLossRepository {
  save(tracker: IProfitLossTracker): void;
  getProfitLoss(symbol: string): Promise<IProfitLossTracker>;
  getDailyProfitLoss(symbol: string, date: number): Promise<IDailyProfitLossTracker>;
  saveDaily(tracker: IProfitLossTracker): void;
}
