import { AiCrawlerMatch } from '../config.js';
import { ActionExecutor } from './types.js';

type LogLevel = 'info' | 'warn' | 'error';

/**
 * Log AI crawler detection
 */
export function log(level: LogLevel = 'info'): ActionExecutor {
  return {
    execute(match: AiCrawlerMatch, request?: Request): void {
      const message = formatLogMessage(match, request);

      switch (level) {
        case 'info':
          console.info(message);
          break;
        case 'warn':
          console.warn(message);
          break;
        case 'error':
          console.error(message);
          break;
      }
    },
  };
}

/**
 * Log with custom formatter
 */
export function logWithFormatter(
  formatter: (match: AiCrawlerMatch, request?: Request) => string,
  level: LogLevel = 'info'
): ActionExecutor {
  return {
    execute(match: AiCrawlerMatch, request?: Request): void {
      const message = formatter(match, request);

      switch (level) {
        case 'info':
          console.info(message);
          break;
        case 'warn':
          console.warn(message);
          break;
        case 'error':
          console.error(message);
          break;
      }
    },
  };
}

/**
 * Format log message
 */
function formatLogMessage(match: AiCrawlerMatch, request?: Request): string {
  const timestamp = new Date().toISOString();
  const url = request ? new URL(request.url).pathname : 'N/A';
  const ip = match.ip || 'N/A';

  return `[${timestamp}] AI Crawler Detected - Type: ${match.type}, Confidence: ${match.confidence}, IP: ${ip}, URL: ${url}, UA: ${match.userAgent}`;
}

/**
 * Log to JSON format for structured logging
 */
export function logJson(level: LogLevel = 'info'): ActionExecutor {
  return {
    execute(match: AiCrawlerMatch, request?: Request): void {
      const logData = {
        timestamp: new Date().toISOString(),
        type: match.type,
        confidence: match.confidence,
        userAgent: match.userAgent,
        ip: match.ip,
        url: request ? new URL(request.url).pathname : undefined,
        isKnown: match.isKnown,
      };

      const message = JSON.stringify(logData);

      switch (level) {
        case 'info':
          console.info(message);
          break;
        case 'warn':
          console.warn(message);
          break;
        case 'error':
          console.error(message);
          break;
      }
    },
  };
}
