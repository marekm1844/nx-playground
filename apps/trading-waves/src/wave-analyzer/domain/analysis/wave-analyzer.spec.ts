import { Test } from '@nestjs/testing';
import { WaveAnalyzer } from './wave-analyzer';
import { CANDLE_DATA_PROVIDER, ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';
import { UptrendCorpseCompareRule } from '../rules/uptrend-corpse-compare-rule';
import { DowntrendCorpseCompareRule } from '../rules/downtrend-corpse-compare-rule';
import { UptrendShadowCompareRule } from '../rules/uptrend-shadow-compare-rule';
import { CandleWithinPreviousCandleRule} from '../rules/candle-within-previous-rule';
import { CloseWithinPreviousCorpseRule } from '../rules/close-within-previous-corpse-rule';
import { DowntrendShadowCompareRule } from '../rules/downtrend-shadow-compare-rule';
import { Candle } from '../models/candle.entity';
import { WaveType } from './wave-type.enum';



describe('WaveAnalyzer', () => {
  let waveAnalyzer: WaveAnalyzer;
  let candleDataProvider: ICandleDataProvider;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        WaveAnalyzer,
        {
          provide: CANDLE_DATA_PROVIDER,
          useValue: {
            candles: jest.fn(),
            close: jest.fn(),
          },
        },
      ],
    }).compile();

    waveAnalyzer = moduleRef.get<WaveAnalyzer>(WaveAnalyzer);
    candleDataProvider = moduleRef.get<ICandleDataProvider>(CANDLE_DATA_PROVIDER);
  });

  it('should analyze waves with uptrend and downtrend rules', async () => {
    const uptrendRule = new UptrendCorpseCompareRule().or(new UptrendShadowCompareRule().or(new CandleWithinPreviousCandleRule().or(new CloseWithinPreviousCorpseRule())));
    const downtrendRule = new DowntrendCorpseCompareRule().or(new DowntrendShadowCompareRule().or(new CandleWithinPreviousCandleRule().or(new CloseWithinPreviousCorpseRule())));

    waveAnalyzer.addRule(uptrendRule);
    waveAnalyzer.addRule(downtrendRule);

    //starting with uptrend normal candle
    const candle1 = new Candle({
      openTime: Date.now(),
      open: '80',
      high: '100',
      low: '70',
      close: '90',
      volume: '1000',
      closeTime: Date.now() + 60000,
      quoteAssetVolume: '105000',
      numberOfTrades: 10,
      takerBuyBaseAssetVolume: '500',
      takerBuyQuoteAssetVolume: '52500',
      ignore: 0,
      completed: true,
    });
    //
    const candle2 = new Candle({
      openTime: Date.now()+ 60000,
      open: '100',
      high: '100',
      low: '75',
      close: '80',
      volume: '1000',
      closeTime: Date.now() + 120000,
      quoteAssetVolume: '110000',
      numberOfTrades: 15,
      takerBuyBaseAssetVolume: '600',
      takerBuyQuoteAssetVolume: '66000',
      ignore: 0,
      completed: true,
    });
    const candle3 = new Candle({
      openTime: Date.now()+ 70000,
      open: '80',
      high: '140',
      low: '75',
      close: '75',
      volume: '1000',
      closeTime: Date.now() + 130000,
      quoteAssetVolume: '110000',
      numberOfTrades: 15,
      takerBuyBaseAssetVolume: '600',
      takerBuyQuoteAssetVolume: '66000',
      ignore: 0,
      completed: true,
    });
    const candle4 = new Candle({
      openTime: Date.now()+ 120000,
      open: '75',
      high: '80',
      low: '70',
      close: '70',
      volume: '1000',
      closeTime: Date.now() + 180000,
      quoteAssetVolume: '115000',
      numberOfTrades: 20,
      takerBuyBaseAssetVolume: '700',
      takerBuyQuoteAssetVolume: '77000',
      ignore: 0,
      completed: true,
    });
    const candle5 = new Candle({
      openTime: Date.now()+ 180000,
      open: '70',
      high: '70',
      low: '50',
      close: '60',
      volume: '1000',
      closeTime: Date.now() + 240000,
      quoteAssetVolume: '120000',
      numberOfTrades: 25,
      takerBuyBaseAssetVolume: '800',
      takerBuyQuoteAssetVolume: '88000',
      ignore: 0,
      completed: true,
    });
    const candle6 = new Candle({
      openTime: Date.now()+ 240000,
      open: '60',
      high: '70',
      low: '40',
      close: '40',
      volume: '1000',
      closeTime: Date.now() + 300000,
      quoteAssetVolume: '125000',
      numberOfTrades: 30,
      takerBuyBaseAssetVolume: '900',
      takerBuyQuoteAssetVolume: '99000',
      ignore: 0,
      completed: true,
    });
    const candle7 = new Candle({
      openTime: Date.now()+ 300000,
      open: '40',
      high: '50',
      low: '30',
      close: '50',
      volume: '1000',
      closeTime: Date.now() + 360000,
      quoteAssetVolume: '130000',
      numberOfTrades: 35,
      takerBuyBaseAssetVolume: '1000',
      takerBuyQuoteAssetVolume: '110000',
      ignore: 0,
      completed: true,
    });
    const candle8 = new Candle({
      openTime: Date.now()+ 360000,
      open: '55',
      high: '70',
      low: '30',
      close: '60',
      volume: '1000',
      closeTime: Date.now() + 420000,
      quoteAssetVolume: '135000',
      numberOfTrades: 40,
      takerBuyBaseAssetVolume: '1100',
      takerBuyQuoteAssetVolume: '121000',
      ignore: 0,
      completed: true,
    });
    const candle9 = new Candle({
      openTime: Date.now()+ 420000,
      open: '60',
      high: '70',
      low: '50',
      close: '70',
      volume: '1000',
      closeTime: Date.now() + 480000,
      quoteAssetVolume: '140000',
      numberOfTrades: 45,
      takerBuyBaseAssetVolume: '1200',
      takerBuyQuoteAssetVolume: '132000',
      ignore: 0,
      completed: true,
    });
    const candle10 = new Candle({
      openTime: Date.now()+ 480000,
      open: '70',
      high: '90',
      low: '50',
      close: '50',
      volume: '1000',
      closeTime: Date.now() + 540000,
      quoteAssetVolume: '145000',
      numberOfTrades: 50,
      takerBuyBaseAssetVolume: '1300',
      takerBuyQuoteAssetVolume: '143000',
      ignore: 0,
      completed: true,
    });
    const candle11 = new Candle({
      openTime: Date.now()+ 540000,
      open: '50',
      high: '60',
      low: '20',
      close: '40',
      volume: '1000',
      closeTime: Date.now() + 600000,
      quoteAssetVolume: '150000',
      numberOfTrades: 55,
      takerBuyBaseAssetVolume: '1400',
      takerBuyQuoteAssetVolume: '154000',
      ignore: 0,
      completed: true,
    });





 

    const mockCandles = [candle1, candle2, candle3, candle4, candle5, candle6, candle7, candle8, candle9, candle10, candle11];

    // Mock the candleDataProvider to return the mock candles
    (candleDataProvider.candles as jest.Mock).mockImplementation(async function* () {
      for (const candle of mockCandles) {
        yield candle;
      }
    });

    await waveAnalyzer.analyze('symbol', 'interval');

    // Add your assertions here
    // Example: expect the number of waves created
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const waves = (waveAnalyzer as any).waves;
    expect(waves.length).toEqual(2);


    // Example: expect the wave types to be correct
    expect(waves[0].getType()).toEqual(WaveType.Uptrend);
    expect(waves[1].getType()).toEqual(WaveType.Downtrend);

  });

  // Test case 1: No rules are added
