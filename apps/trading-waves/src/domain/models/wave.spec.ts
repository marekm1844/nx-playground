import { Candle } from './candle.entity';
import { Wave } from './wave.entity';

describe('Wave', () => {
  let wave: Wave;

  beforeEach(() => {
    wave = new Wave();
  });

  it('should start with no candles', () => {
    expect(wave['candles'].length).toBe(0);
  });

  it('should add candles', () => {
    const candle = new Candle({
      openTime: 1635580800000,
      open: '61000.00',
      high: '62000.00',
      low: '60000.00',
      close: '61500.00',
      volume: '1000',
      closeTime: 1635584399999,
      quoteAssetVolume: '61500000.00',
      numberOfTrades: 10000,
      takerBuyBaseAssetVolume: '500',
      takerBuyQuoteAssetVolume: '30750000.00',
      ignore: 0,
    });

    wave.addCandle(candle);
    expect(wave['candles'].length).toBe(1);
  });

  it('should detect latest uptrend', () => {
    const candle1 = new Candle({
      openTime: 1635580800000,
      open: '61000.00',
      high: '62000.00',
      low: '60000.00',
      close: '61500.00',
      volume: '1000',
      closeTime: 1635584399999,
      quoteAssetVolume: '61500000.00',
      numberOfTrades: 10000,
      takerBuyBaseAssetVolume: '500',
      takerBuyQuoteAssetVolume: '30750000.00',
      ignore: 0,
    });

    const candle2 = new Candle({
      openTime: 1635584400000,
      open: '61500.00',
      high: '62500.00',
      low: '60500.00',
      close: '62000.00',
      volume: '1000',
      closeTime: 1635587999999,
      quoteAssetVolume: '62000000.00',
      numberOfTrades: 10000,
      takerBuyBaseAssetVolume: '500',
      takerBuyQuoteAssetVolume: '31000000.00',
      ignore: 0,
    });

    wave.addCandle(candle1);
    wave.addCandle(candle2);

    expect(wave.isLatestUptrend()).toBe(true);
  });

  it('should not detect latest uptrend if only one candle', () => {
    const candle = new Candle({
      openTime: 1635580800000,
      open: '61000.00',
      high: '62000.00',
      low: '60000.00',
      close: '61500.00',
      volume: '1000',
      closeTime: 1635584399999,
      quoteAssetVolume: '61500000.00',
      numberOfTrades: 10000,
      takerBuyBaseAssetVolume: '500',
      takerBuyQuoteAssetVolume: '30750000.00',
      ignore: 0,
    });

    wave.addCandle(candle);
    expect(wave.isLatestUptrend()).toBe(false);
  });

  it('should not detect latest uptrend if trend is down', () => {
    const candle1 = new Candle({
      openTime: 1635580800000,
      open: '62000.00',
      high: '63000.00',
      low: '61000.00',
      close: '62500.00',
      volume: '1000',
      closeTime: 1635584399999,
      quoteAssetVolume: '62500000.00',
      numberOfTrades: 10000,
      takerBuyBaseAssetVolume: '500',
      takerBuyQuoteAssetVolume: '31250000.00',
      ignore: 0,
    });

    const candle2 = new Candle({
      openTime: 1635584400000,
      open: '62500.00',
      high: '63500.00',
      low: '61500.00',
      close: '62000.00',
      volume: '1000',
      closeTime: 1635587999999,
      quoteAssetVolume: '62000000.00',
      numberOfTrades: 10000,
      takerBuyBaseAssetVolume: '500',
      takerBuyQuoteAssetVolume: '31000000.00',
      ignore: 0,
    });

    wave.addCandle(candle1);
    wave.addCandle(candle2);

    expect(wave.isLatestUptrend()).toBe(false);
  });
});
