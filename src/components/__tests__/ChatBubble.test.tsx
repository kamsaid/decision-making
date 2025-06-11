import { render, screen } from '@testing-library/react'

// Mock lucide-react for Jest compatibility
jest.mock('lucide-react', () => ({ User: () => null, Bot: () => null }))

import { ChatBubble } from '@/components/ui/chat-bubble'

describe('ChatBubble Component', () => {
  it('renders user message with proper styling and alignment', () => {
    render(
      <ChatBubble 
        role="user" 
        content="Hello, how are you?" 
      />
    )

    // Find the message content
    const messageText = screen.getByText('Hello, how are you?')
    expect(messageText).toBeInTheDocument()

    // Find the bubble container (parent of message text)
    const bubbleContainer = messageText.closest('[data-testid="chat-bubble"]')
    expect(bubbleContainer).toBeInTheDocument()
    
    // User messages should have primary brand background
    expect(bubbleContainer).toHaveClass('bg-primary-brand')
    expect(bubbleContainer).toHaveClass('text-white')
    
    // Find the row container (for alignment)
    const rowContainer = bubbleContainer?.closest('[data-testid="chat-bubble-row"]')
    expect(rowContainer).toBeInTheDocument()
    expect(rowContainer).toHaveClass('justify-end') // User messages align right
  })

  it('renders assistant message with proper styling and alignment', () => {
    render(
      <ChatBubble 
        role="assistant" 
        content="I'm doing well, thank you for asking!" 
      />
    )

    // Find the message content
    const messageText = screen.getByText("I'm doing well, thank you for asking!")
    expect(messageText).toBeInTheDocument()

    // Find the bubble container (parent of message text)
    const bubbleContainer = messageText.closest('[data-testid="chat-bubble"]')
    expect(bubbleContainer).toBeInTheDocument()
    
    // Assistant messages should have glass surface background with backdrop blur
    expect(bubbleContainer).toHaveClass('bg-surface-glass/65')
    expect(bubbleContainer).toHaveClass('backdrop-blur-sm')
    expect(bubbleContainer).toHaveClass('text-text-primary')
    
    // Find the row container (for alignment)
    const rowContainer = bubbleContainer?.closest('[data-testid="chat-bubble-row"]')
    expect(rowContainer).toBeInTheDocument()
    expect(rowContainer).toHaveClass('justify-start') // Assistant messages align left
  })

  it('applies consistent bubble styling (rounded corners, shadows, borders)', () => {
    render(
      <ChatBubble 
        role="user" 
        content="Test message" 
      />
    )

    const bubbleContainer = screen.getByTestId('chat-bubble')
    
    // Common bubble styling should be applied
    expect(bubbleContainer).toHaveClass('rounded-xl')
    expect(bubbleContainer).toHaveClass('px-4')
    expect(bubbleContainer).toHaveClass('py-2') 
    expect(bubbleContainer).toHaveClass('shadow-md')
    expect(bubbleContainer).toHaveClass('border')
    expect(bubbleContainer).toHaveClass('border-border-subtle')
    
    // The max-w class is now on the flex container, not the bubble
    const flexContainer = bubbleContainer.parentElement
    expect(flexContainer).toHaveClass('max-w-[80%]')
  })

  it('preserves whitespace in message content', () => {
    const multilineMessage = "Line 1\nLine 2\n\nLine 4"
    render(
      <ChatBubble 
        role="assistant" 
        content={multilineMessage} 
      />
    )

    // Find the paragraph element specifically to check whitespace preservation
    const bubbleContainer = screen.getByTestId('chat-bubble')
    const messageText = bubbleContainer.querySelector('p')
    
    expect(messageText).toBeInTheDocument()
    expect(messageText).toHaveClass('whitespace-pre-wrap')
    expect(messageText?.textContent).toBe(multilineMessage)
  })

  it('handles empty content gracefully', () => {
    render(
      <ChatBubble 
        role="user" 
        content="" 
      />
    )

    const bubbleContainer = screen.getByTestId('chat-bubble')
    expect(bubbleContainer).toBeInTheDocument()
  })
}) 