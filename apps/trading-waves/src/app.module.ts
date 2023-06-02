import { Module } from '@nestjs/common';
import { WaveAnalyzerModule } from './wave-analyzer/wave-analyzer.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';
import { QueueModule } from './shared/events/infarstructure/redis-queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    QueueModule,
    WaveAnalyzerModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [ ],
})
export class AppModule {}


