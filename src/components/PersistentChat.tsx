'use client'

import { useState } from 'react'
import { Chat } from '@/components/ui/chat'
import { MessageCircle } from 'lucide-react'

// Interface for chat messages
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Interface for decision context
interface DecisionContext {
  context?: string
  preferences?: string[]
  constraints?: string[]
}

// Interface for persistent chat props
interface PersistentChatProps {
  decisionContext?: DecisionContext | null
  className?: string
}

// Persistent chat component that's always visible
export default function PersistentChat({ decisionContext, className = '' }: PersistentChatProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isChatLoading, setIsChatLoading] = useState(false)

  // Handle sending messages to chat API
  const handleSendMessage = async (message: string) => {
    if (!decisionContext?.context) {
      // If no decision context, show a helpful message
      const helpMessage: ChatMessage = {
        role: 'assistant',
        content: 'Please fill out the decision form first so I can help you make better choices!'
      }
      setChatMessages([...chatMessages, { role: 'user', content: message }, helpMessage])
      return
    }

    setIsChatLoading(true)
    const newUserMessage: ChatMessage = { role: 'user', content: message }
    const newMessages = [...chatMessages, newUserMessage]
    setChatMessages(newMessages)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: decisionContext.context,
          preferences: decisionContext.preferences || [],
          constraints: decisionContext.constraints || [],
          previousMessages: chatMessages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 
          (data.details && JSON.stringify(data.details)) || 
          'Failed to get response'
        )
      }

      const assistantMessage: ChatMessage = { role: 'assistant', content: data.message }
      setChatMessages([...newMessages, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }
      setChatMessages([...newMessages, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Chat Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="h-5 w-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Decision Assistant
          </h2>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {decisionContext?.context 
            ? 'Ask me anything about your decision!' 
            : 'Complete the form to start getting personalized advice.'
          }
        </p>
      </div>

      {/* Chat Component */}
      <div className="flex-1">
        <Chat
          decisionContext={decisionContext?.context || ''}
          onSendMessage={handleSendMessage}
          messages={chatMessages}
          isLoading={isChatLoading}
        />
      </div>
    </div>
  )
} 