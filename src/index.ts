// Core types and config
export type { AiCrawlerType, AiCrawlerMatch, AiCrawlerConfig } from './config.js';
export { DEFAULT_KNOWN_BOTS, DEFAULT_CONFIG, mergeConfig } from './config.js';

// Detector
export { detectAiCrawler, isAiCrawler, getAllMatches } from './detector.js';

// Guard
export { AiCrawlerGuard } from './guard.js';

// Actions
export type { ActionExecutor, ActionContext } from './actions/types.js';
export { blockImages, blockImagesForPaths } from './actions/block-images.js';
export { redirect, redirectWithMessage, permanentRedirect } from './actions/redirect.js';
export { log, logWithFormatter, logJson } from './actions/log.js';
export { textOnly, blockResources } from './actions/text-only.js';

// Middlewares
export {
  expressMiddleware,
  honoMiddleware,
  h3Middleware,
  nextMiddleware,
  createNextMiddleware,
} from './middleware/index.js';

// Robots.txt
export {
  generateRobotsTxt,
  generateCustomRobotsTxt,
  generateFullRobotsTxt,
  defaultAiBotsRobotsTxt,
  blockImagesPreset,
  blockGPTBotOnly,
  BOT_USER_AGENTS,
} from './robots-txt/index.js';
