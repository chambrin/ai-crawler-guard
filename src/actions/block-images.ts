import { AiCrawlerMatch } from '../config.js';
import { ActionExecutor } from './types.js';

const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.ico',
  '.bmp',
  '.tiff',
  '.avif',
];

const IMAGE_PATHS = ['/images', '/img', '/assets', '/static', '/media'];

/**
 * Block image requests with 403 Forbidden
 */
export function blockImages(): ActionExecutor {
  return {
    execute(_match: AiCrawlerMatch, request?: Request): Response | void {
      if (!request) return;

      const url = new URL(request.url);
      const pathname = url.pathname.toLowerCase();

      // Check if path is an image by extension
      const hasImageExtension = IMAGE_EXTENSIONS.some((ext) =>
        pathname.endsWith(ext)
      );

      // Check if path starts with common image directories
      const isImagePath = IMAGE_PATHS.some((path) =>
        pathname.startsWith(path)
      );

      if (hasImageExtension || isImagePath) {
        return new Response('Forbidden: Images blocked for AI crawlers', {
          status: 403,
          headers: {
            'Content-Type': 'text/plain',
            'X-Blocked-By': 'ai-crawler-guard',
            'X-Blocked-Reason': 'image-access',
          },
        });
      }
    },
  };
}

/**
 * Block images only for specific paths
 */
export function blockImagesForPaths(paths: string[]): ActionExecutor {
  return {
    execute(_match: AiCrawlerMatch, request?: Request): Response | void {
      if (!request) return;

      const url = new URL(request.url);
      const pathname = url.pathname.toLowerCase();

      const matchesPath = paths.some((path) => pathname.startsWith(path));
      const hasImageExtension = IMAGE_EXTENSIONS.some((ext) =>
        pathname.endsWith(ext)
      );

      if (matchesPath && hasImageExtension) {
        return new Response('Forbidden: Images blocked for AI crawlers', {
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
