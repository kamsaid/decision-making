import { render, screen } from '@testing-library/react'
import React from 'react'

// lucide-react uses ES modules which jest struggles with in a CJS context.
// Mocking it prevents transform errors while still exercising our component logic.
jest.mock('lucide-react', () => ({ 
  Send: () => null,
  ThumbsUp: () => null,
  ThumbsDown: () => null,
  User: () => null,
  Bot: () => null,
}))

// Mock the DecisionSnapshot component
jest.mock('@/components/DecisionSnapshot', () => ({
  __esModule: true,
  default: function DecisionSnapshot({ decisionContext, onEditClick }: any) {
    if (!decisionContext?.context) return null
    return (
      <div data-testid="decision-snapshot">
        <div>{decisionContext.context}</div>
        {decisionContext.preferences?.map((pref: string, i: number) => (
          <span key={i}>{pref}</span>
        ))}
        {decisionContext.constraints?.map((con: string, i: number) => (
          <span key={i}>{con}</span>
        ))}
        {onEditClick && <button onClick={onEditClick}>Edit</button>}
      </div>
    )
  }
}))

// Framer-motion is ESM-only and includes complex animation logic we don't need
// in unit tests.  We replace it with a minimal stub that renders plain <div>
// elements while still forwarding all received props so that the DOM tree
// mirrors the production output closely enough for assertions.
jest.mock('framer-motion', () => {
  return {
    //  Simple passthrough component for every HTML tag we require.  Add more
    //  as needed when the codebase grows.
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

// Mock the new ChatInput component to focus on testing Chat component logic
jest.mock('@/components/ui/chat-input', () => ({
  ChatInput: function ChatInput({ onSendMessage, placeholder, disabled }: any) {
    return (
      <div data-testid="chat-input">
        <input 
          placeholder={placeholder} 
          disabled={disabled}
          data-testid="chat-input-field"
        />
        <button 
          onClick={() => onSendMessage('test message')}
          disabled={disabled}
          data-testid="chat-send-button"
        >
          Send
        </button>
      </div>
    )
  }
}))

import { Chat } from '@/components/ui/chat'

/*
 * Chat message bubbles should use the new Tailwind design tokens added in
 * Phase 1.  In particular:
 *  • user messages must have the `bg-primary-brand` background
 *  • assistant messages must have the `bg-surface-glass/65` background and
 *    apply a backdrop-blur utility class.
 *
 * These assertions failed before the refactor performed in task 5 because the
 * component still relied on the old neutral colours.
 */

describe('Chat message bubble styling', () => {
  const messages = [
    { role: 'user' as const, content: 'Hello there!' },
    { role: 'assistant' as const, content: 'General Kenobi.' },
  ]

  const noop = async () => {}

  it('applies the new colour tokens to message bubbles', () => {
    render(
      <Chat
        decisionContext="test"
        messages={messages}
        onSendMessage={noop}
        isLoading={false}
      />,
    )

    // With the new ChatBubble component, we need to find the bubble containers
    // by their test IDs rather than navigating from text content
    const chatBubbles = screen.getAllByTestId('chat-bubble')
    
    // First bubble should be user message with primary brand background
    const userBubble = chatBubbles[0]
    expect(userBubble.className).toMatch(/bg-primary-brand/)
    expect(userBubble.textContent).toBe('Hello there!')

    // Second bubble should be assistant message with glass surface background
    const assistantBubble = chatBubbles[1]
    expect(assistantBubble.className).toMatch(/bg-surface-glass\/65/)
    expect(assistantBubble.className).toMatch(/backdrop-blur-sm/)
    expect(assistantBubble.textContent).toBe('General Kenobi.')
  })

  it('renders the new ChatInput component', () => {
    render(
      <Chat
        decisionContext="test"
        messages={messages}
        onSendMessage={noop}
        isLoading={false}
      />,
    )

    // Verify that the new ChatInput component is rendered
    const chatInput = screen.getByTestId('chat-input')
    expect(chatInput).toBeInTheDocument()
    
    // Verify it receives the correct props
    const inputField = screen.getByTestId('chat-input-field')
    expect(inputField).toHaveAttribute('placeholder', 'Ask a follow-up question...')
    expect(inputField).not.toBeDisabled()
  })

  it('disables ChatInput when typing', () => {
    render(
      <Chat
        decisionContext="test"
        messages={messages}
        onSendMessage={noop}
        isTyping={true}
      />,
    )

    const inputField = screen.getByTestId('chat-input-field')
    const sendButton = screen.getByTestId('chat-send-button')
    
    expect(inputField).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })
})
