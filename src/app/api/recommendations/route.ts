import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
})

const RequestSchema = z.object({
  context: z.string().min(1),
  preferences: z.array(z.string()),
  constraints: z.array(z.string()),
})

const RecommendationSchema = z.object({
  recommendations: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string())
  }))
})

const EvaluationSchema = z.object({
  evaluation: z.enum(["PASS", "NEEDS_IMPROVEMENT"]),
  feedback: z.string()
})

function generatePrompt(context: string, preferences: string[], constraints: string[], feedback = '') {
  return `As an AI decision-making assistant, help analyze the following decision:

Context: ${context}

Preferences:
${preferences.map(p => `- ${p}`).join('\n')}

Constraints:
${constraints.map(c => `- ${c}`).join('\n')}

${feedback ? `Previous feedback to address:\n${feedback}\n` : ''}

Please provide 3-5 recommendations in JSON format:
{
  "recommendations": [
    {
      "id": "unique-id",
      "title": "Clear, concise title",
      "description": "Detailed explanation",
      "pros": ["pro1", "pro2"],
      "cons": ["con1", "con2"]
    }
  ]
}`
}

function generateEvaluatorPrompt(context: string, preferences: string[], constraints: string[], recommendations: string) {
  return `Evaluate these recommendations for a decision-making task:

Context: ${context}
Preferences: ${preferences.join(', ')}
Constraints: ${constraints.join(', ')}

Recommendations:
${recommendations}

Evaluate for:
1. Alignment with preferences
2. Respect for constraints
3. Actionability and specificity
4. Quality of pros/cons analysis

Output JSON:
{
  "evaluation": "PASS" or "NEEDS_IMPROVEMENT",
  "feedback": "Detailed feedback if improvements needed"
}`
}

async function generateRecommendations(context: string, preferences: string[], constraints: string[], feedback = '') {
  const completion = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a decision-making assistant that provides well-reasoned recommendations.',
      },
      {
        role: 'user',
        content: generatePrompt(context, preferences, constraints, feedback),
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })

  return completion.choices[0].message.content
}

async function evaluateRecommendations(context: string, preferences: string[], constraints: string[], recommendations: string) {
  const completion = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are an evaluator analyzing decision recommendations for completeness and quality.',
      },
      {
        role: 'user',
        content: generateEvaluatorPrompt(context, preferences, constraints, recommendations),
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  })

  return completion.choices[0].message.content
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { context, preferences, constraints } = RequestSchema.parse(body)

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    let currentRecommendations = ''
    let attempts = 0
    const MAX_ATTEMPTS = 3

    while (attempts < MAX_ATTEMPTS) {
      currentRecommendations = await generateRecommendations(
        context, 
        preferences, 
        constraints, 
        attempts > 0 ? currentRecommendations : ''
      )

      const evaluationResult = await evaluateRecommendations(
        context,
        preferences,
        constraints,
        currentRecommendations
      )

      const evaluation = EvaluationSchema.parse(JSON.parse(evaluationResult))

      if (evaluation.evaluation === "PASS") {
        const parsedRecommendations = RecommendationSchema.parse(JSON.parse(currentRecommendations))
        return NextResponse.json(parsedRecommendations.recommendations)
      }

      attempts++
    }

    // Return best attempt if max attempts reached
    const finalRecommendations = RecommendationSchema.parse(JSON.parse(currentRecommendations))
    return NextResponse.json(finalRecommendations.recommendations)

  } catch (error) {
    console.error('Error in recommendations API:', error)
    
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
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}