it('should not create any waves when no rules are added', async () => {
  const candle1 = new Candle({
    openTime: Date.now(),
    open: '100',
    high: '110',
    low: '90',
    close: '105',
    volume: '1000',
    closeTime: Date.now() + 60000,
    quoteAssetVolume: '105000',
    numberOfTrades: 10,
    takerBuyBaseAssetVolume: '500',
    takerBuyQuoteAssetVolume: '52500',
    ignore: 0,
    completed: true,
  });
  const candle2 = new Candle({
    openTime: Date.now()+ 60000,
    open: '105',
    high: '120',
    low: '95',
    close: '120',
    volume: '1000',
    closeTime: Date.now() + 120000,
    quoteAssetVolume: '110000',
    numberOfTrades: 15,
    takerBuyBaseAssetVolume: '600',
    takerBuyQuoteAssetVolume: '66000',
    ignore: 0,
    completed: true,
  });

  const mockCandles = [candle1, candle2];

  (candleDataProvider.candles as jest.Mock).mockImplementation(async function* () {
    for (const candle of mockCandles) {
      yield candle;
    }
  });

  await waveAnalyzer.analyze('symbol', 'interval');

  const waves = (waveAnalyzer as any).waves;
  expect(waves.length).toEqual(0);
});

//write test to check the uptend rule with CandleWithinPreviousCandleRule rule 
it('should create a wave when the uptrend rule is added', async () => {
  const candle1 = new Candle({
    openTime: Date.now(),
    open: '100',
    high: '110',
    low: '90',
    close: '105',
    volume: '1000',
    closeTime: Date.now() + 60000,
    quoteAssetVolume: '105000',
    numberOfTrades: 10,
    takerBuyBaseAssetVolume: '500',
    takerBuyQuoteAssetVolume: '52500',
    ignore: 0,
    completed: true,
  });
  const candle2 = new Candle({
    openTime: Date.now()+ 60000,
    open: '105',
    high: '120',
    low: '95',
    close: '120',
    volume: '1000',
    closeTime: Date.now() + 120000,
    quoteAssetVolume: '110000',
    numberOfTrades: 15,
    takerBuyBaseAssetVolume: '600',
    takerBuyQuoteAssetVolume: '66000',
    ignore: 0,
    completed: true,
  });
  const candle3 = new Candle({
    openTime: Date.now()+ 120000,
    open: '115',
    high: '115',
    low: '110',
    close: '110',
    volume: '1000',
    closeTime: Date.now() + 180000,
    quoteAssetVolume: '115000',
    numberOfTrades: 20,
    takerBuyBaseAssetVolume: '700',
    takerBuyQuoteAssetVolume: '77000',
    ignore: 0,
    completed: true,
  });


  const mockCandles = [candle1, candle2, candle3];

  (candleDataProvider.candles as jest.Mock).mockImplementation(async function* () {
    for (const candle of mockCandles) {
      yield candle;
    }
  });

  waveAnalyzer.addRule(new UptrendCorpseCompareRule().or(new CandleWithinPreviousCandleRule()));
  await waveAnalyzer.analyze('symbol', 'interval');

  const waves = (waveAnalyzer as any).waves;
  expect(waves.length).toEqual(1);
  expect(waves[0].getType()).toEqual(WaveType.Uptrend);

});

