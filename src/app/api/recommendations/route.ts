import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

// Initialize OpenAI client with DeepSeek configuration
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1', // DeepSeek API endpoint
})

// Input validation schema
const RequestSchema = z.object({
  context: z.string().min(1),
  preferences: z.array(z.string()),
  constraints: z.array(z.string()),
})

// Generate a prompt for the AI
function generatePrompt(context: string, preferences: string[], constraints: string[]) {
  return `As an AI decision-making assistant, help analyze the following decision:

Context: ${context}

Preferences:
${preferences.map(p => `- ${p}`).join('\n')}

Constraints:
${constraints.map(c => `- ${c}`).join('\n')}

Please provide 3-5 recommendations in the following JSON format:
{
  "recommendations": [
    {
      "id": "unique-id",
      "title": "Clear, concise title",
      "description": "Detailed explanation of the recommendation",
      "pros": ["pro1", "pro2", ...],
      "cons": ["con1", "con2", ...]
    }
  ]
}

Ensure each recommendation:
1. Respects the given constraints
2. Aligns with stated preferences
3. Includes practical pros and cons
4. Is specific and actionable`
}

// POST handler for recommendations
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    console.log('Received request body:', body)

    const { context, preferences, constraints } = RequestSchema.parse(body)
    console.log('Validated input:', { context, preferences, constraints })

    // Check if API key is configured
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('DeepSeek API key is not configured')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Generate AI completion using DeepSeek
    console.log('Sending request to DeepSeek API...')
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat', // Use DeepSeek's chat model
      messages: [
        {
          role: 'system',
          content: 'You are a helpful decision-making assistant that provides well-reasoned recommendations based on user preferences and constraints.',
        },
        {
          role: 'user',
          content: generatePrompt(context, preferences, constraints),
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    // Parse and validate AI response
    const responseText = completion.choices[0].message.content
    if (!responseText) {
      console.error('No response content from DeepSeek API')
      throw new Error('No response from AI')
    }

    console.log('Received response from DeepSeek:', responseText)

    try {
      const response = JSON.parse(responseText)
      if (!response.recommendations || !Array.isArray(response.recommendations)) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format from AI')
      }
      return NextResponse.json(response.recommendations)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      throw new Error('Failed to parse AI response')
    }
  } catch (error) {
    console.error('Error in recommendations API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      console.error('DeepSeek API error:', {
        status: error.status,
        message: error.message,
        type: error.type,
      })
      return NextResponse.json(
        { error: `AI service error: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 