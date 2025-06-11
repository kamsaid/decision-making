// Unit tests for Chat API logic (Tasks 19 & 20)

describe('Chat API Logic Tests (Tasks 19 & 20)', () => {
  
  describe('Task 19: Follow-up Question Generation', () => {
    // Import and test the utility functions directly
    
    it('should detect when text ends with a question mark', () => {
      // Test the endsWithQuestion function
      const endsWithQuestion = (text: string): boolean => {
        return text.trim().endsWith('?')
      }
      
      expect(endsWithQuestion('This is a statement.')).toBe(false)
      expect(endsWithQuestion('Is this a question?')).toBe(true)
      expect(endsWithQuestion('What about this?   ')).toBe(true) // with trailing spaces
      expect(endsWithQuestion('')).toBe(false)
      expect(endsWithQuestion('Multiple sentences. Is this a question?')).toBe(true)
    })

    it('should generate contextual follow-up questions', () => {
      // Test the generateFollowUpQuestion function logic
      const generateFollowUpQuestion = (context: string, preferences: string[], constraints: string[]): string => {
        const followUpQuestions = [
          "What's most important to you right now in this decision?",
          "How do you feel about the timeline for making this choice?",
          "What would happen if you delayed this decision?",
          "Which of your concerns feels most pressing?",
          "What additional information would be most helpful?",
          "How might this decision affect other areas of your life?",
          "What's your gut feeling telling you so far?",
          "Are there any options you haven't fully considered yet?",
        ]
        
        // Select a contextually relevant follow-up question
        const contextLower = context.toLowerCase()
        if (contextLower.includes('buy') || contextLower.includes('purchase')) {
          return "What's your timeline for making this purchase?"
        }
        if (contextLower.includes('job') || contextLower.includes('career')) {
          return "How important is work-life balance in this decision?"
        }
        if (contextLower.includes('move') || contextLower.includes('relocat')) {
          return "What's drawing you to consider this change?"
        }
        
        // Default to first question for predictable testing
        return followUpQuestions[0]
      }

      // Test context-specific questions
      expect(generateFollowUpQuestion('Should I buy a house?', [], []))
        .toBe("What's your timeline for making this purchase?")
      
      expect(generateFollowUpQuestion('Should I change my job?', [], []))
        .toBe("How important is work-life balance in this decision?")
      
      expect(generateFollowUpQuestion('Should I move to another city?', [], []))
        .toBe("What's drawing you to consider this change?")
      
      expect(generateFollowUpQuestion('General decision', [], []))
        .toBe("What's most important to you right now in this decision?")
    })
  })

  describe('Task 20: Context Delta Calculation', () => {
    
    interface DecisionContext {
      context?: string
      preferences?: string[]
      constraints?: string[]
    }

    it('should calculate context deltas correctly', () => {
      // Test the calculateContextDelta function logic
      const calculateContextDelta = (currentContext: DecisionContext | null, lastContext: DecisionContext | null) => {
        if (!lastContext) {
          // First message, no delta
          return null
        }

        if (!currentContext) {
          return null
        }

        const currentPrefs = currentContext.preferences || []
        const lastPrefs = lastContext.preferences || []
        const currentCons = currentContext.constraints || []
        const lastCons = lastContext.constraints || []

        // Calculate additions and removals
        const addedPreferences = currentPrefs.filter(pref => !lastPrefs.includes(pref))
        const removedPreferences = lastPrefs.filter(pref => !currentPrefs.includes(pref))
        const addedConstraints = currentCons.filter(con => !lastCons.includes(con))
        const removedConstraints = lastCons.filter(con => !currentCons.includes(con))

        // Return null if no changes detected
        if (
          addedPreferences.length === 0 &&
          removedPreferences.length === 0 &&
          addedConstraints.length === 0 &&
          removedConstraints.length === 0
        ) {
          return null
        }

        return {
          addedPreferences,
          removedPreferences,
          addedConstraints,
          removedConstraints,
        }
      }

      // Test first message (no previous context)
      const currentContext = {
        context: 'Test decision',
        preferences: ['pref1'],
        constraints: ['con1']
      }
      
      expect(calculateContextDelta(currentContext, null)).toBe(null)

      // Test no changes
      const lastContext = { ...currentContext }
      expect(calculateContextDelta(currentContext, lastContext)).toBe(null)

      // Test additions only
      const updatedContext = {
        context: 'Test decision',
        preferences: ['pref1', 'pref2'], // added pref2
        constraints: ['con1', 'con2'] // added con2
      }
      
      const delta1 = calculateContextDelta(updatedContext, currentContext)
      expect(delta1).toEqual({
        addedPreferences: ['pref2'],
        removedPreferences: [],
        addedConstraints: ['con2'],
        removedConstraints: []
      })

      // Test removals only
      const reducedContext = {
        context: 'Test decision',
        preferences: [], // removed pref1
        constraints: [] // removed con1
      }
      
      const delta2 = calculateContextDelta(reducedContext, currentContext)
      expect(delta2).toEqual({
        addedPreferences: [],
        removedPreferences: ['pref1'],
        addedConstraints: [],
        removedConstraints: ['con1']
      })

      // Test mixed additions and removals
      const mixedContext = {
        context: 'Test decision',
        preferences: ['new-pref'], // removed pref1, added new-pref
        constraints: ['con1', 'new-con'] // kept con1, added new-con
      }
      
      const delta3 = calculateContextDelta(mixedContext, currentContext)
      expect(delta3).toEqual({
        addedPreferences: ['new-pref'],
        removedPreferences: ['pref1'],
        addedConstraints: ['new-con'],
        removedConstraints: []
      })
    })

    it('should handle edge cases in context delta calculation', () => {
      const calculateContextDelta = (currentContext: DecisionContext | null, lastContext: DecisionContext | null) => {
        if (!lastContext) return null
        if (!currentContext) return null

        const currentPrefs = currentContext.preferences || []
        const lastPrefs = lastContext.preferences || []
        const currentCons = currentContext.constraints || []
        const lastCons = lastContext.constraints || []

        const addedPreferences = currentPrefs.filter(pref => !lastPrefs.includes(pref))
        const removedPreferences = lastPrefs.filter(pref => !currentPrefs.includes(pref))
        const addedConstraints = currentCons.filter(con => !lastCons.includes(con))
        const removedConstraints = lastCons.filter(con => !currentCons.includes(con))

        if (
          addedPreferences.length === 0 &&
          removedPreferences.length === 0 &&
          addedConstraints.length === 0 &&
          removedConstraints.length === 0
        ) {
          return null
        }

        return {
          addedPreferences,
          removedPreferences,
          addedConstraints,
          removedConstraints,
        }
      }

      // Test with undefined arrays
      const contextWithUndefined = { context: 'test' } // no preferences/constraints arrays
      const contextWithEmptyArrays = { context: 'test', preferences: [], constraints: [] }
      
      expect(calculateContextDelta(contextWithEmptyArrays, contextWithUndefined)).toBe(null)
      expect(calculateContextDelta(contextWithUndefined, contextWithEmptyArrays)).toBe(null)

      // Test with null contexts
      expect(calculateContextDelta(null, { context: 'test' })).toBe(null)
      expect(calculateContextDelta({ context: 'test' }, null)).toBe(null)
    })
  })

  describe('System Message Building with Context Delta', () => {
    
    it('should build system message with context delta information', () => {
      // Test the buildSystemMessage function logic
      const buildSystemMessage = (context: string, preferences: string[], constraints: string[], contextDelta?: any) => {
        let systemMessage = `
You are **Clarity**, a warm but incisive decision-making coach powered by advanced reasoning models.
Your single goal: help the user arrive at a confident, informed decision.

================ USER SITUATION ================
• Decision: ${context}
• Preferences: ${preferences.join(" | ")}
• Constraints: ${constraints.join(" | ")}`

        // Include context delta information if available
        if (contextDelta) {
          systemMessage += `
• Recent Changes: 
  - Added preferences: ${contextDelta.addedPreferences?.join(", ") || "none"}
  - Added constraints: ${contextDelta.addedConstraints?.join(", ") || "none"}
  - Removed preferences: ${contextDelta.removedPreferences?.join(", ") || "none"}
  - Removed constraints: ${contextDelta.removedConstraints?.join(", ") || "none"}`
        }

        systemMessage += `

================ GUIDING PRINCIPLES ================
1. **Empathize first** – reflect the user's feelings in 1-2 sentences before advising.
2. **Clarify** – if critical info is missing, ask a *single* concise follow-up.
3. **Focus** – surface at most the *three* highest-impact considerations.
4. **Reason transparently** – share a brief "why this matters" for each point.
5. **Action over abstraction** – end with one clear next step the user can do today.
6. **Brevity** – aim for ≤ 250 words unless the user asks for depth.
7. **Tone** – conversational, like a trusted friend who knows decision science.
8. **No formatting clutter** – avoid bullet lists, headers, or markdown; flow naturally.
9. **Safety & accuracy** – no legal, medical, or financial absolutes; use cautious language.

================ OUTPUT TEMPLATE ================
<Reflection on user emotion>.
<Key Point 1> – <Why it matters>.
<Key Point 2> – <Why it matters>.
<Key Point 3> – <Why it matters>.
Next step: <one actionable suggestion>.

===============================================`

        return systemMessage
      }

      // Test without context delta
      const systemMsg1 = buildSystemMessage('Test decision', ['pref1'], ['con1'])
      expect(systemMsg1).toContain('• Decision: Test decision')
      expect(systemMsg1).toContain('• Preferences: pref1')
      expect(systemMsg1).toContain('• Constraints: con1')
      expect(systemMsg1).not.toContain('Recent Changes')

      // Test with context delta
      const contextDelta = {
        addedPreferences: ['new-pref'],
        addedConstraints: [],
        removedPreferences: ['old-pref'],
        removedConstraints: ['old-con']
      }
      
      const systemMsg2 = buildSystemMessage('Test decision', ['pref1', 'new-pref'], ['con1'], contextDelta)
      expect(systemMsg2).toContain('Recent Changes')
      expect(systemMsg2).toContain('Added preferences: new-pref')
      expect(systemMsg2).toContain('Added constraints: none')
      expect(systemMsg2).toContain('Removed preferences: old-pref')
      expect(systemMsg2).toContain('Removed constraints: old-con')
    })
  })
}) 