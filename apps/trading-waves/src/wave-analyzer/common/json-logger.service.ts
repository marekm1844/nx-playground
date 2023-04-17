import { Logger, Injectable } from '@nestjs/common';

@Injectable()
//TODO: add this logger to the app module
export class JsonLogger extends Logger {
  log(message: string, context?: string): void {
    super.log(this.formatMessage('log', message, context));
  }

  error(message: string, trace?: string, context?: string): void {
    super.error(this.formatMessage('error', message, context), trace);
  }

  warn(message: string, context?: string): void {
    super.warn(this.formatMessage('warn', message, context));
  }

  debug(message: string, context?: string): void {
    super.debug(this.formatMessage('debug', message, context));
  }

  private formatMessage(level: string, message: string, context?: string): string {
    const logObj = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(logObj);
  }
}
