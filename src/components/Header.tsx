'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'

// Header component with navigation links
export default function Header() {
  return (
    <header className="bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and site title */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
          >
            <Home className="h-6 w-6" />
            <span className="font-semibold text-lg">SeekHelp</span>
          </Link>
        </div>
      </div>
    </header>
  )
} 