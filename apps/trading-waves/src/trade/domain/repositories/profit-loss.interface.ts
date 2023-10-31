import { IProfitLossTracker } from '../../app/queries/profit-loss.readmodel.interface';

export interface IProfitLossRepository {
  save(tracker: IProfitLossTracker): void;
  getProfitLoss(symbol: string): Promise<IProfitLossTracker>;
}
