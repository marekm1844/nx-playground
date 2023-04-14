import { Module } from '@nestjs/common';

import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { WaveAnalyzerModule } from './wave-analyzer/wave-analyzer.module';


@Module({
  imports: [
    WaveAnalyzerModule
  ],
  controllers: [],
  providers: [ ],
})
export class AppModule {}
