import { describe, it, expect } from 'vitest';
import { AiCrawlerGuard } from '../guard';
import { blockImages } from '../actions/block-images';
import { redirect } from '../actions/redirect';
import type { AiCrawlerMatch } from '../config';
import type { ActionExecutor } from '../actions/types';

const createMockMatch = (type: string = 'gptbot'): AiCrawlerMatch => ({
  type: type as any,
  confidence: 1.0,
  userAgent: 'GPTBot/1.0',
  isKnown: true,
});

describe('AiCrawlerGuard', () => {
  describe('addAction', () => {
    it('should add actions to the pipeline', () => {
      const guard = new AiCrawlerGuard();

      guard.addAction(blockImages());

      expect(guard.getActionCount()).toBe(1);
    });

    it('should support method chaining', () => {
      const guard = new AiCrawlerGuard()
        .addAction(blockImages())
        .addAction(redirect('/blocked'));

      expect(guard.getActionCount()).toBe(2);
    });

    it('should add multiple actions', () => {
      const guard = new AiCrawlerGuard();

      guard.addAction(blockImages());
      guard.addAction(redirect('/blocked'));

      expect(guard.getActionCount()).toBe(2);
    });
  });

  describe('execute', () => {
    it('should execute actions in order', () => {
      const executionOrder: string[] = [];

      const action1: ActionExecutor = {
        execute: () => {
          executionOrder.push('action1');
        },
      };

      const action2: ActionExecutor = {
        execute: () => {
          executionOrder.push('action2');
        },
      };

      const guard = new AiCrawlerGuard()
        .addAction(action1)
        .addAction(action2);

      const match = createMockMatch();
      guard.execute(match);

      expect(executionOrder).toEqual(['action1', 'action2']);
    });

    it('should return first Response from actions', () => {
      const action1: ActionExecutor = {
        execute: () => {
          return new Response('first', { status: 403 });
        },
      };

      const action2: ActionExecutor = {
        execute: () => {
          return new Response('second', { status: 404 });
        },
      };

      const guard = new AiCrawlerGuard()
        .addAction(action1)
        .addAction(action2);

      const match = createMockMatch();
      const response = guard.execute(match);

      expect(response).toBeInstanceOf(Response);
      expect(response?.status).toBe(403);
    });

    it('should stop executing after first Response', () => {
      let secondActionCalled = false;

      const action1: ActionExecutor = {
        execute: () => {
          return new Response('first', { status: 403 });
        },
      };

      const action2: ActionExecutor = {
        execute: () => {
          secondActionCalled = true;
          return new Response('second', { status: 404 });
        },
      };

      const guard = new AiCrawlerGuard()
        .addAction(action1)
        .addAction(action2);

      const match = createMockMatch();
      guard.execute(match);

      expect(secondActionCalled).toBe(false);
    });

    it('should return undefined if no action returns Response', () => {
      const action: ActionExecutor = {
        execute: () => {
          // No return
        },
      };

      const guard = new AiCrawlerGuard().addAction(action);

      const match = createMockMatch();
      const response = guard.execute(match);

      expect(response).toBeUndefined();
    });

    it('should pass request to actions', () => {
      let receivedRequest: Request | undefined;

      const action: ActionExecutor = {
        execute: (match, request) => {
          receivedRequest = request;
        },
      };

      const guard = new AiCrawlerGuard().addAction(action);
      const match = createMockMatch();
      const request = new Request('https://example.com');

      guard.execute(match, request);

      expect(receivedRequest).toBe(request);
    });
  });

  describe('clearActions', () => {
    it('should remove all actions', () => {
      const guard = new AiCrawlerGuard()
        .addAction(blockImages())
        .addAction(redirect('/blocked'));

      expect(guard.getActionCount()).toBe(2);

      guard.clearActions();

      expect(guard.getActionCount()).toBe(0);
    });

    it('should support method chaining', () => {
      const guard = new AiCrawlerGuard()
        .addAction(blockImages())
        .clearActions()
        .addAction(redirect('/blocked'));

      expect(guard.getActionCount()).toBe(1);
    });
  });

  describe('getActionCount', () => {
    it('should return 0 for new guard', () => {
      const guard = new AiCrawlerGuard();

      expect(guard.getActionCount()).toBe(0);
    });

    it('should return correct count after adding actions', () => {
      const guard = new AiCrawlerGuard()
        .addAction(blockImages())
        .addAction(redirect('/blocked'));

      expect(guard.getActionCount()).toBe(2);
    });
  });

  describe('real-world scenarios', () => {
    it('should block images and then redirect', () => {
      const guard = new AiCrawlerGuard()
        .addAction(blockImages())
        .addAction(redirect('/blocked'));

      const match = createMockMatch();

      // Test with image request
      const imageRequest = new Request('https://example.com/photo.jpg');
      const imageResponse = guard.execute(match, imageRequest);

      expect(imageResponse?.status).toBe(403);

      // Test with non-image request
      const guard2 = new AiCrawlerGuard()
        .addAction(blockImages())
        .addAction(redirect('/blocked'));

      const htmlRequest = new Request('https://example.com/page.html');
      const htmlResponse = guard2.execute(match, htmlRequest);

      expect(htmlResponse?.status).toBe(302);
      expect(htmlResponse?.headers.get('Location')).toBe('/blocked');
    });
  });
});
