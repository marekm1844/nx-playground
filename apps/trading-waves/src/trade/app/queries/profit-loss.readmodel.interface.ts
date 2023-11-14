export interface IProfitLossTracker {
  symbol: string;
  totalBought: number;
  totalSold: number;
  currrentQuantity: number;
  averageBuyPrice: number;
  averageSellPrice: number;
  netProfitLoss: number;
  lastUpdated: Date;
}
