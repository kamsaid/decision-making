# AI Configuration Guide

## Overview
This guide explains how to configure the AI token limits and other settings for the recommendations engine to prevent truncated responses.

## Configuration File
All AI-related settings are centralized in `/src/lib/config.ts`.

## Token Limits
The token limits control how much content the AI can generate:

- **Small tokens (512)**: Used for orchestrator and worker tasks
- **Large tokens (1024)**: Used for final synthesis of recommendations

### Adjusting Token Limits
If you experience truncated responses, increase the token limits in `src/lib/config.ts`:

```typescript
export const AI_CONFIG = {
  tokens: {
    small: 512,   // Increase this if worker responses are cut off
    large: 1024,  // Increase this if final recommendations are cut off
  },
  // ... other settings
};
```

## Common Issues and Solutions

### 1. Truncated Responses
**Symptoms**: 
- JSON parsing errors
- Incomplete sentences ending with "..."
- Missing expected fields in responses

**Solution**: 
- Increase `tokens.small` to 768 or 1024
- Increase `tokens.large` to 1536 or 2048

### 2. Timeout Errors
**Symptoms**:
- "Operation timed out" errors
- Workers failing consistently

**Solution**:
- Increase the relevant timeout in the config
- Check your OpenAI API key and rate limits

### 3. Edge Runtime Limits
**Note**: Vercel Edge runtime has memory constraints. If token limits are too high, you may hit these limits.

**Recommended maximum values**:
- `tokens.small`: 1024
- `tokens.large`: 2048

## Testing Changes
After modifying the configuration:

1. Restart your development server
2. Run the test script: `node scripts/test-recommendations.js`
3. Check for truncation warnings in the test output

## Enhanced JSON Recovery
The system now includes sophisticated JSON recovery logic that can:
- Fix incomplete JSON structures
- Close unclosed strings, arrays, and objects
- Recover from common truncation patterns
- Salvage partial recommendations

This provides an additional safety net beyond just increasing token limits. 