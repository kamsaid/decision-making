import Header from '@/components/Header'
import DecisionForm from '@/components/DecisionForm'

// Home page component
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Seek Help
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our AI-powered assistant helps you analyze your options and make informed choices 
            based on your preferences and constraints.
          </p>
        </div>

        {/* Decision Form */}
        <div className="max-w-2xl mx-auto">
          <DecisionForm />
        </div>
      </main>
    </div>
  )
}