//write test to check the downtrend rule with CandleWithinPreviousCandleRule rule
it('should create a wave when the downtrend rule is added', async () => {
  const candle1 = new Candle({
    openTime: Date.now(),
    open: '100',
    high: '110',
    low: '90',
    close: '90',
    volume: '1000',
    closeTime: Date.now() + 60000,
    quoteAssetVolume: '105000',
    numberOfTrades: 10,
    takerBuyBaseAssetVolume: '500',
    takerBuyQuoteAssetVolume: '52500',
    ignore: 0,
    completed: true,
  });
  const candle2 = new Candle({
    openTime: Date.now()+ 60000,
    open: '90',
    high: '120',
    low: '70',
    close: '70',
    volume: '1000',
    closeTime: Date.now() + 120000,
    quoteAssetVolume: '110000',
    numberOfTrades: 15,
    takerBuyBaseAssetVolume: '600',
    takerBuyQuoteAssetVolume: '66000',
    ignore: 0,
    completed: true,
  });
  const candle3 = new Candle({
    openTime: Date.now()+ 120000,
    open: '70',
    high: '85',
    low: '70',
    close: '80',
    volume: '1000',
    closeTime: Date.now() + 180000,
    quoteAssetVolume: '115000',
    numberOfTrades: 20,
    takerBuyBaseAssetVolume: '700',
    takerBuyQuoteAssetVolume: '77000',
    ignore: 0,
    completed: true,
  });
  
  const mockCandles = [candle1, candle2, candle3];
  (candleDataProvider.candles as jest.Mock).mockImplementation(async function* () {
    for (const candle of mockCandles) {
      yield candle;
    }
  }
  );
  waveAnalyzer.addRule(new DowntrendCorpseCompareRule().or(new CandleWithinPreviousCandleRule()));
  await waveAnalyzer.analyze('symbol', 'interval');
  const waves = (waveAnalyzer as any).waves;
  expect(waves.length).toEqual(1);
  expect(waves[0].getType()).toEqual(WaveType.Downtrend);
});

});


  

