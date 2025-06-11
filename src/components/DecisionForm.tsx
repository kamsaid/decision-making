'use client'

import { useState } from 'react'
import { DecisionFormUI } from '@/components/ui/decision-form'
import { Chat } from '@/components/ui/chat'

// Interface for form data
interface FormData {
  context: string
  preferences: string[]
  constraints: string[]
}

// Interface for task analysis
interface Task {
  type: string
  description: string
}

// Interface for analysis data
interface Analysis {
  analysis: string
  tasks: Task[]
}

// Interface for final recommendation
interface FinalRecommendation {
  summary: string
  reasoning: string
  keyPoints: string[]
  nextSteps: string[]
  resources: string[]
}

// Interface for API response
interface ApiResponse {
  analysis: Analysis
  finalRecommendation: FinalRecommendation
}

// Add new interface for chat messages after other interfaces
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// DecisionForm component that handles the business logic
export default function DecisionForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [currentContext, setCurrentContext] = useState<FormData | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [finalRecommendation, setFinalRecommendation] = useState<FinalRecommendation | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isChatLoading, setIsChatLoading] = useState(false)

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setShowResults(true)
    setCurrentContext(formData)
    setAnalysis(null)
    setFinalRecommendation(null)

    try {
      // Filter out empty strings from preferences and constraints
      const cleanedData = {
        ...formData,
        preferences: formData.preferences.filter(p => p.trim() !== ''),
        constraints: formData.constraints.filter(c => c.trim() !== '')
      }

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 
          (data.details && JSON.stringify(data.details)) || 
          'Failed to get recommendations'
        )
      }

      // Type check the response
      if (!data.analysis || !data.finalRecommendation) {
        throw new Error('Invalid response format from server')
      }

      setAnalysis(data.analysis)
      setFinalRecommendation(data.finalRecommendation)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Add new function for handling chat messages
  const handleSendMessage = async (message: string) => {
    if (!currentContext) return

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
          context: currentContext.context,
          preferences: currentContext.preferences,
          constraints: currentContext.constraints,
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
      setError(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setIsChatLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Decision Form */}
      <div className={showResults ? 'border-b border-neutral-200 dark:border-neutral-800 pb-8' : ''}>
        <DecisionFormUI
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Results Section */}
      {showResults && (
        <div className="space-y-8">
          {/* Context Summary */}
          {currentContext && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
                Your Decision Context
              </h2>
              <div className="bg-bg-base/80 dark:bg-bg-base-dark/80 backdrop-blur-md rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Your Decision</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{currentContext.context}</p>
                {currentContext.preferences.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Key Preferences</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {currentContext.preferences.map((pref, index) => (
                        <li key={index} className="text-neutral-600 dark:text-neutral-400">{pref}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {currentContext.constraints.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Constraints</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {currentContext.constraints.map((constraint, index) => (
                        <li key={index} className="text-neutral-600 dark:text-neutral-400">{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-accent-primary dark:text-accent-primary" />
            </div>
          )}

          {/* Analysis and Thinking Process */}
          {!isLoading && analysis && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
                Thinking Process
              </h2>
              <div className="bg-bg-base/80 dark:bg-bg-base-dark/80 backdrop-blur-md rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-6">
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">{analysis.analysis}</p>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Analysis Steps</h3>
                  <ul className="space-y-2">
                    {analysis.tasks.map((task, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-accent-primary dark:text-accent-primary">•</span>
                        <span className="text-neutral-600 dark:text-neutral-400">{task.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Final Recommendation */}
          {!isLoading && finalRecommendation && (
            <>
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
                  Final Recommendation
                </h2>
                <div className="bg-bg-base/80 dark:bg-bg-base-dark/80 backdrop-blur-md rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
                  <div>
                    <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      {finalRecommendation.summary}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {finalRecommendation.reasoning}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">Key Points</h3>
                    <ul className="space-y-2">
                      {finalRecommendation.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-accent-secondary dark:text-accent-secondary">•</span>
                          <span className="text-neutral-600 dark:text-neutral-400">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Add Next Steps section */}
                  {finalRecommendation.nextSteps && finalRecommendation.nextSteps.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">Next Steps</h3>
                      <ul className="space-y-2">
                        {finalRecommendation.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-accent-primary dark:text-accent-primary font-medium">{index + 1}.</span>
                            <span className="text-neutral-600 dark:text-neutral-400">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Add Resources section */}
                  {finalRecommendation.resources && finalRecommendation.resources.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">Recommended Resources</h3>
                      <ul className="space-y-2">
                        {finalRecommendation.resources.map((resource, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-accent-secondary dark:text-accent-secondary">📚</span>
                            <span className="text-neutral-600 dark:text-neutral-400">{resource}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
                  Need More Insights?
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Chat with me to explore your decision further or get clarification on any aspects.
                </p>
                <Chat
                  decisionContext={currentContext?.context || ''}
                  onSendMessage={handleSendMessage}
                  messages={chatMessages}
                  isLoading={isChatLoading}
                />
              </div>
            </>
          )}

          {/* No Recommendations State */}
          {!isLoading && !finalRecommendation && !error && (
            <div className="text-center text-neutral-600 dark:text-neutral-400 py-12">
              No recommendations found. Please try adjusting your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  )
} 