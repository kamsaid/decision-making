'use client'

import { useState, useEffect } from 'react'
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

// Interface for final recommendation
interface FinalRecommendation {
  summary: string
  reasoning: string
  keyPoints: string[]
}

// Interface for persistent chat props
interface PersistentChatProps {
  decisionContext?: DecisionContext | null
  initialRecommendation?: FinalRecommendation | null
  onDecisionContextChange?: (context: DecisionContext | null) => void
  className?: string
}

// Persistent chat component that's always visible
export default function PersistentChat({ decisionContext, initialRecommendation, onDecisionContextChange, className = '' }: PersistentChatProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isChatLoading, setIsChatLoading] = useState(false)
  
  // Task 20: State for tracking context deltas
  const [lastSentContext, setLastSentContext] = useState<DecisionContext | null>(null)

  // Task 20: Calculate context delta between current and last sent context
  const calculateContextDelta = (currentContext: DecisionContext | null, lastContext: DecisionContext | null) => {
    if (!lastContext) {
      // First message, no delta
      return null
    }

    if (!currentContext) {
      return null
    }

    const currentPrefs = currentContext.preferences || []
    const lastPrefs = lastContext.preferences || []
    const currentCons = currentContext.constraints || []
    const lastCons = lastContext.constraints || []

    // Calculate additions and removals
    const addedPreferences = currentPrefs.filter(pref => !lastPrefs.includes(pref))
    const removedPreferences = lastPrefs.filter(pref => !currentPrefs.includes(pref))
    const addedConstraints = currentCons.filter(con => !lastCons.includes(con))
    const removedConstraints = lastCons.filter(con => !currentCons.includes(con))

    // Return null if no changes detected
    if (
      addedPreferences.length === 0 &&
      removedPreferences.length === 0 &&
      addedConstraints.length === 0 &&
      removedConstraints.length === 0
    ) {
      return null
    }

    return {
      addedPreferences,
      removedPreferences,
      addedConstraints,
      removedConstraints,
    }
  }

  // Handle feedback on assistant messages
  const handleFeedback = (type: 'positive' | 'negative', content: string, comment?: string) => {
    // Log feedback data (in production, this would be sent to analytics service)
    console.log('User feedback:', {
      type,
      content,
      comment,
      timestamp: new Date().toISOString(),
      decisionContext: decisionContext?.context,
    })

    // In production, you might want to send this to an analytics service:
    // await fetch('/api/feedback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type, content, comment, context: decisionContext?.context })
    // })
  }

  // Format initial recommendation as a chat message
  const formatInitialRecommendation = (recommendation: FinalRecommendation): string => {
    return `${recommendation.summary}\n\n${recommendation.reasoning}\n\nKey Points:\n• ${recommendation.keyPoints.join('\n• ')}`
  }

  // Handle initial recommendation and context changes
  useEffect(() => {
    if (initialRecommendation && decisionContext?.context) {
      // Add initial recommendation as first assistant message
      const initialMessage: ChatMessage = {
        role: 'assistant',
        content: formatInitialRecommendation(initialRecommendation)
      }
      setChatMessages([initialMessage])
    } else {
      // Clear messages when no recommendation or context
      setChatMessages([])
    }
  }, [initialRecommendation, decisionContext?.context]) // Depend on recommendation and context

  // Handle sending messages to chat API with streaming support
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

    // Add empty assistant message that will be populated during streaming
    const assistantMessageIndex = newMessages.length
    const initialAssistantMessage: ChatMessage = { role: 'assistant', content: '' }
    setChatMessages([...newMessages, initialAssistantMessage])

    try {
      // Task 20: Calculate context delta for efficient processing
      const contextDelta = calculateContextDelta(decisionContext, lastSentContext)
      
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
          contextDelta, // Task 20: Include context delta
        }),
      })
      
      // Task 20: Update last sent context after successful request
      setLastSentContext({ ...decisionContext })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                // Streaming complete
                break
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  accumulatedContent += parsed.content
                  
                  // Update the assistant message with accumulated content
                  setChatMessages(currentMessages => {
                    const updatedMessages = [...currentMessages]
                    updatedMessages[assistantMessageIndex] = {
                      role: 'assistant',
                      content: accumulatedContent
                    }
                    return updatedMessages
                  })
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming data:', data)
              }
            }
          }
        }
      }
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

  // Handle slash commands for modifying decision context
  const handleSlashCommand = async (command: string, args: string) => {
    if (!onDecisionContextChange) {
      // Add helpful message if no context change handler is available
      const helpMessage: ChatMessage = {
        role: 'assistant',
        content: 'Slash commands are not available in this context.'
      }
      setChatMessages([...chatMessages, helpMessage])
      return
    }

    const currentContext = decisionContext || { context: '', preferences: [], constraints: [] }

    switch (command) {
      case 'pref':
        if (args.trim()) {
          // Add new preference
          const newPreferences = [...(currentContext.preferences || []), args.trim()]
          const updatedContext = { ...currentContext, preferences: newPreferences }
          onDecisionContextChange(updatedContext)
          
          const confirmMessage: ChatMessage = {
            role: 'assistant',
            content: `Added preference: "${args.trim()}". Your preferences now include: ${newPreferences.join(', ')}`
          }
          setChatMessages([...chatMessages, confirmMessage])
        } else {
          // Show current preferences
          const prefsMessage: ChatMessage = {
            role: 'assistant',
            content: currentContext.preferences?.length 
              ? `Your current preferences: ${currentContext.preferences.join(', ')}`
              : 'You have no preferences set. Use `/pref [your preference]` to add one.'
          }
          setChatMessages([...chatMessages, prefsMessage])
        }
        break

      case 'con':
        if (args.trim()) {
          // Add new constraint
          const newConstraints = [...(currentContext.constraints || []), args.trim()]
          const updatedContext = { ...currentContext, constraints: newConstraints }
          onDecisionContextChange(updatedContext)
          
          const confirmMessage: ChatMessage = {
            role: 'assistant',
            content: `Added constraint: "${args.trim()}". Your constraints now include: ${newConstraints.join(', ')}`
          }
          setChatMessages([...chatMessages, confirmMessage])
        } else {
          // Show current constraints
          const consMessage: ChatMessage = {
            role: 'assistant',
            content: currentContext.constraints?.length 
              ? `Your current constraints: ${currentContext.constraints.join(', ')}`
              : 'You have no constraints set. Use `/con [your constraint]` to add one.'
          }
          setChatMessages([...chatMessages, consMessage])
        }
        break

      case 'reset':
        // Reset decision context
        onDecisionContextChange(null)
        setChatMessages([])
        
        const resetMessage: ChatMessage = {
          role: 'assistant',
          content: 'Decision context has been reset. Please fill out the form again to start fresh.'
        }
        setChatMessages([resetMessage])
        break

      case 'help':
        // Show help message
        const helpMessage: ChatMessage = {
          role: 'assistant',
          content: `Available commands:
• \`/pref [preference]\` - Add a preference or view current preferences
• \`/con [constraint]\` - Add a constraint or view current constraints  
• \`/reset\` - Clear all decision context and start over
• \`/help\` - Show this help message

Example: \`/pref affordable price\` or \`/con must be under $500\``
        }
        setChatMessages([...chatMessages, helpMessage])
        break

      default:
        // This shouldn't happen due to parsing logic, but just in case
        const unknownMessage: ChatMessage = {
          role: 'assistant',
          content: `Unknown command: /${command}. Type /help to see available commands.`
        }
        setChatMessages([...chatMessages, unknownMessage])
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
          onSlashCommand={handleSlashCommand}
          messages={chatMessages}
          isLoading={isChatLoading}
          onFeedback={handleFeedback}
        />
      </div>
    </div>
  )
} 