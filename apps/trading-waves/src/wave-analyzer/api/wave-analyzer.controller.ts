import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { WaveAnalyzer } from "../domain/analysis/wave-analyzer";
import { UptrendCorpseCompareRule } from "../domain/rules/uptrend-corpse-compare-rule";
import { DowntrendCorpseCompareRule } from "../domain/rules/downtrend-corpse-compare-rule";
import { UptrendShadowCompareRule } from "../domain/rules/uptrend-shadow-compare-rule";
import { CandleWithinPreviousCandleRule } from "../domain/rules/candle-within-previous-rule";
import { CloseWithinPreviousCorpseRule } from "../domain/rules/close-within-previous-corpse-rule";
import { DowntrendShadowCompareRule } from "../domain/rules/downtrend-shadow-compare-rule";

@Controller()
export class WaveAnalyzerController {
  constructor(private readonly waveAnalyzer: WaveAnalyzer) {}

  @Post('/start')
  async start(@Body('symbol') symbol: string, @Body('interval') interval: string): Promise<string> {
    this.waveAnalyzer.addRule(new UptrendCorpseCompareRule().or(new UptrendShadowCompareRule().or(new CandleWithinPreviousCandleRule().or(new CloseWithinPreviousCorpseRule()))));
    this.waveAnalyzer.addRule(new DowntrendCorpseCompareRule().or(new DowntrendShadowCompareRule().or(new CandleWithinPreviousCandleRule().or(new CloseWithinPreviousCorpseRule()))));

    this.waveAnalyzer.analyze(symbol, interval).catch(error => {
      // Handle your error here
      console.error('An error occurred during analysis:', error);
    });;
    return `Wave analysis started for ${symbol} with ${interval} interval`;
  }

  @Get('/stop')
  stop(): string {
    this.waveAnalyzer.stop();
    return 'Wave analysis stopped';
  }
}