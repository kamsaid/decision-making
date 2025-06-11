import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import SidebarDecisionForm from '@/components/SidebarDecisionForm'

// Mock the API calls
global.fetch = jest.fn()

// Mock framer-motion for tests
jest.mock('framer-motion', () => {
  return {
    motion: {
      div: React.forwardRef<HTMLDivElement, any>(function MotionDiv(props: any, ref) {
        return React.createElement('div', { ...props, ref })
      }),
    },
    AnimatePresence: function AnimatePresence({ children }: { children: React.ReactNode }) {
      return <>{children}</>
    },
  }
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Send: () => <div data-testid="send-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Minus: () => <div data-testid="minus-icon" />,
  MessageCircle: () => <div data-testid="message-circle-icon" />,
}))

// Mock the UI components
jest.mock('@/components/ui/accordion', () => ({
  Accordion: function Accordion({ children, ...props }: any) {
    return <div data-testid="accordion" {...props}>{children}</div>
  },
  AccordionContent: function AccordionContent({ children, ...props }: any) {
    return <div data-testid="accordion-content" {...props}>{children}</div>
  },
  AccordionItem: function AccordionItem({ children, ...props }: any) {
    return <div data-testid="accordion-item" {...props}>{children}</div>
  },
  AccordionTrigger: function AccordionTrigger({ children, ...props }: any) {
    return <button data-testid="accordion-trigger" {...props}>{children}</button>
  },
}))

jest.mock('@/components/ui/input', () => ({
  Input: function Input(props: any) {
    return <input data-testid="input" {...props} />
  },
}))

jest.mock('@/components/ui/label', () => ({
  Label: function Label({ children, ...props }: any) {
    return <label data-testid="label" {...props}>{children}</label>
  },
}))

// Mock decision form UI
jest.mock('@/components/ui/decision-form', () => ({
  DecisionFormUI: function DecisionFormUI({ onSubmit, isLoading, error, ...props }: any) {
    return (
      <div data-testid="decision-form-ui" {...props}>
        <form onSubmit={(e) => {
          e.preventDefault()
          onSubmit({
            context: 'Should I move to New York?',
            preferences: ['Good career opportunities'],
            constraints: ['Limited budget']
          })
        }}>
          <input placeholder="e.g., moving to a new city, changing careers, buying a house" data-testid="context-input" />
          <input placeholder="e.g., work-life balance, growth opportunities, financial stability" data-testid="preferences-input" />
          <input placeholder="e.g., budget, timeline, family commitments" data-testid="constraints-input" />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Get Recommendations'}
          </button>
          {error && <div data-testid="error-message">{error}</div>}
        </form>
      </div>
    )
  },
}))

describe('SidebarDecisionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Test that when the form is submitted successfully, the component should pass
   * both the context and the initial recommendation to the parent through a callback.
   * This test should fail before the implementation because currently the component
   * doesn't pass the initial recommendation back to the parent.
   */
  it('should pass initial recommendation to parent after form submission', async () => {
    // Mock successful API response
    const mockRecommendationResponse = {
      analysis: {
        analysis: 'This is a complex decision requiring careful consideration.',
        tasks: [
          { type: 'preference_analysis', description: 'Analyze user preferences' },
          { type: 'constraint_validation', description: 'Validate constraints' }
        ]
      },
      finalRecommendation: {
        summary: 'Based on your preferences, I recommend option A.',
        reasoning: 'This option aligns best with your stated preferences and constraints.',
        keyPoints: ['Key point 1', 'Key point 2']
      }
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecommendationResponse,
    })

    // Mock callbacks
    const mockOnContextChange = jest.fn()
    const mockOnInitialRecommendation = jest.fn()

    render(
      <SidebarDecisionForm 
        onContextChange={mockOnContextChange}
        onInitialRecommendation={mockOnInitialRecommendation}
      />
    )

    // Submit the form (our mock form will automatically submit with predefined data)
    const submitButton = screen.getByText(/Get Recommendations/i)
    fireEvent.click(submitButton)

    // Wait for the API call to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/recommendations', expect.any(Object))
    })

    // Check that the context change was called
    expect(mockOnContextChange).toHaveBeenCalledWith({
      context: 'Should I move to New York?',
      preferences: ['Good career opportunities'],
      constraints: ['Limited budget']
    })

    // The key assertion: the initial recommendation should be passed to parent
    // This should initially fail because the component doesn't have onInitialRecommendation callback yet
    await waitFor(() => {
      expect(mockOnInitialRecommendation).toHaveBeenCalledWith({
        summary: 'Based on your preferences, I recommend option A.',
        reasoning: 'This option aligns best with your stated preferences and constraints.',
        keyPoints: ['Key point 1', 'Key point 2']
      })
    })

    // Verify the ready for chat indicator appears
    expect(screen.getByText(/Ready for Chat/i)).toBeInTheDocument()
  })

  it('should handle form submission errors gracefully', async () => {
    // Mock API error
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API Error' }),
    })

    render(<SidebarDecisionForm />)

    // Submit the form
    const submitButton = screen.getByText(/Get Recommendations/i)
    fireEvent.click(submitButton)

    // Wait for the error to appear
    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument()
    })

    // No ready for chat indicator should appear when there's an error
    expect(screen.queryByText(/Ready for Chat/i)).not.toBeInTheDocument()
  })
}) 