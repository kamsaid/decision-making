'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import RecommendationCard from '@/components/RecommendationCard'

// Interface for recommendation data
interface Recommendation {
  id: string
  title: string
  description: string
  pros: string[]
  cons: string[]
  score?: number
}

// Recommendations page component
export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Fetch recommendations on component mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const context = searchParams.get('context')
        const preferences = searchParams.getAll('preferences')
        const constraints = searchParams.getAll('constraints')

        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            context,
            preferences,
            constraints,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations')
        }

        const data = await response.json()
        setRecommendations(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [searchParams])

  // Handle voting on recommendations
  const handleVote = async (id: string, score: number) => {
    try {
      await fetch(`/api/recommendations/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score }),
      })

      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === id ? { ...rec, score } : rec
        )
      )
    } catch (err) {
      console.error('Failed to save vote:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Your Personalized Recommendations
        </h1>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Recommendations List */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onVote={(score) => handleVote(recommendation.id, score)}
              />
            ))}

            {recommendations.length === 0 && (
              <div className="text-center text-gray-600">
                No recommendations found. Please try adjusting your criteria.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
} 