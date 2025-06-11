import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DecisionSnapshot from '@/components/DecisionSnapshot'

describe('DecisionSnapshot', () => {
  const mockDecisionContext = {
    context: 'Should I buy a new laptop or upgrade my current one?',
    preferences: ['Budget-friendly', 'Good performance', 'Portable'],
    constraints: ['Under $1500', 'Need it within 2 weeks']
  }

  const mockOnEditClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when no decision context is provided', () => {
    const { container } = render(<DecisionSnapshot decisionContext={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when context is empty', () => {
    const { container } = render(
      <DecisionSnapshot decisionContext={{ context: '' }} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders decision context correctly', () => {
    render(
      <DecisionSnapshot 
        decisionContext={mockDecisionContext} 
        onEditClick={mockOnEditClick}
      />
    )

    // Check if the decision context is displayed
    expect(screen.getByText('Your Decision')).toBeInTheDocument()
    expect(screen.getByText(mockDecisionContext.context)).toBeInTheDocument()
  })

  it('renders preferences correctly', () => {
    render(
      <DecisionSnapshot 
        decisionContext={mockDecisionContext} 
        onEditClick={mockOnEditClick}
      />
    )

    // Check if preferences are displayed
    expect(screen.getByText('Preferences')).toBeInTheDocument()
    mockDecisionContext.preferences.forEach(pref => {
      expect(screen.getByText(pref)).toBeInTheDocument()
    })
  })

  it('renders constraints correctly', () => {
    render(
      <DecisionSnapshot 
        decisionContext={mockDecisionContext} 
        onEditClick={mockOnEditClick}
      />
    )

    // Check if constraints are displayed
    expect(screen.getByText('Constraints')).toBeInTheDocument()
    mockDecisionContext.constraints.forEach(constraint => {
      expect(screen.getByText(constraint)).toBeInTheDocument()
    })
  })

  it('shows edit button when onEditClick is provided', () => {
    render(
      <DecisionSnapshot 
        decisionContext={mockDecisionContext} 
        onEditClick={mockOnEditClick}
      />
    )

    const editButton = screen.getByTestId('edit-decision-button')
    expect(editButton).toBeInTheDocument()
    expect(editButton).toHaveAttribute('aria-label', 'Edit decision context')
  })

  it('hides edit button when onEditClick is not provided', () => {
    render(
      <DecisionSnapshot 
        decisionContext={mockDecisionContext} 
      />
    )

    expect(screen.queryByTestId('edit-decision-button')).not.toBeInTheDocument()
  })

  it('calls onEditClick when edit button is clicked', () => {
    render(
      <DecisionSnapshot 
        decisionContext={mockDecisionContext} 
        onEditClick={mockOnEditClick}
      />
    )

    const editButton = screen.getByTestId('edit-decision-button')
    fireEvent.click(editButton)
    
    expect(mockOnEditClick).toHaveBeenCalledTimes(1)
  })

  it('renders with only context (no preferences or constraints)', () => {
    const contextOnly = {
      context: 'Should I change careers?'
    }

    render(
      <DecisionSnapshot 
        decisionContext={contextOnly} 
        onEditClick={mockOnEditClick}
      />
    )

    expect(screen.getByText(contextOnly.context)).toBeInTheDocument()
    expect(screen.queryByText('Preferences')).not.toBeInTheDocument()
    expect(screen.queryByText('Constraints')).not.toBeInTheDocument()
  })

  it('applies sticky positioning classes', () => {
    render(
      <DecisionSnapshot 
        decisionContext={mockDecisionContext} 
        onEditClick={mockOnEditClick}
      />
    )

    const snapshotElement = screen.getByTestId('decision-snapshot')
    expect(snapshotElement).toHaveClass('sticky', 'top-0', 'z-10')
  })

  it('shows AI awareness message', () => {
    render(
      <DecisionSnapshot 
        decisionContext={mockDecisionContext} 
        onEditClick={mockOnEditClick}
      />
    )

    expect(screen.getByText('AI is aware of this context and will tailor responses accordingly')).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const customClass = 'custom-test-class'
    render(
      <DecisionSnapshot 
        decisionContext={mockDecisionContext} 
        onEditClick={mockOnEditClick}
        className={customClass}
      />
    )

    const snapshotElement = screen.getByTestId('decision-snapshot')
    expect(snapshotElement).toHaveClass(customClass)
  })
}) 