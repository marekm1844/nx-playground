/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;

    await app.listen(port);
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  } catch (error) {
    Logger.error('Error occurred while bootstrapping the application', error);
    process.exit(1);
  }
}
bootstrap().catch(err => {
  Logger.error('Uncaught error in bootstrap:', err);
  process.exit(1);
});
