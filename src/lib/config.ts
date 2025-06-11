/**
 * Configuration for AI token limits and other settings
 * Adjust these values if you experience truncated responses
 */

export const AI_CONFIG = {
  // Token limits for different parts of the recommendation engine
  tokens: {
    // For orchestrator and worker tasks
    small: 2048,   // Increased significantly to prevent truncation of detailed recommendations
    // For synthesis tasks that combine worker outputs
    large: 3072,  // Increased to allow for comprehensive final responses
  },
  
  // Timeout settings (in milliseconds)
  timeouts: {
    orchestrator: 15_000,
    worker: 20_000,      // Increased to accommodate longer responses
    synthesis: 20_000,   // Increased to accommodate longer responses
    workerParallel: 50_000,  // Increased overall timeout
  },
  
  // Model configuration
  models: {
    orchestrator: 'gpt-4o',
    synthesis: 'gpt-4o',
  },
  
  // Temperature settings for creativity/consistency balance
  temperature: {
    orchestrator: 0.6,  // Lower = more consistent
    worker: 0.8,        // Higher = more creative
    synthesis: 0.5,     // Balanced for final output
  },
} as const;

// Export type for type safety
export type AIConfig = typeof AI_CONFIG; 