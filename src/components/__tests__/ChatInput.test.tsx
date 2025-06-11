import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock lucide-react icons to prevent ESM transform issues
jest.mock('lucide-react', () => ({
  Send: () => <div data-testid="send-icon" />,
  Smile: () => <div data-testid="smile-icon" />,
}))

import { ChatInput } from '@/components/ui/chat-input'

describe('ChatInput', () => {
  const mockOnSendMessage = jest.fn()
  const mockOnSlashCommand = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic functionality', () => {
    it('renders with placeholder text', () => {
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          placeholder="Type your message..."
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('placeholder', 'Type your message...')
    })

    it('sends message on form submit', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput onSendMessage={mockOnSendMessage} />
      )

      const textarea = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send/i })

      await user.type(textarea, 'Hello world')
      await user.click(sendButton)

      expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world')
    })

    it('sends message on Enter key press', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput onSendMessage={mockOnSendMessage} />
      )

      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'Hello world')
      await user.keyboard('{Enter}')

      expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world')
    })

    it('allows multiline with Shift+Enter', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput onSendMessage={mockOnSendMessage} />
      )

      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'Line 1')
      await user.keyboard('{Shift>}{Enter}{/Shift}')
      await user.type(textarea, 'Line 2')

      expect(textarea.value).toBe('Line 1\nLine 2')
      expect(mockOnSendMessage).not.toHaveBeenCalled()
    })

    it('clears input after sending message', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput onSendMessage={mockOnSendMessage} />
      )

      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'Test message')
      await user.keyboard('{Enter}')

      expect(textarea.value).toBe('')
    })

    it('disables input when disabled prop is true', () => {
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          disabled={true}
        />
      )

      const textarea = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send/i })
      const emojiButton = screen.getByTestId('emoji-button')

      expect(textarea).toBeDisabled()
      expect(sendButton).toBeDisabled()
      expect(emojiButton).toBeDisabled()
    })
  })

  describe('Slash Command functionality', () => {
    it('detects and handles /pref command', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          onSlashCommand={mockOnSlashCommand}
        />
      )

      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, '/pref health')
      await user.keyboard('{Enter}')

      expect(mockOnSlashCommand).toHaveBeenCalledWith('pref', 'health')
      expect(mockOnSendMessage).not.toHaveBeenCalled()
    })

    it('detects and handles /con command', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          onSlashCommand={mockOnSlashCommand}
        />
      )

      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, '/con budget under $500')
      await user.keyboard('{Enter}')

      expect(mockOnSlashCommand).toHaveBeenCalledWith('con', 'budget under $500')
      expect(mockOnSendMessage).not.toHaveBeenCalled()
    })

    it('detects and handles /reset command', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          onSlashCommand={mockOnSlashCommand}
        />
      )

      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, '/reset')
      await user.keyboard('{Enter}')

      expect(mockOnSlashCommand).toHaveBeenCalledWith('reset', '')
      expect(mockOnSendMessage).not.toHaveBeenCalled()
    })

    it('handles slash command with no arguments', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          onSlashCommand={mockOnSlashCommand}
        />
      )

      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, '/pref')
      await user.keyboard('{Enter}')

      expect(mockOnSlashCommand).toHaveBeenCalledWith('pref', '')
      expect(mockOnSendMessage).not.toHaveBeenCalled()
    })

    it('treats unknown slash commands as regular messages', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          onSlashCommand={mockOnSlashCommand}
        />
      )

      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, '/unknown command')
      await user.keyboard('{Enter}')

      expect(mockOnSlashCommand).not.toHaveBeenCalled()
      expect(mockOnSendMessage).toHaveBeenCalledWith('/unknown command')
    })

    it('treats slash in middle of message as regular message', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          onSlashCommand={mockOnSlashCommand}
        />
      )

      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'This is /not a command')
      await user.keyboard('{Enter}')

      expect(mockOnSlashCommand).not.toHaveBeenCalled()
      expect(mockOnSendMessage).toHaveBeenCalledWith('This is /not a command')
    })

    it('handles slash commands when onSlashCommand is not provided', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput onSendMessage={mockOnSendMessage} />
      )

      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, '/pref health')
      await user.keyboard('{Enter}')

      // Should fall back to sending as regular message when no slash command handler
      expect(mockOnSendMessage).toHaveBeenCalledWith('/pref health')
    })

    it('shows help message for /help command', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          onSlashCommand={mockOnSlashCommand}
        />
      )

      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, '/help')
      await user.keyboard('{Enter}')

      expect(mockOnSlashCommand).toHaveBeenCalledWith('help', '')
    })
  })

  describe('Autosize functionality', () => {
    it('adjusts textarea height based on content', async () => {
      const user = userEvent.setup()
      
      render(<ChatInput onSendMessage={mockOnSendMessage} />)

      const textarea = screen.getByRole('textbox')
      
      // Test that the autosize functionality is set up correctly
      expect(textarea).toHaveAttribute('data-autosize', 'true')
      expect(textarea.style.minHeight).toBe('40px')
      expect(textarea.style.maxHeight).toBe('120px')

      // The actual autosize behavior depends on browser rendering which is hard to test
      // So we just verify the setup is correct
    })
  })
}) 