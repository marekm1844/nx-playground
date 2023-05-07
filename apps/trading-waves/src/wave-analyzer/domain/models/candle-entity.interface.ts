export enum CandleColor {
    Green,
    Red,
  }
  
  export interface ICandle {
    id: number;
    openTime: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closeTime: Date;
    quoteAssetVolume: number;
    numberOfTrades: number;
    takerBuyBaseAssetVolume: number;
    takerBuyQuoteAssetVolume: number;
    ignore: number;
    completed: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wave: any; // Use the appropriate wave interface or class type
    color: CandleColor;
    maximumCorpse: number;
    minimumCorpse: number;
  }