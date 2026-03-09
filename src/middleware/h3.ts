import { AiCrawlerConfig, mergeConfig } from '../config.js';
import { detectAiCrawler } from '../detector.js';
import { AiCrawlerGuard } from '../guard.js';
import { blockImages } from '../actions/block-images.js';
import { redirect } from '../actions/redirect.js';
import { log } from '../actions/log.js';

/**
 * H3 middleware for AI crawler detection (Nuxt, SvelteKit)
 */
export function h3Middleware(config?: Partial<AiCrawlerConfig>) {
  const mergedConfig = mergeConfig(config);

  return async (event: any) => {
    // Convert H3 event to Web Request
    const req = event.node?.req || event.req;
    const protocol = req.socket?.encrypted ? 'https' : 'http';
    const host = req.headers.host || 'localhost';
    const url = `${protocol}://${host}${req.url}`;

    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        headers.set(key, Array.isArray(value) ? value[0] : String(value));
      }
    });

    const webRequest = new Request(url, {
      method: req.method,
      headers,
    });

    // Detect AI crawler
    const match = detectAiCrawler(webRequest);

    if (!match.type) {
      return;
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
    const response = await guard.executeAsync(match, webRequest);

    if (response) {
      // Convert Web Response to H3 response
      const res = event.node?.res || event.res;
      res.statusCode = response.status;

      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      const text = await response.text();
      if (text) {
        res.end(text);
      } else {
        res.end();
      }
    }
  };
}
