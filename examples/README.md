# AI Crawler Guard - Examples

This directory contains example implementations for various frameworks and use cases.

## Available Examples

### 1. Next.js (App Router)
**File:** `nextjs-example.ts`

Demonstrates:
- Basic middleware setup
- Custom middleware with advanced logic
- Robots.txt generation
- API route protection

### 2. Express
**File:** `express-example.ts`

Demonstrates:
- Simple middleware integration
- Custom route protection
- Dynamic robots.txt generation
- Advanced guard usage
- Conditional blocking
- Bot analytics endpoint

### 3. Hono
**File:** `hono-example.ts`

Demonstrates:
- Global middleware
- Route-specific protection
- Robots.txt route
- Custom guard usage
- Image protection
- Bot detection API
- Conditional actions

### 4. Nuxt 4
**File:** `nuxt-example.ts`

Demonstrates:
- Global H3 middleware
- API route protection
- Robots.txt generation
- Custom guards in routes
- Bot detection composable
- Server plugin for analytics

### 5. SvelteKit
**File:** `sveltekit-example.ts`

Demonstrates:
- Global hooks
- API route protection
- Robots.txt route
- Protected pages with load functions
- Bot detection API
- Image protection
- Advanced hooks with analytics

## How to Use

1. Choose the example that matches your framework
2. Copy the relevant code to your project
3. Install the package: `npm install ai-crawler-guard`
4. Adjust the configuration to match your needs

## Common Patterns

### Basic Protection

```typescript
import { middleware } from 'ai-crawler-guard/core';

// Block images for specific bots
export default middleware({
  blockImagesFor: ['gptbot', 'claudebot'],
});
```

### Redirect Bots

```typescript
import { middleware } from 'ai-crawler-guard/core';

export default middleware({
  redirectUrls: {
    gptbot: '/blocked',
    claudebot: '/ai-not-allowed',
  },
});
```

### Advanced Guard

```typescript
import { AiCrawlerGuard, blockImages, redirect, log } from 'ai-crawler-guard/core';

const guard = new AiCrawlerGuard()
  .addAction(log('warn'))
  .addAction(blockImages())
  .addAction(redirect('/blocked'));
```

### Robots.txt Generation

```typescript
import { generateRobotsTxt } from 'ai-crawler-guard/robots-txt';

const robotsTxt = generateRobotsTxt({
  blockImagesFor: ['gptbot', 'claudebot'],
});
```

## Need Help?

- Read the main [README.md](../README.md)
- Check the [API documentation](../README.md#api-reference)
- Open an issue on [GitHub](https://github.com/chambrin/ai-crawler-guard/issues)
