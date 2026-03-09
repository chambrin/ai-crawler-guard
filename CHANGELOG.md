# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-03-09

### Added

- Initial release of @chambrin/ai-crawler-guard
- Core detection engine for AI crawlers
- Support for detecting:
  - GPTBot (OpenAI)
  - ClaudeBot (Anthropic)
  - PerplexityBot (Perplexity)
  - Google-Extended (Google Bard/Gemini)
  - Bytespider (ByteDance)
  - CCBot (Common Crawl)
  - And more AI crawlers
- Composable action system:
  - `blockImages()` - Block image requests
  - `redirect()` - Redirect AI crawlers
  - `log()` - Log crawler visits
  - `textOnly()` - Block non-text content
- Framework-specific middlewares:
  - Next.js (App Router)
  - Express
  - Hono
  - H3 (Nuxt/SvelteKit)
- Robots.txt generator with presets
- TypeScript support with strict types
- Comprehensive documentation and examples
- Zero runtime dependencies

### Features

- Server-side only detection (no client-side JavaScript)
- Framework-agnostic core library
- Extensible bot pattern matching
- IP tracking support
- Confidence scoring for detections
- Configurable logging levels

[0.1.0]: https://github.com/chambrin/ai-crawler-guard/releases/tag/v0.1.0
