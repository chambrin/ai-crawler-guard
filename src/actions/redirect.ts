import { AiCrawlerMatch } from '../config.js';
import { ActionExecutor } from './types.js';

/**
 * Redirect AI crawlers to a specific URL
 */
export function redirect(url: string, statusCode: number = 302): ActionExecutor {
  return {
    execute(match: AiCrawlerMatch, request?: Request): Response {
      return new Response(null, {
        status: statusCode,
        headers: {
          Location: url,
          'X-Blocked-By': 'ai-crawler-guard',
          'X-Blocked-Reason': 'ai-crawler-redirect',
        },
      });
    },
  };
}

/**
 * Redirect with a custom message
 */
export function redirectWithMessage(
  url: string,
  message: string,
  statusCode: number = 302
): ActionExecutor {
  return {
    execute(match: AiCrawlerMatch, request?: Request): Response {
      return new Response(message, {
        status: statusCode,
        headers: {
          Location: url,
          'Content-Type': 'text/plain',
          'X-Blocked-By': 'ai-crawler-guard',
        },
      });
    },
  };
}

/**
 * Permanent redirect (301)
 */
export function permanentRedirect(url: string): ActionExecutor {
  return redirect(url, 301);
}
