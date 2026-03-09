// Express Server Example

import express from 'express';
import {
  expressMiddleware,
  detectAiCrawler,
  AiCrawlerGuard,
  blockImages,
  redirect,
  log,
} from '@ai-crawler-guard/core';
import { generateRobotsTxt, defaultAiBotsRobotsTxt } from '@ai-crawler-guard/robots-txt';

const app = express();
const PORT = 3000;

// ====================================
// Example 1: Simple Middleware
// ====================================

app.use(expressMiddleware({
  blockImagesFor: ['gptbot', 'claudebot'],
  redirectUrls: {
    perplexitybot: '/no-ai',
  },
  logLevel: 'info',
}));

// ====================================
// Example 2: Custom Route Protection
// ====================================

app.get('/api/data', (req, res) => {
  const userAgent = req.get('user-agent') || '';
  const match = detectAiCrawler(userAgent);

  if (match.type) {
    return res.status(403).json({
      error: 'AI crawlers not allowed',
      bot: match.type,
    });
  }

  res.json({ data: 'sensitive data' });
});

// ====================================
// Example 3: Dynamic Robots.txt
// ====================================

app.get('/robots.txt', (req, res) => {
  const robotsTxt = generateRobotsTxt({
    blockImagesFor: ['gptbot', 'claudebot'],
  });

  res.setHeader('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

// Or use the default preset
app.get('/robots-default.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(defaultAiBotsRobotsTxt);
});

// ====================================
// Example 4: Advanced Guard Usage
// ====================================

app.use('/premium/*', (req, res, next) => {
  const userAgent = req.get('user-agent') || '';
  const ip = req.ip || req.get('x-forwarded-for') || '';

  const match = detectAiCrawler(userAgent, ip);

  if (match.type) {
    const guard = new AiCrawlerGuard()
      .addAction(log('warn'))
      .addAction(redirect('/premium-blocked'));

    // Convert to Web Request for guard
    const webRequest = new Request(`http://${req.get('host')}${req.url}`, {
      headers: new Headers(req.headers as any),
    });

    const response = guard.execute(match, webRequest);

    if (response) {
      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      response.text().then(text => res.send(text));
      return;
    }
  }

  next();
});

// ====================================
// Example 5: Conditional Blocking
// ====================================

app.get('/images/:filename', (req, res, next) => {
  const match = detectAiCrawler(req.get('user-agent') || '');

  if (match.type && ['gptbot', 'claudebot'].includes(match.type)) {
    return res.status(403).send('Images not available for AI crawlers');
  }

  next();
});

// ====================================
// Example 6: Analytics Endpoint
// ====================================

let botVisits: any[] = [];

app.use((req, res, next) => {
  const match = detectAiCrawler(req.get('user-agent') || '');

  if (match.type) {
    botVisits.push({
      timestamp: new Date(),
      type: match.type,
      path: req.path,
      ip: req.ip,
      userAgent: match.userAgent,
    });

    // Keep only last 100 visits
    if (botVisits.length > 100) {
      botVisits = botVisits.slice(-100);
    }
  }

  next();
});

app.get('/admin/bot-analytics', (req, res) => {
  const stats = botVisits.reduce((acc, visit) => {
    acc[visit.type] = (acc[visit.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  res.json({
    totalVisits: botVisits.length,
    stats,
    recentVisits: botVisits.slice(-10),
  });
});

// ====================================
// Regular Routes
// ====================================

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/no-ai', (req, res) => {
  res.send('This content is not available for AI crawlers.');
});

app.get('/premium-blocked', (req, res) => {
  res.send('Premium content is not available for AI crawlers.');
});

// ====================================
// Start Server
// ====================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
