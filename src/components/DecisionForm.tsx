'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DecisionFormUI } from '@/components/ui/decision-form'

// Interface for form data
interface FormData {
  context: string
  preferences: string[]
  constraints: string[]
}

// DecisionForm component that handles the business logic
export default function DecisionForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to get recommendations')
      }

      // Construct the URL with query parameters
      const params = new URLSearchParams()
      params.set('context', cleanedData.context)
      cleanedData.preferences.forEach(p => params.append('preferences', p))
      cleanedData.constraints.forEach(c => params.append('constraints', c))

      router.push(`/recommendations?${params.toString()}`)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DecisionFormUI
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  )
} 