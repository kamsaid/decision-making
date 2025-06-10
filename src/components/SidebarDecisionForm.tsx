'use client'

import { useState } from 'react'
import { DecisionFormUI } from '@/components/ui/decision-form'

// Interface for form data
interface FormData {
  context: string
  preferences: string[]
  constraints: string[]
}

// Interface for the component props
interface SidebarDecisionFormProps {
  onFormSubmit?: (formData: FormData) => void
  onContextChange?: (formData: FormData | null) => void
}

// Sidebar-optimized DecisionForm component
export default function SidebarDecisionForm({ onFormSubmit, onContextChange }: SidebarDecisionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentContext, setCurrentContext] = useState<FormData | null>(null)

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Filter out empty strings from preferences and constraints
      const cleanedData = {
        ...formData,
        preferences: formData.preferences.filter(p => p.trim() !== ''),
        constraints: formData.constraints.filter(c => c.trim() !== '')
      }

      // Update the current context for chat
      setCurrentContext(cleanedData)
      
      // Notify parent components
      onContextChange?.(cleanedData)
      onFormSubmit?.(cleanedData)

      // Make API call for recommendations (optional - can be handled by parent)
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

      // Success - context is now available for chat
      console.log('Recommendations received:', data)
      
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Your Decision
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Tell me about your situation and I'll help you make the best choice.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <DecisionFormUI
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Context Summary (if available) */}
      {currentContext && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Ready for Chat
            </span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300">
            Your decision context is now available. Ask me anything in the chat!
          </p>
        </div>
      )}
    </div>
  )
} 