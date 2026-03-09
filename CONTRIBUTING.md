# Contributing to AI Crawler Guard

Thank you for your interest in contributing to AI Crawler Guard! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Guidelines](#coding-guidelines)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/ai-crawler-guard.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## How to Contribute

### Adding New Bot Detections

To add a new AI crawler to the detection list:

1. Add the bot pattern to `src/config.ts` in the `DEFAULT_KNOWN_BOTS` object:

```typescript
export const DEFAULT_KNOWN_BOTS: Record<string, AiCrawlerType> = {
  // ... existing bots
  'new-bot-name': 'custom',
};
```

2. If it's a major bot, consider adding it as a new type in `AiCrawlerType`
3. Add the bot to the robots.txt presets in `src/robots-txt/presets.ts`
4. Update the README.md with the new bot information
5. Add tests for the new bot detection

### Adding New Actions

To create a new action:

1. Create a new file in `src/actions/` (e.g., `your-action.ts`)
2. Implement the `ActionExecutor` interface
3. Export the action from `src/index.ts`
4. Add documentation in the README
5. Add examples in the `examples/` directory

Example:

```typescript
import { AiCrawlerMatch } from '../config.js';
import { ActionExecutor } from './types.js';

export function yourAction(options?: YourOptions): ActionExecutor {
  return {
    execute(match: AiCrawlerMatch, request?: Request): Response | void {
      // Your logic here
    }
  };
}
```

### Adding Framework Support

To add support for a new framework:

1. Create a new middleware file in `src/middleware/` (e.g., `your-framework.ts`)
2. Implement the middleware following the framework's conventions
3. Export the middleware from `src/middleware/index.ts` and `src/index.ts`
4. Add documentation and examples
5. Update the README with framework-specific usage

## Coding Guidelines

### TypeScript

- Use strict TypeScript types
- Avoid using `any` (use `unknown` if necessary)
- Provide JSDoc comments for public APIs
- Follow the existing code style

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons
- Use trailing commas in multi-line arrays/objects
- Keep functions small and focused

### File Naming

- Use kebab-case for file names: `my-file.ts`
- Use PascalCase for classes: `AiCrawlerGuard`
- Use camelCase for functions and variables: `detectAiCrawler`

### Commits

- Use clear, descriptive commit messages
- Follow conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

Example:
```
feat: add support for new AI crawler detection
fix: correct image blocking regex pattern
docs: update README with new examples
```

## Submitting Changes

1. Ensure all tests pass: `npm test`
2. Ensure type checking passes: `npm run typecheck`
3. Build the project: `npm run build`
4. Commit your changes with a clear message
5. Push to your fork
6. Create a Pull Request

### Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include tests for new functionality
- Update documentation as needed
- Ensure CI passes

## Reporting Bugs

When reporting bugs, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, framework version)
- Code samples or error messages

Use the GitHub issue tracker: https://github.com/chambrin/ai-crawler-guard/issues

## Suggesting Enhancements

We welcome enhancement suggestions! Please include:

- A clear description of the enhancement
- Use cases and benefits
- Possible implementation approach
- Any potential drawbacks

## Testing

- Write tests for all new functionality
- Ensure existing tests still pass
- Aim for high code coverage
- Test edge cases

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new APIs
- Update examples in the `examples/` directory
- Update CHANGELOG.md with your changes

## Questions?

Feel free to open an issue for any questions or concerns.

Thank you for contributing to AI Crawler Guard!
