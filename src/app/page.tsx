import Header from '@/components/Header'
import DecisionForm from '@/components/DecisionForm'

// Home page component
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-black dark:to-neutral-900">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent blur-2xl" />
            <h1 className="relative text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 mb-4">
              Make Better Decisions
            </h1>
          </div>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Our AI-powered assistant helps you analyze your options and make informed choices 
            based on your preferences and constraints.
          </p>
        </div>

        {/* Decision Form */}
        <div className="mt-16">
          <DecisionForm />
        </div>
      </main>
    </div>
  )
}
