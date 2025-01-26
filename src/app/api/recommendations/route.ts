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

const TaskListSchema = z.object({
  analysis: z.string(),
  tasks: z.array(z.object({
    type: z.enum(["preference_analysis", "constraint_validation", "creative_solutions"]),
    description: z.string(),
  })),
})

const WorkerOutputSchema = z.object({
  recommendations: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string())
  }))
})

function generateOrchestratorPrompt(context: string, preferences: string[], constraints: string[]) {
  return `Break down this decision-making task into specialized analyses:
Context: ${context}
Preferences: ${preferences.join(', ')}
Constraints: ${constraints.join(', ')}

Analyze how to best approach this decision and break it into specialized subtasks.
Return JSON with:
{
  "analysis": "Overall analysis of the decision context",
  "tasks": [
    {
      "type": "preference_analysis | constraint_validation | creative_solutions",
      "description": "Specific focus and approach for this subtask"
    }
  ]
}`
}

function generateWorkerPrompt(context: string, preferences: string[], constraints: string[], taskType: string, taskDescription: string) {
  return `Analyze this decision based on your specialized role:
Context: ${context}
Preferences: ${preferences.join(', ')}
Constraints: ${constraints.join(', ')}
Focus Area: ${taskType}
Task Description: ${taskDescription}

Generate recommendations focusing on your specialized perspective. Return JSON:
{
  "recommendations": [
    {
      "id": "unique-id",
      "title": "Clear title",
      "description": "Detailed explanation",
      "pros": ["pro1", "pro2"],
      "cons": ["con1", "con2"]
    }
  ]
}`
}

function generateSynthesisPrompt(context: string, workerOutputs: any[]) {
  return `Synthesize these specialized analyses into final recommendations:
Context: ${context}
Worker Outputs: ${JSON.stringify(workerOutputs, null, 2)}

Combine and refine the recommendations, removing duplicates and conflicts.
Return JSON in the same recommendation format.`
}

async function runOrchestrator(context: string, preferences: string[], constraints: string[]) {
  const completion = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are an orchestrator that breaks down complex decisions into specialized analyses.',
      },
      {
        role: 'user',
        content: generateOrchestratorPrompt(context, preferences, constraints),
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content)
}

async function runWorker(context: string, preferences: string[], constraints: string[], taskType: string, taskDescription: string) {
  const completion = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `You are a specialized decision analyst focusing on ${taskType}.`,
      },
      {
        role: 'user',
        content: generateWorkerPrompt(context, preferences, constraints, taskType, taskDescription),
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content)
}

async function synthesizeOutputs(context: string, workerOutputs: any[]) {
  const completion = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a synthesis expert combining multiple specialized analyses into coherent recommendations.',
      },
      {
        role: 'user',
        content: generateSynthesisPrompt(context, workerOutputs),
      },
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { context, preferences, constraints } = RequestSchema.parse(body)

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Get task breakdown from orchestrator
    const { tasks } = await runOrchestrator(context, preferences, constraints)

    // Run specialized workers in parallel
    const workerPromises = tasks.map(task => 
      runWorker(context, preferences, constraints, task.type, task.description)
    )
    const workerOutputs = await Promise.all(workerPromises)

    // Synthesize worker outputs into final recommendations
    const finalRecommendations = await synthesizeOutputs(context, workerOutputs)
    
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