'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import TwoColumnLayout from '@/components/TwoColumnLayout'
import SidebarDecisionForm from '@/components/SidebarDecisionForm'
import PersistentChat from '@/components/PersistentChat'

// Interface for decision context
interface DecisionContext {
  context?: string
  preferences?: string[]
  constraints?: string[]
}

// Interface for final recommendation
interface FinalRecommendation {
  summary: string
  reasoning: string
  keyPoints: string[]
}

// Home page component with 2-column layout
export default function Home() {
  const [decisionContext, setDecisionContext] = useState<DecisionContext | null>(null)
  const [initialRecommendation, setInitialRecommendation] = useState<FinalRecommendation | null>(null)

  // Handle context changes from the form
  const handleContextChange = (formData: DecisionContext | null) => {
    setDecisionContext(formData)
    // Clear initial recommendation when context changes
    if (!formData) {
      setInitialRecommendation(null)
    }
  }

  // Handle initial recommendation from the form
  const handleInitialRecommendation = (recommendation: FinalRecommendation) => {
    setInitialRecommendation(recommendation)
  }

  return (
    <div className="h-screen bg-bg-base dark:bg-bg-base-dark">
      <Header />
      
      <main className="h-[calc(100vh-80px)]">
        <TwoColumnLayout
          sidebar={
            <SidebarDecisionForm
              onContextChange={handleContextChange}
              onInitialRecommendation={handleInitialRecommendation}
            />
          }
        >
          <PersistentChat 
            decisionContext={decisionContext} 
            initialRecommendation={initialRecommendation}
            onDecisionContextChange={handleContextChange}
          />
        </TwoColumnLayout>
      </main>
    </div>
  )
}
