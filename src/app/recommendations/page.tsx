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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

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
          signal: controller.signal
        })

        if (!response.ok) {
          // Check for specific error responses
          try {
            const errorData = await response.json()
            throw new Error(errorData.error || `Failed to fetch recommendations: ${response.statusText}`)
          } catch (jsonError) {
            // If we can't parse the error response, use the status text
            if (response.status === 504) {
              throw new Error('The request took too long to process. Please try again with a simpler query.')
            }
            throw new Error(`Failed to fetch recommendations: ${response.statusText}`)
          }
        }

        let data;
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error('JSON Parse Error:', jsonError)
          throw new Error('Invalid response from server. Please try again.')
        }

        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid response format. Please try again.')
        }

        setRecommendations(data)
      } catch (err: unknown) {
        console.error('Fetch Error:', err)
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setError('The request took too long. Please try simplifying your query or try again later.')
          } else {
            setError(err.message)
          }
        } else {
          setError('An unexpected error occurred. Please try again.')
        }
      } finally {
        setIsLoading(false)
        clearTimeout(timeoutId)
      }
    }

    fetchRecommendations()

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [searchParams])

  return (
    <>
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-blue-600 dark:text-blue-400" />
          <p className="ml-3 text-neutral-600 dark:text-neutral-400">
            Analyzing your request... This may take a minute.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 text-center">
          <p className="font-medium mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/20 rounded-md hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
          >
            Try Again
          </button>
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