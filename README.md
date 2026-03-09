# @chambrin/ai-crawler-guard

> Detect and control AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) with configurable server-side actions.

A lightweight, framework-agnostic TypeScript library to detect AI crawlers and execute customizable actions like blocking images, redirecting, or logging visits. Works seamlessly with Next.js, Express, Hono, Nuxt, and SvelteKit.

## Features

- **Server-side only** - No client-side JavaScript needed
- **Framework-agnostic** - Works with any Node.js framework
- **Ready-to-use middlewares** for Next.js, Express, Hono, and H3 (Nuxt/SvelteKit)
- **Configurable actions** - Block images, redirect, log, or create custom actions
- **robots.txt generator** - Generate robots.txt rules automatically
- **TypeScript** - Fully typed with strict types
- **Lightweight** - Zero dependencies for core functionality
- **Extensible** - Add custom bot detection patterns

## Installation

```bash
npm install @chambrin/ai-crawler-guard
```

## Quick Start

### Next.js (App Router)

```typescript
// middleware.ts
import { nextMiddleware } from '@chambrin/ai-crawler-guard';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export default nextMiddleware({
  blockImagesFor: ['gptbot', 'claudebot', 'perplexitybot'],
  redirectUrls: {
    gptbot: '/blocked',
  },
  logLevel: 'info',
});
```

### Express

```typescript
import express from 'express';
import { expressMiddleware } from '@chambrin/ai-crawler-guard/core';

const app = express();

app.use(expressMiddleware({
  blockImagesFor: ['gptbot', 'claudebot'],
  logLevel: 'warn',
}));
```

### Hono

```typescript
import { Hono } from 'hono';
import { honoMiddleware } from '@chambrin/ai-crawler-guard/core';

const app = new Hono();

app.use('*', honoMiddleware({
  blockImagesFor: ['gptbot', 'claudebot'],
  redirectUrls: {
    perplexitybot: '/no-ai',
  },
}));
```

### Nuxt / SvelteKit (H3)

```typescript
// server/middleware/ai-guard.ts
import { h3Middleware } from '@chambrin/ai-crawler-guard/core';

export default h3Middleware({
  blockImagesFor: ['gptbot', 'claudebot'],
  logLevel: 'info',
});
```

## API Reference

### Detection

#### `detectAiCrawler(request: Request): AiCrawlerMatch`

Detect AI crawler from a Web Request object.

```typescript
import { detectAiCrawler } from '@chambrin/ai-crawler-guard/core';

const match = detectAiCrawler(request);

if (match.type === 'gptbot') {
  console.log('GPTBot detected!');
}
```

#### `detectAiCrawler(userAgent: string, ip?: string): AiCrawlerMatch`

Detect AI crawler from user agent string.

```typescript
const match = detectAiCrawler('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0;');
// match.type === 'gptbot'
```

#### `isAiCrawler(requestOrUserAgent: Request | string, type?: AiCrawlerType): boolean`

Quick check if request is from an AI crawler.

```typescript
if (isAiCrawler(request)) {
  // Any AI crawler detected
}

if (isAiCrawler(request, 'gptbot')) {
  // Specifically GPTBot
}
```

### Types

```typescript
type AiCrawlerType =
  | 'gptbot'
  | 'claudebot'
  | 'perplexitybot'
  | 'anthropic-ai'
  | 'google-extended'
  | 'bytespider'
  | 'ccbot'
  | 'custom'
  | null;

interface AiCrawlerMatch {
  type: AiCrawlerType;
  confidence: number; // 0-1
  userAgent: string;
  ip?: string;
  isKnown: boolean;
}
```

### Actions

Actions are composable functions that execute when an AI crawler is detected.

#### `blockImages()`

Block all image requests with 403 Forbidden.

```typescript
import { AiCrawlerGuard, blockImages } from '@chambrin/ai-crawler-guard/core';

const guard = new AiCrawlerGuard()
  .addAction(blockImages());
```

#### `redirect(url: string, statusCode?: number)`

Redirect AI crawlers to a specific URL.

```typescript
guard.addAction(redirect('/no-ai', 302));
```

#### `log(level?: 'info' | 'warn' | 'error')`

Log AI crawler visits.

```typescript
guard.addAction(log('info'));
```

#### `textOnly()`

Block all non-text content (images, CSS, JS, fonts, etc.).

```typescript
guard.addAction(textOnly());
```

### Guard

The `AiCrawlerGuard` class manages a pipeline of actions.

```typescript
import { AiCrawlerGuard, detectAiCrawler, blockImages, redirect, log } from '@chambrin/ai-crawler-guard/core';

const guard = new AiCrawlerGuard()
  .addAction(log('info'))
  .addAction(blockImages())
  .addAction(redirect('/blocked'));

const match = detectAiCrawler(request);
if (match.type) {
  const response = guard.execute(match, request);
  if (response) {
    return response; // Return the response from the first action that returns one
  }
}
```

