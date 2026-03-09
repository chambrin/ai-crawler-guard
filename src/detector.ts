import {
  AiCrawlerMatch,
  AiCrawlerType,
  DEFAULT_KNOWN_BOTS,
} from './config.js';

/**
 * Detect AI crawler from Request object or user agent string
 */
export function detectAiCrawler(
  requestOrUserAgent: Request | string,
  ip?: string
): AiCrawlerMatch {
  let userAgent: string;
  let detectedIp: string | undefined = ip;

  // Handle both Request object and string
  if (typeof requestOrUserAgent === 'string') {
    userAgent = requestOrUserAgent;
  } else {
    const request = requestOrUserAgent as Request;
    userAgent = request.headers.get('user-agent') || '';

    // Try to extract IP from various headers
    if (!detectedIp) {
      detectedIp =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        undefined;
    }
  }

  return detectFromUserAgent(userAgent, detectedIp);
}

/**
 * Internal detection logic based on user agent
 */
function detectFromUserAgent(
  userAgent: string,
  ip?: string
): AiCrawlerMatch {
  const normalizedUA = userAgent.toLowerCase();

  // Check against known bots
  for (const [pattern, type] of Object.entries(DEFAULT_KNOWN_BOTS)) {
    if (normalizedUA.includes(pattern.toLowerCase())) {
      return {
        type,
        confidence: 1.0,
        userAgent,
        ip,
        isKnown: true,
      };
    }
  }

  // Heuristic detection for potential AI crawlers
  const aiCrawlerPatterns = [
    /ai[-_]?bot/i,
    /crawler.*ai/i,
    /scraper/i,
    /llm[-_]?bot/i,
    /data[-_]?miner/i,
  ];

  for (const pattern of aiCrawlerPatterns) {
    if (pattern.test(userAgent)) {
      return {
        type: 'custom',
        confidence: 0.7,
        userAgent,
        ip,
        isKnown: false,
      };
    }
  }

  // No AI crawler detected
  return {
    type: null,
    confidence: 0,
    userAgent,
    ip,
    isKnown: false,
  };
}

/**
 * Check if a request is from a specific AI crawler type
 */
export function isAiCrawler(
  requestOrUserAgent: Request | string,
  type?: AiCrawlerType
): boolean {
  const match = detectAiCrawler(requestOrUserAgent);

  if (!type) {
    return match.type !== null;
  }

  return match.type === type;
}

/**
 * Get all possible AI crawler types from a user agent
 */
export function getAllMatches(userAgent: string): AiCrawlerType[] {
  const matches: AiCrawlerType[] = [];
  const normalizedUA = userAgent.toLowerCase();

  for (const [pattern, type] of Object.entries(DEFAULT_KNOWN_BOTS)) {
    if (normalizedUA.includes(pattern.toLowerCase())) {
      if (!matches.includes(type)) {
        matches.push(type);
      }
    }
  }

  return matches;
}
