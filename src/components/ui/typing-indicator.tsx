import React from 'react'

interface TypingIndicatorProps {
  /** Optional extra Tailwind classes */
  className?: string
}

/**
 * A minimal three-dot typing indicator using Tailwind for size, colour and
 * animation. Each dot is offset slightly to create a wave effect.
 * Accessible with proper ARIA labeling for screen readers.
 */
export function TypingIndicator({ className = '' }: TypingIndicatorProps) {
  return (
    <div className={`flex space-x-2 ${className}`.trim()} aria-label="Typing…">
      {/* First dot - no animation delay */}
      <span 
        role="generic"
        className="block w-2 h-2 bg-text-primary rounded-full animate-bounce" 
      />
      {/* Second dot - 0.2s animation delay creates wave effect */}
      <span 
        role="generic"
        className="block w-2 h-2 bg-text-primary rounded-full animate-bounce [animation-delay:0.2s]" 
      />
      {/* Third dot - 0.4s animation delay completes wave effect */}
      <span 
        role="generic"
        className="block w-2 h-2 bg-text-primary rounded-full animate-bounce [animation-delay:0.4s]" 
      />
    </div>
  )
}
