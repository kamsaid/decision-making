'use client'

import React, { useState } from 'react'
import { ThumbsUp, ThumbsDown, User, Bot } from 'lucide-react'

// Interface for feedback data
interface FeedbackData {
  type: 'positive' | 'negative'
  content: string
  comment?: string
}

// Interface for the ChatBubble component props
interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  className?: string
  onFeedback?: (type: 'positive' | 'negative', content: string, comment?: string) => void
}

/**
 * ChatBubble component for rendering individual chat messages
 * Provides consistent styling, role-based alignment, and feedback functionality for chat messages
 * 
 * @param role - The role of the message sender (user or assistant)
 * @param content - The text content of the message
 * @param className - Optional additional CSS classes
 * @param onFeedback - Optional callback for handling feedback on assistant messages
 */
export function ChatBubble({ role, content, className = '', onFeedback }: ChatBubbleProps) {
  // State for managing feedback interaction
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null)

  // Determine styling based on the message role
  const isUser = role === 'user'
  
  // Role-specific styling classes with enhanced differentiation
  const bubbleClasses = isUser
    ? 'bg-primary-brand text-white' // User messages use primary brand color
    : 'bg-surface-glass/65 text-text-primary backdrop-blur-sm' // Assistant messages use glass effect
  
  // Row alignment classes
  const rowAlignment = isUser ? 'justify-end' : 'justify-start'

  // Handle feedback button clicks
  const handleFeedback = (type: 'positive' | 'negative') => {
    if (type === 'negative') {
      setShowCommentBox(true)
    } else {
      // For positive feedback, call immediately
      onFeedback?.(type, content)
      setFeedbackGiven(type)
    }
  }

  // Handle feedback submission with comment
  const handleFeedbackSubmit = () => {
    onFeedback?.('negative', content, feedbackComment)
    setFeedbackGiven('negative')
    setShowCommentBox(false)
    setFeedbackComment('')
  }

  return (
    <div 
      data-testid="chat-bubble-row"
      className={`flex ${rowAlignment} items-start gap-3 mb-4`}
    >
      {/* Avatar for message sender - shows on left for assistant, right for user */}
      {!isUser && (
        <div 
          data-testid="assistant-avatar"
          className="flex-shrink-0 w-8 h-8 bg-surface-glass/65 backdrop-blur-sm rounded-full flex items-center justify-center border border-border-subtle"
        >
          <Bot className="w-4 h-4 text-accent-primary" />
        </div>
      )}

      <div className="flex flex-col max-w-[80%]">
        {/* Message bubble */}
        <div
          data-testid="chat-bubble"
          className={`
            rounded-xl px-4 py-2 shadow-md border border-border-subtle
            ${bubbleClasses}
            ${className}
          `.trim()}
        >
          <p className="text-sm whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* Feedback buttons for assistant messages */}
        {!isUser && onFeedback && (
          <div className="mt-2 flex items-center gap-2">
            <button
              data-testid="thumbs-up-button"
              onClick={() => handleFeedback('positive')}
              disabled={feedbackGiven !== null}
              className={`
                p-1 rounded-full transition-colors hover:bg-surface-glass/50 disabled:opacity-50
                ${feedbackGiven === 'positive' ? 'bg-green-100 text-green-600' : 'text-neutral-500'}
              `}
              aria-label="Positive feedback"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            
            <button
              data-testid="thumbs-down-button"
              onClick={() => handleFeedback('negative')}
              disabled={feedbackGiven !== null}
              className={`
                p-1 rounded-full transition-colors hover:bg-surface-glass/50 disabled:opacity-50
                ${feedbackGiven === 'negative' ? 'bg-red-100 text-red-600' : 'text-neutral-500'}
              `}
              aria-label="Negative feedback"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>

            {feedbackGiven && (
              <span className="text-xs text-neutral-500 ml-2">
                Thank you for your feedback!
              </span>
            )}
          </div>
        )}

        {/* Comment box for negative feedback */}
        {showCommentBox && (
          <div className="mt-2 p-3 bg-surface-glass/65 backdrop-blur-sm rounded-lg border border-border-subtle">
            <label className="block text-xs text-neutral-600 mb-2">
              What could be improved? (optional)
            </label>
            <textarea
              data-testid="feedback-comment-box"
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Your feedback helps us improve..."
              className="w-full text-xs p-2 border border-border-subtle rounded bg-white/50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                data-testid="submit-feedback-button"
                onClick={handleFeedbackSubmit}
                className="px-3 py-1 text-xs bg-accent-primary text-white rounded hover:bg-accent-primary/90 transition-colors"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setShowCommentBox(false)
                  setFeedbackComment('')
                }}
                className="px-3 py-1 text-xs bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar for user messages - shows on right */}
      {isUser && (
        <div 
          data-testid="user-avatar"
          className="flex-shrink-0 w-8 h-8 bg-primary-brand rounded-full flex items-center justify-center"
        >
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  )
} 