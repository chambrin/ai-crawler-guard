import { AiCrawlerMatch } from '../config.js';

/**
 * Interface for action executors
 * Actions can either return a Response or void
 */
export interface ActionExecutor {
  execute(match: AiCrawlerMatch, request?: Request): Response | void | Promise<Response | void>;
}

/**
 * Context passed to actions for request handling
 */
export interface ActionContext {
  request?: Request;
  url?: URL;
  pathname?: string;
}
