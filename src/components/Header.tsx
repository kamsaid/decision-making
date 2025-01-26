'use client'

import Link from 'next/link'
import { Home, HelpCircle } from 'lucide-react'

// Header component with navigation links
export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and site title */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-gray-900 hover:text-gray-600"
          >
            <Home className="h-6 w-6" />
            <span className="font-semibold text-lg">Decision Assistant</span>
          </Link>

          {/* Navigation links */}
          <nav className="flex items-center space-x-4">
            <Link 
              href="/about" 
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <HelpCircle className="h-5 w-5" />
              <span>About</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
} 