import { Module } from '@nestjs/common';
import { WaveAnalyzerModule } from './wave-analyzer/wave-analyzer.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';
import { QueueModule } from './shared/events/infarstructure/redis-queue.module';
import { WaveFormationsModule } from './wave-formations/wave-formations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    QueueModule,
    WaveAnalyzerModule,
    NotificationModule,
    WaveFormationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
