import { AiCrawlerMatch } from './config.js';
import { ActionExecutor } from './actions/types.js';

/**
 * Main guard class for managing AI crawler detection and actions
 */
export class AiCrawlerGuard {
  private actions: ActionExecutor[] = [];

  /**
   * Add an action to the pipeline
   */
  addAction(action: ActionExecutor): this {
    this.actions.push(action);
    return this;
  }

  /**
   * Execute all actions in the pipeline
   * Returns the first Response returned by any action, or void if none
   */
  execute(match: AiCrawlerMatch, request?: Request): Response | void {
    for (const action of this.actions) {
      const result = action.execute(match, request);
      if (result instanceof Response) {
        return result;
      }
    }
  }

  /**
   * Execute all actions asynchronously
   */
  async executeAsync(match: AiCrawlerMatch, request?: Request): Promise<Response | void> {
    for (const action of this.actions) {
      const result = await action.execute(match, request);
      if (result instanceof Response) {
        return result;
      }
    }
  }

  /**
   * Clear all actions
   */
  clearActions(): this {
    this.actions = [];
    return this;
  }

  /**
   * Get the number of actions in the pipeline
   */
  getActionCount(): number {
    return this.actions.length;
  }
}
