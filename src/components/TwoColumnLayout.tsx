'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ChevronRight } from 'lucide-react'

// Interface for the layout props
interface TwoColumnLayoutProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  isOpen?: boolean // Optional prop to control sidebar from parent
  onToggle?: (isOpen: boolean) => void // Optional callback when sidebar is toggled
}

// 2-column layout component with collapsible sidebar and persistent chat area
export default function TwoColumnLayout({ 
  sidebar, 
  children, 
  isOpen, 
  onToggle 
}: TwoColumnLayoutProps) {
  // Use prop value if provided, otherwise manage state internally
  const [isSidebarOpen, setIsSidebarOpen] = useState(isOpen ?? true)

  // Sync internal state with external prop when it changes
  useEffect(() => {
    if (isOpen !== undefined) {
      setIsSidebarOpen(isOpen)
    }
  }, [isOpen])

  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    const newState = !isSidebarOpen
    setIsSidebarOpen(newState)
    // Call parent callback if provided
    onToggle?.(newState)
  }

  return (
    <div className="flex h-screen bg-bg-base dark:bg-bg-base-dark relative">
      {/* Sidebar */}
      <div
        data-testid="layout-sidebar"
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-96' : 'w-0'
        } overflow-hidden flex-shrink-0`}
      >
        <div className="w-96 h-full border-r border-neutral-200 dark:border-neutral-800 bg-bg-base/50 dark:bg-bg-base-dark/50 backdrop-blur-md">
          <div className="p-6 h-full overflow-y-auto">
            {sidebar}
          </div>
        </div>
      </div>

      {/* Floating chevron button when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          data-testid="sidebar-toggle-chevron"
          onClick={handleToggleSidebar}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-r-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shadow-md"
          aria-label="Open sidebar"
        >
          <ChevronRight className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        </button>
      )}

      {/* Main Content Area (Chat) - Now takes full width when sidebar is closed */}
      <div className="flex-1 flex flex-col">
        {/* Header with toggle button */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 p-4 bg-bg-base/80 dark:bg-bg-base-dark/80 backdrop-blur-md">
          <button
            data-testid="sidebar-toggle"
            onClick={handleToggleSidebar}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            ) : (
              <Menu className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            )}
          </button>
        </div>

        {/* Chat Area - Expands to full width and height */}
        <div
          data-testid="layout-chat-area"
          className="flex-1 overflow-hidden"
        >
          {/* Full width/height container when sidebar is closed */}
          <div className={`h-full ${isSidebarOpen ? 'p-6' : 'px-4 py-6 md:px-8'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 