### Configuration

```typescript
interface AiCrawlerConfig {
  knownBots: Record<string, AiCrawlerType>;
  blockImagesFor: AiCrawlerType[];
  redirectUrls: Partial<Record<AiCrawlerType, string>>;
  logLevel: 'none' | 'info' | 'warn';
  enableIpTracking?: boolean;
}
```

### Robots.txt Generation

#### `generateRobotsTxt(config: Partial<AiCrawlerConfig>): string`

Generate robots.txt content based on configuration.

```typescript
import { generateRobotsTxt } from '@chambrin/ai-crawler-guard/robots-txt';

const robotsTxt = generateRobotsTxt({
  blockImagesFor: ['gptbot', 'claudebot'],
});

// In your route handler:
// app.get('/robots.txt', (req, res) => {
//   res.setHeader('Content-Type', 'text/plain');
//   res.send(robotsTxt);
// });
```

#### Presets

```typescript
import {
  defaultAiBotsRobotsTxt,
  blockImagesPreset,
  blockGPTBotOnly
} from '@chambrin/ai-crawler-guard/robots-txt';

// Block all AI crawlers completely
console.log(defaultAiBotsRobotsTxt);

// Block only images
console.log(blockImagesPreset);

// Block only GPTBot
console.log(blockGPTBotOnly);
```

## Detected Bots

The library detects the following AI crawlers by default:

| Bot Type | User-Agent Patterns |
|----------|-------------------|
| `gptbot` | GPTBot, ChatGPT-User |
| `claudebot` | ClaudeBot, Claude-Web |
| `anthropic-ai` | anthropic-ai |
| `perplexitybot` | PerplexityBot |
| `google-extended` | Google-Extended |
| `bytespider` | Bytespider (ByteDance) |
| `ccbot` | CCBot (Common Crawl) |

Additional bots detected with lower confidence:
- Cohere-AI
- Omgilibot
- Diffbot
- FacebookBot
- Various AI scrapers

## Advanced Usage

### Custom Actions

Create your own action executor:

```typescript
import { ActionExecutor, AiCrawlerMatch } from '@chambrin/ai-crawler-guard/core';

function customBlock(): ActionExecutor {
  return {
    execute(match: AiCrawlerMatch, request?: Request): Response | void {
      if (match.type === 'gptbot') {
        return new Response('GPTBot not allowed', { status: 403 });
      }
    }
  };
}

const guard = new AiCrawlerGuard()
  .addAction(customBlock());
```

### Add Custom Bots

Extend the known bots list:

```typescript
import { DEFAULT_KNOWN_BOTS } from '@chambrin/ai-crawler-guard/core';

const customConfig = {
  knownBots: {
    ...DEFAULT_KNOWN_BOTS,
    'my-custom-bot': 'custom',
  },
  blockImagesFor: ['custom'],
};
```

### Next.js Custom Middleware

```typescript
import { createNextMiddleware, blockImages, log } from '@chambrin/ai-crawler-guard/core';

export default createNextMiddleware((guard, config) => {
  guard
    .addAction(log('warn'))
    .addAction(blockImages());
}, {
  logLevel: 'warn',
  blockImagesFor: ['gptbot'],
});
```

### Conditional Actions

```typescript
const guard = new AiCrawlerGuard();

const match = detectAiCrawler(request);

if (match.type === 'gptbot') {
  guard.addAction(redirect('/gptbot-blocked'));
} else if (match.type === 'claudebot') {
  guard.addAction(blockImages());
}

const response = guard.execute(match, request);
```

## Examples

See the `/examples` directory for complete working examples:

- Next.js 15 App Router
- Express server
- Hono API
- Nuxt 4 application
- SvelteKit application

## Important Notes

### SEO Disclaimer

This library is designed to control AI crawlers for legitimate purposes such as:
- Protecting proprietary content from being used in AI training
- Reducing server load from AI crawlers
- Enforcing terms of service

**DO NOT** use this library for:
- Cloaking content from search engines (violates Google's guidelines)
- Serving different content to users vs. crawlers
- Any deceptive SEO practices

Always respect search engine guidelines and robots.txt standards.

### Server-Side Only

This library works exclusively on the server side. Client-side detection is ineffective against crawlers since they don't execute JavaScript.

### Performance

The library is lightweight and has minimal performance impact:
- User agent detection is based on simple string matching
- No external API calls
- No heavy dependencies

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Links

- [GitHub Repository](https://github.com/chambrin/ai-crawler-guard)
- [NPM Package](https://www.npmjs.com/package/@chambrin/ai-crawler-guard)
- [Issues](https://github.com/chambrin/ai-crawler-guard/issues)
