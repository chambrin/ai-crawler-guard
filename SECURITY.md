# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of AI Crawler Guard seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: [Your Security Email]

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- Type of issue (e.g., bypass detection, injection, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

This information will help us triage your report more quickly.

### What to Expect

- We will acknowledge receipt of your vulnerability report
- We will work to verify the vulnerability and determine its impact
- We will release a fix as soon as possible, depending on complexity
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Considerations

### Bot Detection Limitations

This library provides server-side bot detection based on User-Agent strings and other request headers. Please be aware:

- User-Agent strings can be spoofed
- Determined actors can bypass detection by modifying their requests
- This library is designed to detect well-behaved AI crawlers that identify themselves
- It should be used as part of a defense-in-depth strategy, not as the sole security measure

### Recommended Practices

1. **Use in Combination with robots.txt**: Deploy both runtime detection and robots.txt directives
2. **Monitor and Log**: Enable logging to track crawler behavior
3. **Rate Limiting**: Implement rate limiting alongside this library
4. **Content Protection**: Use additional content protection measures for sensitive data
5. **Regular Updates**: Keep the library updated to detect new AI crawlers

### Not a Security Tool

This library is designed for:
- Enforcing terms of service
- Reducing server load
- Controlling content access for AI training

It is NOT designed for:
- Preventing determined attacks
- Protecting against malicious actors
- Replacing proper authentication/authorization
- Securing sensitive data

For sensitive applications, implement proper security measures including:
- Authentication and authorization
- Rate limiting
- Web Application Firewall (WAF)
- DDoS protection
- Regular security audits

## Disclosure Policy

We follow coordinated vulnerability disclosure:

1. Security reports are kept private until a fix is released
2. We work with reporters to understand and address issues
3. We release security advisories with fixed versions
4. We credit security researchers (unless they prefer anonymity)

## Security Updates

Security updates will be released as patch versions and announced through:

- GitHub Security Advisories
- Release notes
- NPM package updates

## Questions

If you have questions about this policy, please contact: [Your Contact Email]

Thank you for helping keep AI Crawler Guard and its users safe!
