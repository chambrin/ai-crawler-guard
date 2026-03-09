import { describe, it, expect } from 'vitest';
import { detectAiCrawler, isAiCrawler, getAllMatches } from '../detector';

describe('detectAiCrawler', () => {
  describe('GPTBot detection', () => {
    it('should detect GPTBot', () => {
      const userAgent = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe('gptbot');
      expect(match.confidence).toBe(1.0);
      expect(match.isKnown).toBe(true);
    });

    it('should detect ChatGPT-User', () => {
      const userAgent = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 ChatGPT-User';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe('gptbot');
      expect(match.confidence).toBe(1.0);
      expect(match.isKnown).toBe(true);
    });
  });

  describe('ClaudeBot detection', () => {
    it('should detect ClaudeBot', () => {
      const userAgent = 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://www.anthropic.com)';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe('claudebot');
      expect(match.confidence).toBe(1.0);
      expect(match.isKnown).toBe(true);
    });

    it('should detect Claude-Web', () => {
      const userAgent = 'Claude-Web/1.0';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe('claudebot');
      expect(match.confidence).toBe(1.0);
    });

    it('should detect anthropic-ai', () => {
      const userAgent = 'anthropic-ai';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe('anthropic-ai');
      expect(match.confidence).toBe(1.0);
    });
  });

  describe('PerplexityBot detection', () => {
    it('should detect PerplexityBot', () => {
      const userAgent = 'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://www.perplexity.ai)';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe('perplexitybot');
      expect(match.confidence).toBe(1.0);
      expect(match.isKnown).toBe(true);
    });
  });

  describe('Other bots', () => {
    it('should detect Google-Extended', () => {
      const userAgent = 'Google-Extended/1.0';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe('google-extended');
      expect(match.confidence).toBe(1.0);
    });

    it('should detect Bytespider', () => {
      const userAgent = 'Mozilla/5.0 (compatible; Bytespider; https://zhanzhang.toutiao.com/)';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe('bytespider');
      expect(match.confidence).toBe(1.0);
    });

    it('should detect CCBot', () => {
      const userAgent = 'CCBot/2.0 (https://commoncrawl.org/faq/)';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe('ccbot');
      expect(match.confidence).toBe(1.0);
    });
  });

  describe('Non-AI crawlers', () => {
    it('should not detect regular browsers', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe(null);
      expect(match.confidence).toBe(0);
      expect(match.isKnown).toBe(false);
    });

    it('should not detect Googlebot', () => {
      const userAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe(null);
      expect(match.confidence).toBe(0);
    });
  });

  describe('Heuristic detection', () => {
    it('should detect unknown AI bots with lower confidence', () => {
      const userAgent = 'MyCustomAI-Bot/1.0';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe('custom');
      expect(match.confidence).toBe(0.7);
      expect(match.isKnown).toBe(false);
    });
  });

  describe('Request object detection', () => {
    it('should detect from Request object', () => {
      const request = new Request('https://example.com', {
        headers: {
          'user-agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0)',
        },
      });

      const match = detectAiCrawler(request);

      expect(match.type).toBe('gptbot');
      expect(match.confidence).toBe(1.0);
    });

    it('should extract IP from headers', () => {
      const request = new Request('https://example.com', {
        headers: {
          'user-agent': 'GPTBot/1.0',
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });

      const match = detectAiCrawler(request);

      expect(match.ip).toBe('192.168.1.1');
    });
  });

  describe('Case insensitivity', () => {
    it('should detect bots regardless of case', () => {
      const userAgent = 'gptbot/1.0';
      const match = detectAiCrawler(userAgent);

      expect(match.type).toBe('gptbot');
    });
  });
});

describe('isAiCrawler', () => {
  it('should return true for AI crawler', () => {
    const userAgent = 'GPTBot/1.0';
    expect(isAiCrawler(userAgent)).toBe(true);
  });

  it('should return false for regular browser', () => {
    const userAgent = 'Mozilla/5.0 Chrome/91.0';
    expect(isAiCrawler(userAgent)).toBe(false);
  });

  it('should check for specific bot type', () => {
    const userAgent = 'GPTBot/1.0';
    expect(isAiCrawler(userAgent, 'gptbot')).toBe(true);
    expect(isAiCrawler(userAgent, 'claudebot')).toBe(false);
  });
});

describe('getAllMatches', () => {
  it('should return all matching bot types', () => {
    const userAgent = 'GPTBot/1.0';
    const matches = getAllMatches(userAgent);

    expect(matches).toContain('gptbot');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('should return empty array for non-bot user agent', () => {
    const userAgent = 'Mozilla/5.0 Chrome/91.0';
    const matches = getAllMatches(userAgent);

    expect(matches).toEqual([]);
  });
});
