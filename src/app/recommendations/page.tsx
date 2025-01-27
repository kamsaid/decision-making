'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import RecommendationCard from '@/components/RecommendationCard'
import { Home } from 'lucide-react'

// Interface for recommendation data
interface Recommendation {
  id: string
  title: string
  description: string
  pros: string[]
  cons: string[]
}

// Content component that uses useSearchParams
function RecommendationsContent() {
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

  return (
    <>
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-blue-600 dark:text-blue-400" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 text-center">
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
            />
          ))}

          {recommendations.length === 0 && (
            <div className="text-center text-neutral-600 dark:text-neutral-400">
              No recommendations found. Please try adjusting your criteria.
            </div>
          )}
        </div>
      )}
    </>
  )
}

// Main page component with Suspense boundary
export default function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-black dark:to-neutral-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-white hover:text-white/80 transition-colors mb-8"
        >
          <Home className="h-5 w-5" />
          <span>Seek Help</span>
        </Link>

        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent blur-2xl" />
            <h1 className="relative text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 mb-4">
              Your Personalized Recommendations
            </h1>
          </div>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Based on your preferences and constraints, here are my suggestions.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-blue-600 dark:text-blue-400" />
          </div>
        }>
          <RecommendationsContent />
        </Suspense>
      </main>
    </div>
  )
} 