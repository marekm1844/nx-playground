import { Module, CacheModule } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './cache-config';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          store: await redisStore({ url: configService.get<string>('REDIS_URL'), ttl: 5000 }),
        };
      },
      isGlobal: true,
    }),
  ],
})

export class  ProjectCacheModule {}
