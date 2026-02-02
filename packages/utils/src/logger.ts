type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
  child: (context: LogContext) => Logger;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';

  if (process.env.NODE_ENV === 'production') {
    // JSON формат для production
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...context,
    });
  }

  // Читаемый формат для development
  const colors: Record<LogLevel, string> = {
    debug: '\x1b[36m', // cyan
    info: '\x1b[32m', // green
    warn: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
  };
  const reset = '\x1b[0m';

  return `${colors[level]}[${timestamp}] ${level.toUpperCase()}${reset}: ${message}${contextStr}`;
}

function createLogger(baseContext: LogContext = {}): Logger {
  const log = (level: LogLevel, message: string, context?: LogContext) => {
    if (!shouldLog(level)) return;

    const mergedContext = { ...baseContext, ...context };
    const formatted = formatMessage(level, message, mergedContext);

    switch (level) {
      case 'debug':
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  };

  return {
    debug: (message: string, context?: LogContext) =>
      log('debug', message, context),
    info: (message: string, context?: LogContext) =>
      log('info', message, context),
    warn: (message: string, context?: LogContext) =>
      log('warn', message, context),
    error: (message: string, context?: LogContext) =>
      log('error', message, context),
    child: (context: LogContext) =>
      createLogger({ ...baseContext, ...context }),
  };
}

export const logger = createLogger();

export { createLogger, type Logger, type LogLevel, type LogContext };
