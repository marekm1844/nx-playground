import { Body, Controller, Logger, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { UptrendCorpseCompareRule } from '../domain/rules/uptrend-corpse-compare-rule';
import { DowntrendCorpseCompareRule } from '../domain/rules/downtrend-corpse-compare-rule';
import { UptrendShadowCompareRule } from '../domain/rules/uptrend-shadow-compare-rule';
import { CandleWithinPreviousCandleRule } from '../domain/rules/candle-within-previous-rule';
import { CloseWithinPreviousCorpseRule } from '../domain/rules/close-within-previous-corpse-rule';
import { DowntrendShadowCompareRule } from '../domain/rules/downtrend-shadow-compare-rule';
import { WaveAnalyzerFactory } from '../domain/analysis/wave-analyzer.factory';

@Controller()
export class WaveAnalyzerController {
  constructor(private readonly waveAnalyzerFactory: WaveAnalyzerFactory) {}

  @Post('/start')
  @UsePipes(new ValidationPipe())
  async start(@Body() WaveAnalyzerDto): Promise<string> {
    const { symbol, interval } = WaveAnalyzerDto;

    if (this.waveAnalyzerFactory.isRunning(symbol, interval)) {
      return `Wave analysis is already running for ${symbol} with ${interval} interval`;
    }

    const waveAnalyzer = this.waveAnalyzerFactory.create(symbol, interval);

    waveAnalyzer.addRule(new UptrendCorpseCompareRule().or(new UptrendShadowCompareRule().or(new CandleWithinPreviousCandleRule().or(new CloseWithinPreviousCorpseRule()))));
    waveAnalyzer.addRule(new DowntrendCorpseCompareRule().or(new DowntrendShadowCompareRule().or(new CandleWithinPreviousCandleRule().or(new CloseWithinPreviousCorpseRule()))));

    waveAnalyzer.analyze(symbol, interval).catch(err => {
      Logger.error(err);
    });

    return `Wave analysis started for ${symbol} with ${interval} interval`;
  }

  @Post('/stop')
  @UsePipes(new ValidationPipe())
  stop(@Body() WaveAnalyzerDto): string {
    const { symbol, interval } = WaveAnalyzerDto;
    this.waveAnalyzerFactory.stop(symbol, interval);
    return `Wave analysis stopped for ${symbol} with ${interval} interval`;
  }
}
