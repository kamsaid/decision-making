'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, AlertCircle } from 'lucide-react'

// Interface for form data
interface FormData {
  context: string
  preferences: string[]
  constraints: string[]
}

// Initial form state
const initialFormData: FormData = {
  context: '',
  preferences: [''],
  constraints: ['']
}

// DecisionForm component for collecting user input
export default function DecisionForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

  // Handle adding new preference or constraint fields
  const handleAddField = (field: 'preferences' | 'constraints') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  // Handle removing preference or constraint fields
  const handleRemoveField = (field: 'preferences' | 'constraints', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  // Handle field changes
  const handleFieldChange = (
    field: 'preferences' | 'constraints',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item))
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Decision Context */}
      <div>
        <label htmlFor="context" className="block text-sm font-medium text-gray-700">
          What decision are you trying to make?
        </label>
        <input
          type="text"
          id="context"
          value={formData.context}
          onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g., Should I move to a new city?"
          required
        />
      </div>

      {/* Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What are your preferences?
        </label>
        {formData.preferences.map((pref, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={pref}
              onChange={(e) => handleFieldChange('preferences', index, e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Good weather"
              required
            />
            {formData.preferences.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveField('preferences', index)}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddField('preferences')}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          + Add another preference
        </button>
      </div>

      {/* Constraints */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What are your constraints?
        </label>
        {formData.constraints.map((constraint, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={constraint}
              onChange={(e) => handleFieldChange('constraints', index, e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Budget under $2000/month"
              required
            />
            {formData.constraints.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveField('constraints', index)}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddField('constraints')}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          + Add another constraint
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <Send className="h-5 w-5" />
            <span>Get Recommendations</span>
          </>
        )}
      </button>
    </form>
  )
} 