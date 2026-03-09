// Nuxt 4 Example with H3

// ====================================
// Example 1: Global Middleware
// File: server/middleware/ai-guard.ts
// ====================================

import { h3Middleware } from 'ai-crawler-guard/core';

export default h3Middleware({
  blockImagesFor: ['gptbot', 'claudebot'],
  redirectUrls: {
    perplexitybot: '/no-ai',
  },
  logLevel: 'info',
  enableIpTracking: true,
});

// ====================================
// Example 2: API Route Protection
// File: server/api/data.get.ts
// ====================================

import { detectAiCrawler } from 'ai-crawler-guard/core';

export default defineEventHandler((event) => {
  const userAgent = getHeader(event, 'user-agent') || '';
  const match = detectAiCrawler(userAgent);

  if (match.type) {
    throw createError({
      statusCode: 403,
      statusMessage: `AI crawlers not allowed: ${match.type}`,
    });
  }

  return {
    data: 'sensitive information',
  };
});

// ====================================
// Example 3: Robots.txt Route
// File: server/routes/robots.txt.get.ts
// ====================================

import { generateRobotsTxt } from 'ai-crawler-guard/robots-txt';

export default defineEventHandler(() => {
  const robotsTxt = generateRobotsTxt({
    blockImagesFor: ['gptbot', 'claudebot', 'perplexitybot'],
  });

  return robotsTxt;
});

// ====================================
// Example 4: Custom Guard in Route
// File: server/api/premium/[...].get.ts
// ====================================

import {
  detectAiCrawler,
  AiCrawlerGuard,
  blockImages,
  redirect,
  log,
} from 'ai-crawler-guard/core';

export default defineEventHandler(async (event) => {
  const userAgent = getHeader(event, 'user-agent') || '';
  const match = detectAiCrawler(userAgent);

  if (match.type) {
    const guard = new AiCrawlerGuard()
      .addAction(log('warn'))
      .addAction(redirect('/premium-blocked'));

    // Note: H3 event handler doesn't return Web Response directly
    // We handle it manually
    if (match.type === 'gptbot') {
      return sendRedirect(event, '/premium-blocked', 302);
    }
  }

  return {
    premium: true,
    content: 'Premium content',
  };
});

// ====================================
// Example 5: Bot Detection Composable
// File: composables/useBotDetection.ts
// ====================================

import { detectAiCrawler } from 'ai-crawler-guard/core';

export const useBotDetection = () => {
  const checkIfBot = async () => {
    const headers = useRequestHeaders(['user-agent']);
    const userAgent = headers['user-agent'] || '';
    const match = detectAiCrawler(userAgent);

    return {
      isBot: match.type !== null,
      botType: match.type,
      confidence: match.confidence,
    };
  };

  return {
    checkIfBot,
  };
};

// ====================================
// Example 6: Server Plugin for Analytics
// File: server/plugins/bot-analytics.ts
// ====================================

const botVisits: any[] = [];

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const userAgent = getHeader(event, 'user-agent') || '';
    const match = detectAiCrawler(userAgent);

    if (match.type) {
      botVisits.push({
        timestamp: new Date(),
        type: match.type,
        path: event.path,
        userAgent: match.userAgent,
      });

      // Keep only last 100 visits
      if (botVisits.length > 100) {
        botVisits.splice(0, botVisits.length - 100);
      }

      console.log(`AI Bot detected: ${match.type} on ${event.path}`);
    }
  });
});

// Get analytics data
// File: server/api/analytics/bots.get.ts
export default defineEventHandler(() => {
  const stats = botVisits.reduce((acc, visit) => {
    acc[visit.type] = (acc[visit.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalVisits: botVisits.length,
    stats,
    recentVisits: botVisits.slice(-10),
  };
});

// ====================================
// Example 7: Nuxt Config
// File: nuxt.config.ts
// ====================================

export default defineNuxtConfig({
  modules: [
    // ... other modules
  ],

  routeRules: {
    // Block AI crawlers from admin routes
    '/admin/**': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  },
});
