import { ConsoleLogger, Logger, Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { ProjectCacheModule } from './cache/project-cache.module';


@Module({
  imports: [UserModule, DatabaseModule, ConsoleModule, ProjectCacheModule],
  controllers: [AppController],
  providers: [AppService, { provide: Logger, useClass: ConsoleLogger }],
})
export class AppModule {}
