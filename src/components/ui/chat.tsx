'use client'

import React from 'react'
// Phase 1 – task 7: subtle fade-in animation for new messages
// We use Framer Motion for enter animations.  In Jest tests the module is
// mocked, so this import remains a dev-only dependency during CI.
import { motion, AnimatePresence } from 'framer-motion'
// Phase 2 – task 10: import the new ChatBubble component for cleaner message rendering
import { ChatBubble } from './chat-bubble'
// Phase 2 – task 11: import the TypingIndicator component for better typing indication
import { TypingIndicator } from './typing-indicator'
// Phase 2 – task 12: import the new ChatInput component for smart input functionality
import { ChatInput } from './chat-input'
// Import DecisionSnapshot for showing context above first AI reply
import DecisionSnapshot from '@/components/DecisionSnapshot'

// Interface for chat messages
interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Interface for decision context
interface DecisionContext {
  context?: string
  preferences?: string[]
  constraints?: string[]
}

interface ChatProps {
  decisionContext: string | DecisionContext // Updated to accept full context object
  onSendMessage: (message: string) => Promise<void>
  onSlashCommand?: (command: string, args: string) => Promise<void> | void
  messages: Message[]
  /**
   * When true, a typing indicator is shown.  For backward compatibility with
   * existing code that still passes `isLoading`, we keep that prop optional
   * and fall back to it if `isTyping` is not provided.
   */
  isTyping?: boolean
  /** @deprecated Replaced by `isTyping` in Phase 1 task 6 */
  isLoading?: boolean
  /**
   * Callback for handling feedback on assistant messages
   */
  onFeedback?: (type: 'positive' | 'negative', content: string, comment?: string) => void
  /**
   * Callback for when the edit button is clicked on DecisionSnapshot
   */
  onEditClick?: () => void
}

export function Chat({
  decisionContext,
  onSendMessage,
  onSlashCommand,
  messages,
  isTyping,
  isLoading,
  onFeedback,
  onEditClick,
}: ChatProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Unified typing flag supporting the new `isTyping` prop while keeping
  // backward-compatibility with the deprecated `isLoading` flag.
  const typing = isTyping ?? isLoading ?? false

  // Parse decision context - handle both string and object formats for backward compatibility
  const contextObject: DecisionContext | null = React.useMemo(() => {
    if (typeof decisionContext === 'string') {
      return decisionContext ? { context: decisionContext } : null
    }
    return decisionContext
  }, [decisionContext])

  // Find the index of the first assistant message
  const firstAssistantIndex = messages.findIndex(msg => msg.role === 'assistant')

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-bg-base/80 dark:bg-bg-base-dark/80 backdrop-blur-md rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800">
      {/* Messages Area - Now uses flex-1 to take available space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              {/* Show DecisionSnapshot above the first assistant message */}
              {index === firstAssistantIndex && contextObject && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <DecisionSnapshot 
                    decisionContext={contextObject}
                    onEditClick={onEditClick}
                  />
                </motion.div>
              )}
              
              <motion.div
                data-testid="chat-message-row"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {/* Phase 2 – task 10: Use the dedicated ChatBubble component for cleaner message rendering */}
                <ChatBubble 
                  role={message.role}
                  content={message.content}
                  onFeedback={onFeedback}
                />
              </motion.div>
            </React.Fragment>
          ))}
        </AnimatePresence>
        
        {/* Phase 2 – task 11: Improved typing indicator using dedicated component */}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-surface-glass/65 backdrop-blur-sm rounded-xl px-4 py-2 shadow-md border border-border-subtle">
              <TypingIndicator />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Phase 2 – task 12: Replace embedded input with smart ChatInput component */}
      <ChatInput
        onSendMessage={onSendMessage}
        onSlashCommand={onSlashCommand}
        placeholder="Ask a follow-up question..."
        disabled={typing}
      />
    </div>
  )
} 