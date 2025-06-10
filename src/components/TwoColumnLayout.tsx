'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

// Interface for the layout props
interface TwoColumnLayoutProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

// 2-column layout component with collapsible sidebar and persistent chat area
export default function TwoColumnLayout({ sidebar, children }: TwoColumnLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-bg-base dark:bg-bg-base-dark">
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

      {/* Main Content Area (Chat) */}
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

        {/* Chat Area */}
        <div
          data-testid="layout-chat-area"
          className="flex-1 p-6 overflow-hidden"
        >
          {children}
        </div>
      </div>
    </div>
  )
} 