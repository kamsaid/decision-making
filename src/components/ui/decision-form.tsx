'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Send, Plus, Minus } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
    <div className="max-w-2xl w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-bg-base/80 dark:bg-bg-base-dark/80 backdrop-blur-md">
      <h2 className="font-bold text-3xl text-neutral-800 dark:text-neutral-200 text-center">
        What decision can I help you with?
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 text-center">
        
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-accent-primary/10 border border-accent-primary/30 rounded-lg p-4 text-accent-primary">
            {error}
          </div>
        )}

        <Accordion type="single" collapsible className="w-full space-y-4">
          {/* Decision Context */}
          <AccordionItem value="context" className="border border-neutral-200 dark:border-neutral-800 rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="text-neutral-800 dark:text-neutral-200">what's on your mind?</span>
            </AccordionTrigger>
            <AccordionContent>
              <Input
                id="context"
                value={formData.context}
                onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                placeholder="e.g., moving to a new city, changing careers, buying a house"
                required
                className="mt-2"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Preferences */}
          <AccordionItem value="preferences" className="border border-neutral-200 dark:border-neutral-800 rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="text-neutral-800 dark:text-neutral-200">what matters most to you?</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {formData.preferences.map((pref, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={pref}
                      onChange={(e) => handleFieldChange('preferences', index, e.target.value)}
                      placeholder="e.g., work-life balance, growth opportunities, financial stability"
                      required
                    />
                    {formData.preferences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField('preferences', index)}
                        className="p-2 text-accent-primary hover:text-accent-primary/80"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddField('preferences')}
                  className="mt-2 flex items-center text-sm text-accent-primary hover:text-accent-primary/80"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add another preference
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Constraints */}
          <AccordionItem value="constraints" className="border border-neutral-200 dark:border-neutral-800 rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="text-neutral-800 dark:text-neutral-200">what's holding you back?</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {formData.constraints.map((constraint, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={constraint}
                      onChange={(e) => handleFieldChange('constraints', index, e.target.value)}
                      placeholder="e.g., budget, timeline, family commitments"
                      required
                    />
                    {formData.constraints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField('constraints', index)}
                        className="p-2 text-accent-primary hover:text-accent-primary/80"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddField('constraints')}
                  className="mt-2 flex items-center text-sm text-accent-primary hover:text-accent-primary/80"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add another constraint
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-8 bg-gradient-to-br relative group/btn from-accent-primary to-accent-primary/80 block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:from-accent-primary/90 hover:to-accent-primary/70 transition-all"
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
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-accent-secondary to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-accent-primary to-transparent" />
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