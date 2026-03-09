import { describe, it, expect } from 'vitest';
import { blockImages } from '../actions/block-images';
import { redirect, permanentRedirect } from '../actions/redirect';
import { textOnly } from '../actions/text-only';
import type { AiCrawlerMatch } from '../config';

const createMockMatch = (type: string = 'gptbot'): AiCrawlerMatch => ({
  type: type as any,
  confidence: 1.0,
  userAgent: 'GPTBot/1.0',
  isKnown: true,
});

describe('blockImages', () => {
  it('should block image requests by extension', () => {
    const action = blockImages();
    const match = createMockMatch();
    const request = new Request('https://example.com/photo.jpg');

    const response = action.execute(match, request);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(403);
  });

  it('should block requests to image directories', () => {
    const action = blockImages();
    const match = createMockMatch();
    const request = new Request('https://example.com/images/photo');

    const response = action.execute(match, request);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(403);
  });

  it('should not block non-image requests', () => {
    const action = blockImages();
    const match = createMockMatch();
    const request = new Request('https://example.com/page.html');

    const response = action.execute(match, request);

    expect(response).toBeUndefined();
  });

  it('should block various image formats', () => {
    const action = blockImages();
    const match = createMockMatch();
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

    extensions.forEach((ext) => {
      const request = new Request(`https://example.com/image${ext}`);
      const response = action.execute(match, request);

      expect(response).toBeInstanceOf(Response);
      expect(response?.status).toBe(403);
    });
  });
});

describe('redirect', () => {
  it('should redirect to specified URL', () => {
    const action = redirect('/blocked');
    const match = createMockMatch();

    const response = action.execute(match);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(302);
    expect(response?.headers.get('Location')).toBe('/blocked');
  });

  it('should support custom status codes', () => {
    const action = redirect('/blocked', 301);
    const match = createMockMatch();

    const response = action.execute(match);

    expect(response?.status).toBe(301);
  });

  it('should include guard headers', () => {
    const action = redirect('/blocked');
    const match = createMockMatch();

    const response = action.execute(match);

    expect(response?.headers.get('X-Blocked-By')).toBe('ai-crawler-guard');
  });
});

describe('permanentRedirect', () => {
  it('should use 301 status code', () => {
    const action = permanentRedirect('/blocked');
    const match = createMockMatch();

    const response = action.execute(match);

    expect(response?.status).toBe(301);
    expect(response?.headers.get('Location')).toBe('/blocked');
  });
});

describe('textOnly', () => {
  it('should block JavaScript files', () => {
    const action = textOnly();
    const match = createMockMatch();
    const request = new Request('https://example.com/script.js');

    const response = action.execute(match, request);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(403);
  });

  it('should block CSS files', () => {
    const action = textOnly();
    const match = createMockMatch();
    const request = new Request('https://example.com/styles.css');

    const response = action.execute(match, request);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(403);
  });

  it('should block image files', () => {
    const action = textOnly();
    const match = createMockMatch();
    const request = new Request('https://example.com/image.png');

    const response = action.execute(match, request);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(403);
  });

  it('should block font files', () => {
    const action = textOnly();
    const match = createMockMatch();
    const request = new Request('https://example.com/font.woff2');

    const response = action.execute(match, request);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(403);
  });

  it('should allow HTML pages', () => {
    const action = textOnly();
    const match = createMockMatch();
    const request = new Request('https://example.com/page.html');

    const response = action.execute(match, request);

    expect(response).toBeUndefined();
  });

  it('should allow text content', () => {
    const action = textOnly();
    const match = createMockMatch();
    const request = new Request('https://example.com/document.txt');

    const response = action.execute(match, request);

    expect(response).toBeUndefined();
  });
});
