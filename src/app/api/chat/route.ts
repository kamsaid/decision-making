import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

// Helper function to create OpenAI client - called inside request handler
function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  
  return new OpenAI({
    apiKey,
  })
}

const RequestSchema = z.object({
  message: z.string(),
  context: z.string(),
  preferences: z.array(z.string()),
  constraints: z.array(z.string()),
  previousMessages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  // Task 20: Support context delta tracking
  contextDelta: z.object({
    addedPreferences: z.array(z.string()),
    addedConstraints: z.array(z.string()),
    removedPreferences: z.array(z.string()),
    removedConstraints: z.array(z.string()),
  }).nullable().optional(),
})

/**
 * Task 19: Generate contextual follow-up questions based on decision context
 */
function generateFollowUpQuestion(context: string, preferences: string[], constraints: string[]): string {
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
  
  // Default to a random relevant question
  return followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)]
}

/**
 * Task 19: Check if content already ends with a question
 */
function endsWithQuestion(text: string): boolean {
  return text.trim().endsWith('?')
}

/**
 * Returns the system-level instructions for the decision-assistant LLM.
 * Inject this into the first message of every new chat.
 * Task 20: Enhanced to handle context deltas for more efficient processing
 */
function buildSystemMessage(context: string, preferences: string[], constraints: string[], contextDelta?: any) {
  let systemMessage = `
You are **Clarity**, a warm but incisive decision-making coach powered by advanced reasoning models.
Your single goal: help the user arrive at a confident, informed decision.

================ USER SITUATION ================
• Decision: ${context}
• Preferences: ${preferences.join(" | ")}
• Constraints: ${constraints.join(" | ")}`

  // Task 20: Include context delta information if available
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

  return systemMessage;
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, context, preferences, constraints, previousMessages, contextDelta } = RequestSchema.parse(body)

    // Create OpenAI client inside request handler to avoid build-time errors
    let openai: OpenAI
    try {
      openai = createOpenAIClient()
    } catch (error) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const systemMessage = buildSystemMessage(context, preferences, constraints, contextDelta)
    const relevantMessages = previousMessages.slice(-3) // Keep last 3 messages for tighter context

    const messages = [
      { role: 'system', content: systemMessage },
      ...relevantMessages,
      { role: 'user', content: message }
    ]

    // Use OpenAI's GPT-4 model for streaming chat completions
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as any[],
      temperature: 0.7,
      max_tokens: 400, // Limiting token length to encourage conciseness
      stream: true, // Enable streaming for progressive response display
    })

    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let accumulatedContent = '' // Task 19: Track full response to check for follow-up question injection
        
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              accumulatedContent += content
              // Send each chunk as a server-sent event format
              const data = `data: ${JSON.stringify({ content })}\n\n`
              controller.enqueue(encoder.encode(data))
            }
          }
          
          // Task 19: Inject follow-up question if response doesn't end with one
          if (accumulatedContent.trim() && !endsWithQuestion(accumulatedContent)) {
            const followUpQuestion = generateFollowUpQuestion(context, preferences, constraints)
            const followUpContent = ` ${followUpQuestion}`
            const followUpData = `data: ${JSON.stringify({ content: followUpContent })}\n\n`
            controller.enqueue(encoder.encode(followUpData))
          }
          
          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (error) {
          console.error('Streaming error:', error)
          const errorData = `data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`
          controller.enqueue(encoder.encode(errorData))
        } finally {
          controller.close()
        }
      }
    })

    // Return the streaming response with appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `AI service error: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
