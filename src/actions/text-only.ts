import { AiCrawlerMatch } from '../config.js';
import { ActionExecutor } from './types.js';

const BLOCKED_EXTENSIONS = [
  '.js',
  '.css',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.mp4',
  '.webm',
  '.mp3',
  '.wav',
];

/**
 * Block all non-text content (images, CSS, JS, fonts, etc.)
 * Only allow HTML and text content
 */
export function textOnly(): ActionExecutor {
  return {
    execute(match: AiCrawlerMatch, request?: Request): Response | void {
      if (!request) return;

      const url = new URL(request.url);
      const pathname = url.pathname.toLowerCase();

      // Check if the request is for a blocked resource type
      const isBlockedResource = BLOCKED_EXTENSIONS.some((ext) =>
        pathname.endsWith(ext)
      );

      if (isBlockedResource) {
        return new Response('Forbidden: Non-text content blocked for AI crawlers', {
          status: 403,
          headers: {
            'Content-Type': 'text/plain',
            'X-Blocked-By': 'ai-crawler-guard',
            'X-Blocked-Reason': 'text-only-mode',
          },
        });
      }
    },
  };
}

/**
 * Block specific resource types
 */
export function blockResources(extensions: string[]): ActionExecutor {
  return {
    execute(match: AiCrawlerMatch, request?: Request): Response | void {
      if (!request) return;

      const url = new URL(request.url);
      const pathname = url.pathname.toLowerCase();

      const isBlocked = extensions.some((ext) =>
        pathname.endsWith(ext.toLowerCase())
      );

      if (isBlocked) {
        return new Response('Forbidden: Resource blocked for AI crawlers', {
          status: 403,
          headers: {
            'Content-Type': 'text/plain',
            'X-Blocked-By': 'ai-crawler-guard',
          },
        });
      }
    },
  };
}
