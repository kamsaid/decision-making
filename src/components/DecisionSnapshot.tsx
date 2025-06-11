'use client'

import { Pencil, Target, Heart, AlertCircle } from 'lucide-react'

// Interface for decision context
interface DecisionContext {
  context?: string
  preferences?: string[]
  constraints?: string[]
}

// Interface for DecisionSnapshot props
interface DecisionSnapshotProps {
  decisionContext: DecisionContext | null
  onEditClick?: () => void
  className?: string
}

/**
 * DecisionSnapshot Component
 * Displays a sticky summary card with the user's decision context
 * Provides quick reference and edit functionality
 */
export default function DecisionSnapshot({ 
  decisionContext, 
  onEditClick,
  className = '' 
}: DecisionSnapshotProps) {
  // Don't render if no decision context
  if (!decisionContext?.context) {
    return null
  }

  return (
    <div 
      className={`sticky top-0 z-10 mb-4 ${className}`}
      data-testid="decision-snapshot"
    >
      {/* Glass morphism card with subtle gradient */}
      <div className="bg-surface-glass/80 backdrop-blur-md rounded-xl border border-border-subtle shadow-lg p-4">
        {/* Header with decision context and edit button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2 flex-1">
            <Target className="h-5 w-5 text-accent-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                Your Decision
              </h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {decisionContext.context}
              </p>
            </div>
          </div>
          
          {/* Edit button */}
          {onEditClick && (
            <button
              onClick={onEditClick}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
              aria-label="Edit decision context"
              data-testid="edit-decision-button"
            >
              <Pencil className="h-4 w-4 text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300" />
            </button>
          )}
        </div>

        {/* Preferences and Constraints in a compact grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Preferences */}
          {decisionContext.preferences && decisionContext.preferences.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-green-600 dark:text-green-500" />
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Preferences
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {decisionContext.preferences.map((pref, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          {decisionContext.constraints && decisionContext.constraints.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Constraints
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {decisionContext.constraints.map((constraint, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  >
                    {constraint}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Visual indicator that this is the context being used */}
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
            AI is aware of this context and will tailor responses accordingly
          </p>
        </div>
      </div>
    </div>
  )
} 