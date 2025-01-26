'use client'

import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

// Interface for recommendation data
interface Recommendation {
  title: string
  description: string
  pros: string[]
  cons: string[]
  score?: number
}

interface RecommendationCardProps {
  recommendation: Recommendation
  onVote?: (score: number) => void
}

// RecommendationCard component for displaying individual recommendations
export default function RecommendationCard({ 
  recommendation,
  onVote 
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [score, setScore] = useState(recommendation.score || 0)

  // Handle voting
  const handleVote = (value: number) => {
    setScore(value)
    onVote?.(value)
  }

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

          {/* Voting */}
          {onVote && (
            <div className="mt-6 flex items-center justify-end space-x-2">
              <button
                onClick={() => handleVote(1)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  score === 1 
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                    : 'text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleVote(-1)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  score === -1 
                    ? 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' 
                    : 'text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400'
                }`}
              >
                <ThumbsDown className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 