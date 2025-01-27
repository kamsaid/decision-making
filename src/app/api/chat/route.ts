import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
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

function buildSystemMessage(context: string, preferences: string[], constraints: string[]) {
  return `You are having a natural, friendly conversation about a decision regarding:

${context}

Keep in mind these preferences and constraints, but discuss them naturally:
Preferences: ${preferences.join(', ')}
Constraints: ${constraints.join(', ')}

Important guidelines for your responses:
- Keep responses concise and conversational, like a knowledgeable friend giving advice
- Avoid using markdown, bullet points, or formal structuring
- Don't use section headers or elaborate formatting
- Present information in a flowing, natural way
- Focus on 2-3 key points rather than exhaustive lists
- Use everyday language while maintaining expertise
- Keep responses to 2-3 short paragraphs when possible
- Ask simple follow-up questions when needed

Example conversation style:
"I see what you're asking about. Based on your situation, I think the most important thing to consider is [key point]. This matters because [brief explanation]. Another crucial factor is [second point]. What are your thoughts on that?"

Remember to maintain a natural flow while drawing on your decision-making expertise.`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, context, preferences, constraints, previousMessages } = RequestSchema.parse(body)

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const systemMessage = buildSystemMessage(context, preferences, constraints)
    const relevantMessages = previousMessages.slice(-3) // Keep last 3 messages for tighter context

    const messages = [
      { role: 'system', content: systemMessage },
      ...relevantMessages,
      { role: 'user', content: message }
    ]

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
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
