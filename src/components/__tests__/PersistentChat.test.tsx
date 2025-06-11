import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import PersistentChat from '@/components/PersistentChat'

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
  MessageCircle: () => <div data-testid="message-circle-icon" />,
}))

// Mock the Chat component
jest.mock('@/components/ui/chat', () => ({
  Chat: function Chat({ messages, onSendMessage, ...props }: any) {
    return (
      <div data-testid="chat-component" {...props}>
        <div data-testid="chat-messages">
          {messages.map((message: any, index: number) => (
            <div key={index} data-testid="chat-message-row" className={message.role === 'user' ? 'justify-end' : 'justify-start'}>
              <div>{message.content}</div>
            </div>
          ))}
        </div>
        <button onClick={() => onSendMessage('test message')}>Send Test Message</button>
      </div>
    )
  },
}))

describe('PersistentChat', () => {
  const mockDecisionContext = {
    context: 'Should I move to New York?',
    preferences: ['Good career opportunities'],
    constraints: ['Limited budget']
  }

  /**
   * Test that when an initial recommendation is provided, it appears as the first
   * message in the chat automatically. This test should initially fail because
   * the component doesn't handle initial recommendations yet.
   */
  it('should display initial recommendation as first assistant message', () => {
    const initialRecommendation = {
      summary: 'Based on your preferences, I recommend option A.',
      reasoning: 'This option aligns best with your stated preferences and constraints.',
      keyPoints: ['Key point 1', 'Key point 2']
    }

    render(
      <PersistentChat 
        decisionContext={mockDecisionContext}
        initialRecommendation={initialRecommendation}
      />
    )

    // Check that parts of the initial recommendation appear in the message
    expect(screen.getByText(/Based on your preferences, I recommend option A/i)).toBeInTheDocument()
    expect(screen.getByText(/This option aligns best with your stated preferences/i)).toBeInTheDocument()
    expect(screen.getByText(/Key point 1/i)).toBeInTheDocument()
    expect(screen.getByText(/Key point 2/i)).toBeInTheDocument()
    
    // Verify it's displayed as an assistant message (left-aligned)
    const assistantMessage = screen.getByTestId('chat-message-row')
    expect(assistantMessage).toHaveClass('justify-start')
  })

  it('should not display initial recommendation when none is provided', () => {
    render(<PersistentChat decisionContext={null} />)

    // Should show the empty state message instead
    expect(screen.getByText(/Complete the form to start getting personalized advice/i)).toBeInTheDocument()
    
    // Should not have any messages in chat
    const messages = screen.queryAllByTestId('chat-message-row')
    expect(messages).toHaveLength(0)
  })

  it('should clear initial recommendation when decision context changes', () => {
    const initialRecommendation = {
      summary: 'Based on your preferences, I recommend option A.',
      reasoning: 'This option aligns best with your stated preferences and constraints.',
      keyPoints: ['Key point 1', 'Key point 2']
    }

    const { rerender } = render(
      <PersistentChat 
        decisionContext={mockDecisionContext}
        initialRecommendation={initialRecommendation}
      />
    )

    // Initial recommendation should be present
    expect(screen.getByText(/Based on your preferences, I recommend option A/i)).toBeInTheDocument()

    // Change the decision context to null (form cleared)
    rerender(<PersistentChat decisionContext={null} />)

    // The initial recommendation should be cleared
    expect(screen.queryByText(/Based on your preferences, I recommend option A/i)).not.toBeInTheDocument()
    
    // Should not have any messages in chat
    const messages = screen.queryAllByTestId('chat-message-row')
    expect(messages).toHaveLength(0)
  })
}) 