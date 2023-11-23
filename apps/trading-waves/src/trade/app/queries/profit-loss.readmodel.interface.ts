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

export interface IDailyProfitLossTracker extends IProfitLossTracker {
  /**
   * Date in format YYYYMMDD
   */
  date: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDailyProfitLossTracker(tracker: any): tracker is IDailyProfitLossTracker {
  return (tracker as IDailyProfitLossTracker).date !== undefined;
}
