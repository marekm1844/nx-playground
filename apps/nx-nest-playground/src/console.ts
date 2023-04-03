import { BootstrapConsole } from 'nestjs-console';
import { AppModule } from './app.module';


const bootstrap = new BootstrapConsole({
  module: AppModule, 
  useDecorators: true
});
bootstrap.init().then(async (app) => {
  try {
    await app.init();
    await bootstrap.boot();

    // Use app.close() instead of process.exit(), because app.close() will
    // trigger onModuleDestroy, beforeApplicationShutdown and onApplicationShutdown.
    // For example, in your command doing the database operation and need to close
    // when error or finish.
    await app.close();

    process.exit(0);
  } catch (e) {
    app.close();

    process.exit(1);
  }
});