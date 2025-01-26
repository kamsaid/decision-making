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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Card Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {recommendation.title}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 text-gray-400 hover:text-gray-500"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <p className="mt-2 text-gray-600">
          {recommendation.description}
        </p>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Pros */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Pros</h4>
              <ul className="space-y-2">
                {recommendation.pros.map((pro, index) => (
                  <li 
                    key={index}
                    className="flex items-start"
                  >
                    <span className="text-green-500 mr-2">+</span>
                    <span className="text-gray-600">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Cons</h4>
              <ul className="space-y-2">
                {recommendation.cons.map((con, index) => (
                  <li 
                    key={index}
                    className="flex items-start"
                  >
                    <span className="text-red-500 mr-2">-</span>
                    <span className="text-gray-600">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Voting */}
          {onVote && (
            <div className="mt-4 flex items-center justify-end space-x-2">
              <button
                onClick={() => handleVote(1)}
                className={`p-2 rounded-full ${
                  score === 1 
                    ? 'bg-green-100 text-green-600' 
                    : 'text-gray-400 hover:text-green-600'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleVote(-1)}
                className={`p-2 rounded-full ${
                  score === -1 
                    ? 'bg-red-100 text-red-600' 
                    : 'text-gray-400 hover:text-red-600'
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