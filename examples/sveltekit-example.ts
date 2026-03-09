// SvelteKit Example

// ====================================
// Example 1: Global Hook
// File: src/hooks.server.ts
// ====================================

import { detectAiCrawler, AiCrawlerGuard, blockImages, log } from '@chambrin/ai-crawler-guard/core';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const userAgent = event.request.headers.get('user-agent') || '';
  const match = detectAiCrawler(userAgent);

  if (match.type) {
    // Log the bot visit
    console.log(`AI Bot detected: ${match.type} on ${event.url.pathname}`);

    // Block images for specific bots
    if (['gptbot', 'claudebot'].includes(match.type)) {
      const guard = new AiCrawlerGuard().addAction(blockImages());

      const response = await guard.executeAsync(match, event.request);
      if (response) {
        return response;
      }
    }

    // Redirect specific bots
    if (match.type === 'perplexitybot') {
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/no-ai',
        },
      });
    }
  }

  const response = await resolve(event);
  return response;
};

// ====================================
// Example 2: API Route Protection
// File: src/routes/api/data/+server.ts
// ====================================

import { detectAiCrawler } from '@chambrin/ai-crawler-guard/core';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
  const match = detectAiCrawler(request);

  if (match.type) {
    throw error(403, {
      message: `AI crawlers not allowed: ${match.type}`,
    });
  }

  return json({
    data: 'sensitive information',
  });
};

// ====================================
// Example 3: Robots.txt Route
// File: src/routes/robots.txt/+server.ts
// ====================================

import { generateRobotsTxt } from '@chambrin/ai-crawler-guard/robots-txt';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
  const robotsTxt = generateRobotsTxt({
    blockImagesFor: ['gptbot', 'claudebot', 'perplexitybot'],
  });

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};

// ====================================
// Example 4: Protected Page with Load Function
// File: src/routes/premium/+page.server.ts
// ====================================

import { detectAiCrawler } from '@chambrin/ai-crawler-guard/core';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
  const match = detectAiCrawler(request);

  if (match.type) {
    throw redirect(302, '/premium-blocked');
  }

  return {
    premium: true,
    content: 'Premium content only for humans',
  };
};

// ====================================
// Example 5: Bot Detection Check API
// File: src/routes/api/check-bot/+server.ts
// ====================================

import { detectAiCrawler } from '@chambrin/ai-crawler-guard/core';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
  const match = detectAiCrawler(request);

  return json({
    isBot: match.type !== null,
    botType: match.type,
    confidence: match.confidence,
    isKnown: match.isKnown,
    userAgent: match.userAgent,
  });
};

// ====================================
// Example 6: Image Protection Route
// File: src/routes/images/[...path]/+server.ts
// ====================================

import { detectAiCrawler } from '@chambrin/ai-crawler-guard/core';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, params }) => {
  const match = detectAiCrawler(request);

  if (match.type && ['gptbot', 'claudebot'].includes(match.type)) {
    throw error(403, 'Images not available for AI crawlers');
  }

  // Serve image normally
  // const image = await loadImage(params.path);
  // return new Response(image, {
  //   headers: {
  //     'Content-Type': 'image/jpeg',
  //   },
  // });

  return new Response('Image content');
};

// ====================================
// Example 7: Advanced Hook with Analytics
// File: src/hooks.server.ts (Advanced)
// ====================================

import { detectAiCrawler } from '@chambrin/ai-crawler-guard/core';
import type { Handle } from '@sveltejs/kit';

const botVisits: any[] = [];

export const handle: Handle = async ({ event, resolve }) => {
  const match = detectAiCrawler(event.request);

  if (match.type) {
    // Track bot visits
    botVisits.push({
      timestamp: new Date(),
      type: match.type,
      path: event.url.pathname,
      userAgent: match.userAgent,
    });

    // Keep only last 100 visits
    if (botVisits.length > 100) {
      botVisits.splice(0, botVisits.length - 100);
    }

    // Make analytics available to routes
    event.locals.botStats = {
      totalVisits: botVisits.length,
      stats: botVisits.reduce((acc, visit) => {
        acc[visit.type] = (acc[visit.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Conditional blocking
    if (match.type === 'gptbot' && event.url.pathname.startsWith('/premium')) {
      return new Response('Premium content not available for GPTBot', {
        status: 403,
        headers: {
          'X-Blocked-By': 'ai-crawler-guard',
        },
      });
    }
  }

  const response = await resolve(event);
  return response;
};

// Get analytics in a route
// File: src/routes/admin/analytics/+page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  return {
    botStats: locals.botStats || { totalVisits: 0, stats: {} },
  };
};

// ====================================
// Example 8: App.d.ts Types
// File: src/app.d.ts
// ====================================

declare global {
  namespace App {
    interface Locals {
      botStats?: {
        totalVisits: number;
        stats: Record<string, number>;
      };
    }
  }
}

export {};
