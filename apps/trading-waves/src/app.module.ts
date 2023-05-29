import { Module } from '@nestjs/common';
import { WaveAnalyzerModule } from './wave-analyzer/wave-analyzer.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    WaveAnalyzerModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [ ],
})
export class AppModule {}


