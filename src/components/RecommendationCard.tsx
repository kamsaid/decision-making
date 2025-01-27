'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

// Interface for recommendation data
interface Recommendation {
  title: string
  description: string
  pros: string[]
  cons: string[]
}

interface RecommendationCardProps {
  recommendation: Recommendation
}

// RecommendationCard component for displaying individual recommendations
export default function RecommendationCard({ 
  recommendation
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-all duration-200 hover:shadow-xl">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400">
            {recommendation.title}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {recommendation.description}
        </p>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Pros */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Advantages</h4>
              <ul className="space-y-2">
                {recommendation.pros.map((pro, index) => (
                  <li 
                    key={index}
                    className="flex items-start space-x-2"
                  >
                    <span className="text-emerald-500 dark:text-emerald-400">+</span>
                    <span className="text-neutral-600 dark:text-neutral-400">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Considerations</h4>
              <ul className="space-y-2">
                {recommendation.cons.map((con, index) => (
                  <li 
                    key={index}
                    className="flex items-start space-x-2"
                  >
                    <span className="text-rose-500 dark:text-rose-400">-</span>
                    <span className="text-neutral-600 dark:text-neutral-400">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 