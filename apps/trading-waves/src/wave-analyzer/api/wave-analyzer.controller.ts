import { Controller, Get, Query } from "@nestjs/common";
import { WaveAnalyzer } from "../domain/analysis/wave-analyzer";
import { UptrendCorpseCompareRule } from "../domain/rules/uptrend-corpse-compare-rule";
import { DowntrendCorpseCompareRule } from "../domain/rules/downtrend-corpse-compare-rule";

@Controller()
export class WaveAnalyzerController {
  constructor(private readonly waveAnalyzer: WaveAnalyzer) {}

  @Get('/start')
  start(
    @Query('symbol') symbol: string,
    @Query('interval') interval: string,
  ): string {
    this.waveAnalyzer.addRule(new UptrendCorpseCompareRule());
    this.waveAnalyzer.addRule(new DowntrendCorpseCompareRule());
    const s1 = 'BTCUSDT';
    const s2 = '1m'
    this.waveAnalyzer.analyze(s1, s2);
    return `Wave analysis started for ${s1} with ${s2} interval`;
  }

  @Get('/stop')
  stop(): string {
    this.waveAnalyzer.stop();
    return 'Wave analysis stopped';
  }
}