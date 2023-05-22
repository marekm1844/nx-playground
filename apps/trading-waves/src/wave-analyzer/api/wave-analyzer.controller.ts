import { Controller, Get, Query } from "@nestjs/common";
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

  @Get('/start')
  start(
    @Query('symbol') symbol: string,
    @Query('interval') interval: string,
  ): string {
    this.waveAnalyzer.addRule(new UptrendCorpseCompareRule().or(new UptrendShadowCompareRule().or(new CandleWithinPreviousCandleRule().or(new CloseWithinPreviousCorpseRule()))));
    this.waveAnalyzer.addRule(new DowntrendCorpseCompareRule().or(new DowntrendShadowCompareRule().or(new CandleWithinPreviousCandleRule().or(new CloseWithinPreviousCorpseRule()))));
    const s1 = 'BTCUSDT';
    const s2 = '3m'
    this.waveAnalyzer.analyze(s1, s2);
    return `Wave analysis started for ${s1} with ${s2} interval`;
  }

  @Get('/stop')
  stop(): string {
    this.waveAnalyzer.stop();
    return 'Wave analysis stopped';
  }
}