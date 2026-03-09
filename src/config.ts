export type AiCrawlerType =
  | 'gptbot'
  | 'claudebot'
  | 'perplexitybot'
  | 'anthropic-ai'
  | 'google-extended'
  | 'bytespider'
  | 'ccbot'
  | 'custom'
  | null;

export interface AiCrawlerMatch {
  type: AiCrawlerType;
  confidence: number; // 0-1
  userAgent: string;
  ip?: string;
  isKnown: boolean;
}

export interface AiCrawlerConfig {
  knownBots: Record<string, AiCrawlerType>;
  blockImagesFor: AiCrawlerType[];
  redirectUrls: Partial<Record<NonNullable<AiCrawlerType>, string>>;
  logLevel: 'none' | 'info' | 'warn';
  enableIpTracking?: boolean;
}

export const DEFAULT_KNOWN_BOTS: Record<string, AiCrawlerType> = {
  'gptbot': 'gptbot',
  'gptbot-2': 'gptbot',
  'chatgpt-user': 'gptbot',
  'anthropic-ai': 'anthropic-ai',
  'anthropic-ai-render': 'anthropic-ai',
  'claudebot': 'claudebot',
  'claude-web': 'claudebot',
  'perplexitybot': 'perplexitybot',
  'perplexitybot-ssl': 'perplexitybot',
  'perplexity': 'perplexitybot',
  'google-extended': 'google-extended',
  'bytespider': 'bytespider',
  'ccbot': 'ccbot',
  'cohere-ai': 'custom',
  'omgili': 'custom',
  'omgilibot': 'custom',
  'facebookbot': 'custom',
  'diffbot': 'custom',
  'img2dataset': 'custom',
};

export const DEFAULT_CONFIG: AiCrawlerConfig = {
  knownBots: DEFAULT_KNOWN_BOTS,
  blockImagesFor: [],
  redirectUrls: {},
  logLevel: 'none',
  enableIpTracking: false,
};

export function mergeConfig(
  userConfig?: Partial<AiCrawlerConfig>
): AiCrawlerConfig {
  if (!userConfig) return DEFAULT_CONFIG;

  return {
    knownBots: {
      ...DEFAULT_CONFIG.knownBots,
      ...(userConfig.knownBots || {}),
    },
    blockImagesFor: userConfig.blockImagesFor || DEFAULT_CONFIG.blockImagesFor,
    redirectUrls: userConfig.redirectUrls || DEFAULT_CONFIG.redirectUrls,
    logLevel: userConfig.logLevel || DEFAULT_CONFIG.logLevel,
    enableIpTracking:
      userConfig.enableIpTracking ?? DEFAULT_CONFIG.enableIpTracking,
  };
}
