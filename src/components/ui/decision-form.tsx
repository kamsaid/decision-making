'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Send, Plus, Minus } from 'lucide-react'

// Interface for form data
interface FormData {
  context: string
  preferences: string[]
  constraints: string[]
}

interface DecisionFormUIProps {
  onSubmit: (data: FormData) => Promise<void>
  isLoading: boolean
  error: string | null
}

// DecisionFormUI component for collecting user input with modern styling
export function DecisionFormUI({ onSubmit, isLoading, error }: DecisionFormUIProps) {
  const [formData, setFormData] = React.useState<FormData>({
    context: '',
    preferences: [''],
    constraints: ['']
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit(formData)
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
    <div className="max-w-2xl w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Make a Better Decision
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Let our AI assistant help you analyze your options and make an informed choice.
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Decision Context */}
        <LabelInputContainer className="mb-6">
          <Label htmlFor="context">What decision are you trying to make?</Label>
          <Input
            id="context"
            value={formData.context}
            onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
            placeholder="e.g., Should I move to a new city?"
            required
          />
        </LabelInputContainer>

        {/* Preferences */}
        <div className="mb-6">
          <Label className="block mb-4">What are your preferences?</Label>
          {formData.preferences.map((pref, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                value={pref}
                onChange={(e) => handleFieldChange('preferences', index, e.target.value)}
                placeholder="e.g., Good weather"
                required
              />
              {formData.preferences.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveField('preferences', index)}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddField('preferences')}
            className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add another preference
          </button>
        </div>

        {/* Constraints */}
        <div className="mb-8">
          <Label className="block mb-4">What are your constraints?</Label>
          {formData.constraints.map((constraint, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                value={constraint}
                onChange={(e) => handleFieldChange('constraints', index, e.target.value)}
                placeholder="e.g., Budget under $2000/month"
                required
              />
              {formData.constraints.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveField('constraints', index)}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddField('constraints')}
            className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add another constraint
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto" />
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Send className="h-5 w-5" />
              <span>Get Recommendations</span>
            </div>
          )}
          <BottomGradient />
        </button>
      </form>
    </div>
  )
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  )
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  )
} 