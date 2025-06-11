'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Smile } from 'lucide-react'

// Interface for chat input props
interface ChatInputProps {
  /** Function called when a message is sent */
  onSendMessage: (message: string) => Promise<void>
  /** Function called when a slash command is detected (optional) */
  onSlashCommand?: (command: string, args: string) => Promise<void> | void
  /** Placeholder text for the input */
  placeholder?: string
  /** Whether the input should be disabled (e.g., while loading) */
  disabled?: boolean
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Smart chat input component with autosize textarea, enter-to-send, 
 * and emoji button placeholder. Supports multiline with Shift+Enter.
 */
export function ChatInput({ 
  onSendMessage, 
  onSlashCommand,
  placeholder = "Type your message...", 
  disabled = false,
  className = ''
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    
    // Calculate new height based on content, with min and max limits
    const minHeight = 40 // Minimum height in pixels
    const maxHeight = 120 // Maximum height before scrolling
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
    
    textarea.style.height = `${newHeight}px`
  }

  // Adjust height when input changes
  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  // Parse slash commands from input
  const parseSlashCommand = (message: string): { isCommand: boolean; command?: string; args?: string } => {
    // Check if message starts with a slash and contains valid command characters
    const slashCommandRegex = /^\/([a-zA-Z]+)(?:\s+(.*))?$/
    const match = message.match(slashCommandRegex)
    
    if (!match) {
      return { isCommand: false }
    }
    
    const command = match[1].toLowerCase()
    const args = match[2] || ''
    
    // List of supported commands
    const supportedCommands = ['pref', 'con', 'reset', 'help']
    
    if (supportedCommands.includes(command)) {
      return { isCommand: true, command, args }
    }
    
    // Unknown slash command - treat as regular message
    return { isCommand: false }
  }

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    // Don't send empty or whitespace-only messages
    if (!input.trim() || disabled) return

    const message = input.trim()
    setInput('') // Clear input immediately
    
    try {
      // Check if this is a slash command
      const { isCommand, command, args } = parseSlashCommand(message)
      
      if (isCommand && command && onSlashCommand) {
        // Handle slash command
        await onSlashCommand(command, args || '')
      } else {
        // Handle regular message
        await onSendMessage(message)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Could add error handling UI here
    }
  }

  // Handle keyboard events for enter-to-send functionality
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter allows multiline - let default behavior happen
        return
      } else {
        // Enter sends the message
        e.preventDefault()
        handleSubmit()
      }
    }
  }

  // Handle emoji button click (placeholder functionality)
  const handleEmojiClick = () => {
    // Placeholder for emoji picker functionality
    console.log('Emoji picker would open here')
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className={`border-t border-neutral-200 dark:border-neutral-800 p-4 ${className}`.trim()}
    >
      <div className="flex items-end space-x-3">
        {/* Emoji Button (Placeholder) */}
        <button
          type="button"
          onClick={handleEmojiClick}
          disabled={disabled}
          data-testid="emoji-button"
          aria-label="Add emoji"
          className="flex-shrink-0 p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* Auto-sizing Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          data-autosize="true"
          rows={1}
          className="flex-1 min-w-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ 
            minHeight: '40px',
            maxHeight: '120px'
          }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          aria-label="Send message"
          className="flex-shrink-0 bg-accent-primary text-white rounded-lg px-4 py-2 hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Optional: Add hint text for keyboard shortcuts */}
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        Press Enter to send, Shift+Enter for new line • Try commands: /pref, /con, /reset, /help
      </div>
    </form>
  )
} 