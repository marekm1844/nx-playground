// src/application/wave-analyzer.spec.ts

import { ICandleDataProvider } from '../../infrastructure/icandle-data-provider.interface';
import { Candle } from '../models/candle.entity';
import { IRule } from '../rules/rule.interface';
import { UptrendCorpseCompareRule } from '../rules/uptrend-corpse-compare-rule';
import { WaveAnalyzer } from './wave-analyzer';

describe('WaveAnalyzer', () => {
    let candleDataProvider: ICandleDataProvider;
    let rules: IRule[];
    let waveAnalyzer: WaveAnalyzer;
  
    beforeEach(() => {
      // Mock ICandleDataProvider
      candleDataProvider = {
        candles: jest.fn().mockImplementation(async function* () {
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
              });
              const candle2 = new Candle({
                openTime: Date.now(),
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
              });

          yield candle1;
          yield candle2;
        }),
        close: jest.fn(),
      };
  
      // Mock IRule
      rules = [
        new UptrendCorpseCompareRule(),
      ];
  
      waveAnalyzer = new WaveAnalyzer(candleDataProvider);
      waveAnalyzer.addRule(rules[0]);
    });
  
    test('analyze method should detect an uptrend wave', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
      await waveAnalyzer.analyze('BTCUSDT', '1h');
  
      expect(logSpy).toHaveBeenCalledWith('Uptrend wave detected');
      logSpy.mockRestore();
    });
  });