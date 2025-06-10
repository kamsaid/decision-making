import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

// Initialize OpenAI client with official OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const RequestSchema = z.object({
  message: z.string(),
  context: z.string(),
  preferences: z.array(z.string()),
  constraints: z.array(z.string()),
  previousMessages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
})

/**
 * Returns the system-level instructions for the decision-assistant LLM.
 * Inject this into the first message of every new chat.
 */
function buildSystemMessage(context: string, preferences: string[], constraints: string[]) {
  return `
You are **Clarity**, a warm but incisive decision-making coach powered by advanced reasoning models.
Your single goal: help the user arrive at a confident, informed decision.

================ USER SITUATION ================
• Decision: ${context}
• Preferences: ${preferences.join(" | ")}
• Constraints: ${constraints.join(" | ")}

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

===============================================`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, context, preferences, constraints, previousMessages } = RequestSchema.parse(body)

    // Check for OpenAI API key configuration
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const systemMessage = buildSystemMessage(context, preferences, constraints)
    const relevantMessages = previousMessages.slice(-3) // Keep last 3 messages for tighter context

    const messages = [
      { role: 'system', content: systemMessage },
      ...relevantMessages,
      { role: 'user', content: message }
    ]

    // Use OpenAI's GPT-4 model for chat completions
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as any[],
      temperature: 0.7,
      max_tokens: 400, // Limiting token length to encourage conciseness
    })

    const content = completion.choices[0].message.content
    if (!content) throw new Error('No content in response')

    return NextResponse.json({ 
      message: content,
      context: {
        last_context: context,
        last_preferences: preferences,
        last_constraints: constraints
      }
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
