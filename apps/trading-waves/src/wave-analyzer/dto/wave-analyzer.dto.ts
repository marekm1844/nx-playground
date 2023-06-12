// wave-analyzer.dto.ts
import { IsNotEmpty, IsString, IsIn, Matches } from 'class-validator';

const validIntervals = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];

export class WaveAnalyzerDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9]+$/)
  symbol: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(validIntervals)
  interval: string;
}
