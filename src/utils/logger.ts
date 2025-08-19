// Production-ready logging utility
// Replaces console.log statements with proper logging levels

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

class Logger {
  private logLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = this.isProduction ? LogLevel.WARN : LogLevel.INFO;
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
    }
    return `${prefix} ${message}`;
  }

  error(message: string, data?: any) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, data));
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, data));
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, data));
    }
  }

  debug(message: string, data?: any) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  // Special methods for common logging patterns
  success(message: string, data?: any) {
    this.info(`✅ ${message}`, data);
  }

  failure(message: string, data?: any) {
    this.error(`❌ ${message}`, data);
  }

  warning(message: string, data?: any) {
    this.warn(`⚠️ ${message}`, data);
  }

  debugInfo(message: string, data?: any) {
    this.debug(`🔍 ${message}`, data);
  }

  transaction(message: string, data?: any) {
    this.info(`💰 ${message}`, data);
  }

  nft(message: string, data?: any) {
    this.info(`🎨 ${message}`, data);
  }

  wallet(message: string, data?: any) {
    this.info(`🔐 ${message}`, data);
  }

  game(message: string, data?: any) {
    this.info(`🎮 ${message}`, data);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export the class for testing
export { Logger };
