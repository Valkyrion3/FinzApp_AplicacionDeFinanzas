/**
 * Centralized logging system
 * Provides structured logging with levels and timestamps
 * Can be extended to send logs to external services (Sentry, LogRocket, etc.)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private isDevelopment = __DEV__;
  private logs: LogEntry[] = [];
  private maxLogs = 500;

  /**
   * Log debug message
   */
  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: any) {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error;
    
    this.log('error', message, errorData);
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      level,
      timestamp,
      message,
      ...(data && { data }),
    };

    this.logs.push(logEntry);

    // Keep logs array size bounded
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Only log to console in development
    if (this.isDevelopment) {
      const prefix = `[${level.toUpperCase()}] ${timestamp}`;
      const logFn = this.getConsoleFn(level);
      
      if (data) {
        logFn(`${prefix} ${message}`, data);
      } else {
        logFn(`${prefix} ${message}`);
      }
    }

    // Could send to external service here
    // this.sendToExternalService(logEntry);
  }

  /**
   * Get appropriate console function
   */
  private getConsoleFn(level: LogLevel) {
    switch (level) {
      case 'debug':
        return console.log;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
        return console.error;
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Send logs to external service (to be implemented)
   * This would integrate with Sentry, LogRocket, or custom backend
   */
  private sendToExternalService(logEntry: LogEntry) {
    // Implementation would depend on your logging service
    // Example with Sentry:
    // if (logEntry.level === 'error') {
    //   Sentry.captureException(new Error(logEntry.message));
    // }
  }
}

// Create singleton instance
export const logger = new Logger();

/**
 * Convenience export for common operations
 */
export const log = {
  debug: (msg: string, data?: any) => logger.debug(msg, data),
  info: (msg: string, data?: any) => logger.info(msg, data),
  warn: (msg: string, data?: any) => logger.warn(msg, data),
  error: (msg: string, error?: any) => logger.error(msg, error),
  getLogs: () => logger.getLogs(),
  clearLogs: () => logger.clearLogs(),
  export: () => logger.exportLogs(),
};
