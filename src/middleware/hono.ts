import { AiCrawlerConfig, mergeConfig } from '../config.js';
import { detectAiCrawler } from '../detector.js';
import { AiCrawlerGuard } from '../guard.js';
import { blockImages } from '../actions/block-images.js';
import { redirect } from '../actions/redirect.js';
import { log } from '../actions/log.js';

/**
 * Hono middleware for AI crawler detection
 */
export function honoMiddleware(config?: Partial<AiCrawlerConfig>) {
  const mergedConfig = mergeConfig(config);

  return async (c: any, next: any) => {
    // Get the Web Request from Hono context
    const request = c.req.raw;

    // Detect AI crawler
    const match = detectAiCrawler(request);

    if (!match.type) {
      return next();
    }

    // Log if configured
    if (mergedConfig.logLevel !== 'none') {
      const logger = log(mergedConfig.logLevel);
      logger.execute(match, request);
    }

    // Create guard and add actions
    const guard = new AiCrawlerGuard();

    // Add redirect action if configured
    if (match.type && mergedConfig.redirectUrls[match.type]) {
      guard.addAction(redirect(mergedConfig.redirectUrls[match.type]!));
    }

    // Add block images action if configured
    if (match.type && mergedConfig.blockImagesFor.includes(match.type)) {
      guard.addAction(blockImages());
    }

    // Execute guard
    const response = await guard.executeAsync(match, request);

    if (response) {
      return response;
    }

    return next();
  };
}
