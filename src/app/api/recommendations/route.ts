import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
  timeout: 50000, // 50 second timeout for individual API calls
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

const ApiResponseSchema = z.object({
  analysis: z.object({
    analysis: z.string(),
    tasks: z.array(z.object({
      type: z.string(),
      description: z.string(),
    })),
  }),
  finalRecommendation: z.object({
    summary: z.string(),
    reasoning: z.string(),
    keyPoints: z.array(z.string()),
  }),
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
  return `Synthesize these specialized analyses into a final recommendation:
Context: ${context}
Worker Outputs: ${JSON.stringify(workerOutputs, null, 2)}

Create a concise but comprehensive recommendation that combines the insights from all analyses.
Return JSON in this format:
{
  "summary": "A clear, concise summary of the recommendation (2-3 sentences)",
  "reasoning": "A paragraph explaining the key reasoning behind this recommendation",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}`
}

async function runWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
  });

  return Promise.race([promise, timeout]);
}

async function runOrchestrator(context: string, preferences: string[], constraints: string[]) {
  try {
    const completion = await runWithTimeout(
      deepseek.chat.completions.create({
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
      }),
      50000 // 50 second timeout
    );

    const content = completion.choices[0].message.content
    if (!content) throw new Error('No content in orchestrator response')
    return JSON.parse(content)
  } catch (error) {
    console.error('Orchestrator error:', error)
    throw new Error('Failed to analyze decision context. Please try again.')
  }
}

async function runWorker(context: string, preferences: string[], constraints: string[], taskType: string, taskDescription: string) {
  try {
    const completion = await runWithTimeout(
      deepseek.chat.completions.create({
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
      }),
      50000 // 50 second timeout
    );

    const content = completion.choices[0].message.content
    if (!content) throw new Error('No content in worker response')
    return JSON.parse(content)
  } catch (error) {
    console.error('Worker error:', error)
    throw new Error(`Failed to analyze ${taskType}. Please try again.`)
  }
}

async function synthesizeOutputs(context: string, workerOutputs: any[]) {
  try {
    const completion = await runWithTimeout(
      deepseek.chat.completions.create({
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
      }),
      50000 // 50 second timeout
    );

    const content = completion.choices[0].message.content
    if (!content) throw new Error('No content in synthesis response')
    return JSON.parse(content)
  } catch (error) {
    console.error('Synthesis error:', error)
    throw new Error('Failed to synthesize recommendations. Please try again.')
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { context, preferences, constraints } = RequestSchema.parse(body)

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Get task breakdown from orchestrator
    const orchestratorOutput = await runOrchestrator(context, preferences, constraints)
    const { tasks } = orchestratorOutput

    // Run specialized workers in parallel with a timeout
    const workerPromises = tasks.map((task: { type: string; description: string }) => 
      runWorker(context, preferences, constraints, task.type, task.description)
    )
    
    const workerOutputs = await Promise.all(
      workerPromises.map((promise: Promise<any>) => 
        promise.catch((error: Error) => {
          console.error('Worker failed:', error)
          return null
        })
      )
    ).then(results => results.filter(result => result !== null))

    if (workerOutputs.length === 0) {
      throw new Error('All analysis tasks failed. Please try again with a simpler query.')
    }

    // Synthesize worker outputs into final recommendation
    const synthesisOutput = await synthesizeOutputs(context, workerOutputs)
    
    // Prepare the API response
    const response = {
      analysis: orchestratorOutput,
      finalRecommendation: synthesisOutput,
    }

    // Validate the response
    ApiResponseSchema.parse(response)
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in recommendations API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof OpenAI.APIError) {
      const status = error.status || 500
      let message = 'AI service error'
      
      if (status === 429) {
        message = 'Too many requests. Please try again later.'
      } else if (status === 504 || error.message.includes('timeout')) {
        message = 'The request took too long. Please try again with a simpler query.'
      } else {
        message = `AI service error: ${error.message}`
      }
      
      return NextResponse.json({ error: message }, { status })
    }

    const isTimeout = error instanceof Error && 
      (error.message.includes('timeout') || error.message.includes('timed out'))

    if (isTimeout) {
      return NextResponse.json(
        { error: 'The request took too long to process. Please try again with a simpler query.' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}