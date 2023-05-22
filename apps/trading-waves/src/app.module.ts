import { Module } from '@nestjs/common';
import { WaveAnalyzerModule } from './wave-analyzer/wave-analyzer.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    WaveAnalyzerModule,
  ],
  controllers: [],
  providers: [ ],
})
export class AppModule {}


