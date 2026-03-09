# Quick Start Guide

Get started with AI Crawler Guard in 5 minutes.

## Installation

```bash
npm install @chambrin/ai-crawler-guard
```

## Basic Usage

### Next.js (Most Common)

Create a `middleware.ts` file in your project root:

```typescript
import { nextMiddleware } from '@chambrin/ai-crawler-guard';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export default nextMiddleware({
  blockImagesFor: ['gptbot', 'claudebot'],
  logLevel: 'info',
});
```

### Express

```typescript
import express from 'express';
import { expressMiddleware } from '@chambrin/ai-crawler-guard';

const app = express();

app.use(expressMiddleware({
  blockImagesFor: ['gptbot', 'claudebot'],
}));

app.listen(3000);
```

### Hono

```typescript
import { Hono } from 'hono';
import { honoMiddleware } from '@chambrin/ai-crawler-guard';

const app = new Hono();

app.use('*', honoMiddleware({
  blockImagesFor: ['gptbot', 'claudebot'],
}));

export default app;
```

## Common Use Cases

### 1. Block All AI Crawlers

```typescript
import { nextMiddleware } from '@chambrin/ai-crawler-guard';

export default nextMiddleware({
  redirectUrls: {
    gptbot: '/blocked',
    claudebot: '/blocked',
    perplexitybot: '/blocked',
  },
});
```

### 2. Block Only Images

```typescript
import { nextMiddleware } from '@chambrin/ai-crawler-guard';

export default nextMiddleware({
  blockImagesFor: ['gptbot', 'claudebot', 'perplexitybot'],
});
```

### 3. Custom Logic

```typescript
import {
  detectAiCrawler,
  AiCrawlerGuard,
  blockImages,
  redirect,
  log,
} from '@chambrin/ai-crawler-guard';

export default async function middleware(request: Request) {
  const match = detectAiCrawler(request);

  if (!match.type) return; // Not an AI crawler

  const guard = new AiCrawlerGuard()
    .addAction(log('warn'))
    .addAction(blockImages())
    .addAction(redirect('/blocked'));

  return await guard.executeAsync(match, request);
}
```

### 4. Generate robots.txt

```typescript
// app/robots.txt/route.ts (Next.js)
import { generateRobotsTxt } from '@chambrin/ai-crawler-guard/robots-txt';

export async function GET() {
  const robotsTxt = generateRobotsTxt({
    blockImagesFor: ['gptbot', 'claudebot'],
  });

  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
```

## Configuration Options

```typescript
interface AiCrawlerConfig {
  // List of known bots (extensible)
  knownBots: Record<string, AiCrawlerType>;

  // Block images for these bot types
  blockImagesFor: AiCrawlerType[];

  // Redirect specific bots to URLs
  redirectUrls: Partial<Record<AiCrawlerType, string>>;

  // Logging level
  logLevel: 'none' | 'info' | 'warn';

  // Track IP addresses
  enableIpTracking?: boolean;
}
```

## Detected Bots

- `gptbot` - OpenAI's GPTBot
- `claudebot` - Anthropic's ClaudeBot
- `perplexitybot` - Perplexity's bot
- `anthropic-ai` - Anthropic AI
- `google-extended` - Google Extended (Bard/Gemini)
- `bytespider` - ByteDance bot
- `ccbot` - Common Crawl bot

## Next Steps

- Read the full [README](./README.md)
- Check out [Examples](./examples/)
- Read [API Documentation](./README.md#api-reference)
- Learn about [Contributing](./CONTRIBUTING.md)

## Need Help?

- [GitHub Issues](https://github.com/chambrin/ai-crawler-guard/issues)
- [Examples Directory](./examples/)
- [Full Documentation](./README.md)
