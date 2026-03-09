// Hono API Example

import { Hono } from 'hono';
import {
  honoMiddleware,
  detectAiCrawler,
  AiCrawlerGuard,
  blockImages,
  redirect,
  log,
} from '@chambrin/ai-crawler-guard/core';
import { generateRobotsTxt } from '@chambrin/ai-crawler-guard/robots-txt';

const app = new Hono();

// ====================================
// Example 1: Global Middleware
// ====================================

app.use('*', honoMiddleware({
  blockImagesFor: ['gptbot', 'claudebot'],
  redirectUrls: {
    perplexitybot: '/no-ai',
  },
  logLevel: 'info',
}));

// ====================================
// Example 2: Route-specific Protection
// ====================================

const apiRoutes = new Hono();

apiRoutes.use('*', async (c, next) => {
  const match = detectAiCrawler(c.req.raw);

  if (match.type) {
    return c.json({
      error: 'AI crawlers not allowed on API routes',
      bot: match.type,
    }, 403);
  }

  await next();
});

apiRoutes.get('/data', (c) => {
  return c.json({ message: 'Sensitive data' });
});

app.route('/api', apiRoutes);

// ====================================
// Example 3: Robots.txt Route
// ====================================

app.get('/robots.txt', (c) => {
  const robotsTxt = generateRobotsTxt({
    blockImagesFor: ['gptbot', 'claudebot', 'perplexitybot'],
  });

  return c.text(robotsTxt);
});

// ====================================
// Example 4: Custom Guard Usage
// ====================================

app.get('/premium/*', async (c, next) => {
  const match = detectAiCrawler(c.req.raw);

  if (match.type) {
    const guard = new AiCrawlerGuard()
      .addAction(log('warn'))
      .addAction(redirect('/premium-blocked'));

    const response = await guard.executeAsync(match, c.req.raw);

    if (response) {
      return response;
    }
  }

  await next();
});

// ====================================
// Example 5: Image Protection
// ====================================

app.get('/images/:filename', async (c) => {
  const match = detectAiCrawler(c.req.raw);

  if (match.type && ['gptbot', 'claudebot'].includes(match.type)) {
    return c.text('Images not available for AI crawlers', 403);
  }

  // Serve image normally
  return c.text('Image content here');
});

// ====================================
// Example 6: Bot Detection API
// ====================================

app.get('/check-bot', (c) => {
  const match = detectAiCrawler(c.req.raw);

  return c.json({
    isBot: match.type !== null,
    botType: match.type,
    confidence: match.confidence,
    isKnown: match.isKnown,
    userAgent: match.userAgent,
  });
});

// ====================================
// Example 7: Conditional Actions
// ====================================

app.use('/docs/*', async (c, next) => {
  const match = detectAiCrawler(c.req.raw);

  if (match.type === 'gptbot') {
    return c.redirect('/gpt-blocked');
  } else if (match.type === 'claudebot') {
    return c.text('ClaudeBot: Please respect our robots.txt', 403);
  }

  await next();
});

// ====================================
// Regular Routes
// ====================================

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.get('/no-ai', (c) => {
  return c.text('This content is not available for AI crawlers.');
});

app.get('/premium-blocked', (c) => {
  return c.text('Premium content is not available for AI crawlers.');
});

app.get('/gpt-blocked', (c) => {
  return c.text('GPTBot is not allowed to access this content.');
});

// ====================================
// Export App
// ====================================

export default app;

// For Cloudflare Workers or other platforms:
// export default {
//   fetch: app.fetch,
// };
