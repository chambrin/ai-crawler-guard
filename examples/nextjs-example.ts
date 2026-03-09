// Next.js App Router Example
// File: middleware.ts

import { nextMiddleware } from '@chambrin/ai-crawler-guard/core';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default nextMiddleware({
  blockImagesFor: ['gptbot', 'claudebot', 'perplexitybot'],
  redirectUrls: {
    gptbot: '/blocked',
  },
  logLevel: 'info',
  enableIpTracking: true,
});

// Alternative: Custom middleware with advanced logic
// import { createNextMiddleware, blockImages, log, redirect } from '@chambrin/ai-crawler-guard/core';
//
// export default createNextMiddleware((guard, config) => {
//   guard
//     .addAction(log('warn'))
//     .addAction(blockImages())
//     .addAction(redirect('/ai-blocked'));
// }, {
//   logLevel: 'warn',
//   blockImagesFor: ['gptbot', 'claudebot'],
// });

// ====================================
// Robots.txt Route Example
// File: app/robots.txt/route.ts
// ====================================

import { generateRobotsTxt } from '@chambrin/ai-crawler-guard/robots-txt';

export async function GET() {
  const robotsTxt = generateRobotsTxt({
    blockImagesFor: ['gptbot', 'claudebot', 'perplexitybot'],
  });

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

// ====================================
// API Route Example
// File: app/api/check-bot/route.ts
// ====================================

import { detectAiCrawler } from '@chambrin/ai-crawler-guard/core';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const match = detectAiCrawler(request);

  return NextResponse.json({
    isBot: match.type !== null,
    botType: match.type,
    confidence: match.confidence,
    userAgent: match.userAgent,
  });
}
