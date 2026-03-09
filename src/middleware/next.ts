import { AiCrawlerConfig, mergeConfig } from '../config.js';
import { detectAiCrawler } from '../detector.js';
import { AiCrawlerGuard } from '../guard.js';
import { blockImages } from '../actions/block-images.js';
import { redirect } from '../actions/redirect.js';
import { log } from '../actions/log.js';

/**
 * Next.js middleware for AI crawler detection (App Router)
 */
export function nextMiddleware(config?: Partial<AiCrawlerConfig>) {
  const mergedConfig = mergeConfig(config);

  return async (request: Request) => {
    // Detect AI crawler
    const match = detectAiCrawler(request);

    if (!match.type) {
      return;
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

    // Continue to next middleware/route
    return;
  };
}

/**
 * Create a custom Next.js middleware with specific actions
 */
export function createNextMiddleware(
  setup: (guard: AiCrawlerGuard, config: AiCrawlerConfig) => void,
  config?: Partial<AiCrawlerConfig>
) {
  const mergedConfig = mergeConfig(config);

  return async (request: Request) => {
    const match = detectAiCrawler(request);

    if (!match.type) {
      return;
    }

    const guard = new AiCrawlerGuard();
    setup(guard, mergedConfig);

    const response = await guard.executeAsync(match, request);
    return response;
  };
}
