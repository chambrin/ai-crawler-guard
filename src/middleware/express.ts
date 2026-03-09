import { AiCrawlerConfig, mergeConfig } from '../config.js';
import { detectAiCrawler } from '../detector.js';
import { AiCrawlerGuard } from '../guard.js';
import { blockImages } from '../actions/block-images.js';
import { redirect } from '../actions/redirect.js';
import { log } from '../actions/log.js';

/**
 * Express middleware for AI crawler detection
 */
export function expressMiddleware(config?: Partial<AiCrawlerConfig>) {
  const mergedConfig = mergeConfig(config);

  return (req: any, res: any, next: any) => {
    // Convert Express request to Web Request
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost';
    const url = `${protocol}://${host}${req.originalUrl || req.url}`;

    const webRequest = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers),
    });

    // Detect AI crawler
    const match = detectAiCrawler(webRequest);

    if (!match.type) {
      return next();
    }

    // Log if configured
    if (mergedConfig.logLevel !== 'none') {
      const logger = log(mergedConfig.logLevel);
      logger.execute(match, webRequest);
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
    const response = guard.execute(match, webRequest);

    if (response) {
      // Convert Web Response to Express response
      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      response.text().then((text) => {
        if (text) {
          res.send(text);
        } else {
          res.end();
        }
      });
      return;
    }

    next();
  };
}
