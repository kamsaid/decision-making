export const maxDuration = 300 // 5 minute timeout for Pro plan
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const preferredRegion = 'iad1'
export const concurrency = { soft: true, type: 'shared' }

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
  timeout: 270000, // Reduced to ensure we stay under edge function limit
  maxRetries: 1,   // Reduced retries to save time
  defaultQuery: { stream: 'false' },
  defaultHeaders: { 'Cache-Control': 'no-store' }
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
}).nullable() // Allow null for failed workers

const ApiResponseSchema = z.object({
  analysis: z.object({
    analysis: z.string(),
    tasks: z.array(z.object({
      type: z.string(),
      description: z.string(),
    })),
    workerStatus: z.array(z.object({
      type: z.string(),
      success: z.boolean(),
      error: z.string().nullable()
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
  const timeout = 45000 // 45 seconds for orchestrator
  const startTime = Date.now()
  try {
    console.log('Orchestrator started:', new Date().toISOString())
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
      timeout
    );
    console.log('Orchestrator API call complete:', Date.now() - startTime, 'ms')

    const content = completion.choices[0].message.content
    if (!content) throw new Error('No content in orchestrator response')
    return JSON.parse(content)
  } catch (error) {
    console.error('Orchestrator error after', Date.now() - startTime, 'ms:', error)
    throw new Error('Failed to analyze decision context. Please try again.')
  }
}

async function runWorker(context: string, preferences: string[], constraints: string[], taskType: string, taskDescription: string) {
  const timeout = 90000 // 90 seconds for worker tasks
  const startTime = Date.now()
  try {
    console.log(`Worker ${taskType} started:`, new Date().toISOString())
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
      timeout
    );
    console.log(`Worker ${taskType} API call complete:`, Date.now() - startTime, 'ms')

    const content = completion.choices[0].message.content
    if (!content) throw new Error('No content in worker response')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Worker ${taskType} error after`, Date.now() - startTime, 'ms:', error)
    throw new Error(`Failed to analyze ${taskType}. Please try again.`)
  }
}

async function synthesizeOutputs(context: string, workerOutputs: any[]) {
  const timeout = 60000 // 60 seconds for synthesis
  const startTime = Date.now()
  try {
    console.log('Synthesis started:', new Date().toISOString())
    const completion = await runWithTimeout(
      deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a synthesis expert combining multiple specialized analyses into coherent recommendations. Some analyses might be missing due to timeouts, but provide the best recommendation with available data.',
          },
          {
            role: 'user',
            content: generateSynthesisPrompt(context, workerOutputs),
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
      timeout
    );
    console.log('Synthesis API call complete:', Date.now() - startTime, 'ms')

    const content = completion.choices[0].message.content
    if (!content) throw new Error('No content in synthesis response')
    return JSON.parse(content)
  } catch (error) {
    console.error('Synthesis error after', Date.now() - startTime, 'ms:', error)
    throw new Error('Failed to synthesize recommendations. Please try again.')
  }
}

export async function POST(req: Request) {
  const startTime = Date.now()
  try {
    console.log('API Start:', new Date().toISOString())
    
    const body = await req.json()
    const { context, preferences, constraints } = RequestSchema.parse(body)
    console.log('Request parsed:', Date.now() - startTime, 'ms')

    // Run orchestrator
    console.log('Starting orchestrator')
    const orchestratorOutput = await runOrchestrator(context, preferences, constraints)
    console.log('Orchestrator complete:', Date.now() - startTime, 'ms')
    
    const tasks = TaskListSchema.parse(orchestratorOutput).tasks
    console.log(`Starting ${tasks.length} workers in parallel`)
    
    // Create worker promises immediately
    const workerPromises = tasks.map((task, index) => {
      const workerStart = Date.now()
      return runWorker(context, preferences, constraints, task.type, task.description)
        .then(result => {
          console.log(`Worker ${index + 1} (${task.type}) complete:`, Date.now() - workerStart, 'ms')
          return { type: task.type, output: result, error: null }
        })
        .catch((error: any) => {
          console.error(`Worker ${index + 1} (${task.type}) failed:`, error)
          return { type: task.type, output: null, error: error.message || 'Unknown error' }
        })
    })

    // Run workers in parallel with a global timeout
    const workerOutputs = await runWithTimeout(
      Promise.all(workerPromises),
      240000 // 4 minutes global timeout for all workers
    )

    // Filter out failed workers but continue if at least one succeeded
    const successfulOutputs = workerOutputs.filter(w => w.output !== null)
    console.log(`${successfulOutputs.length}/${tasks.length} workers completed successfully`)

    if (successfulOutputs.length === 0) {
      throw new Error('All workers failed. Please try again.')
    }

    // Start synthesis immediately after workers complete
    console.log('Starting synthesis')
    const finalRecommendation = await synthesizeOutputs(
      context, 
      successfulOutputs.map(w => ({
        type: w.type,
        recommendations: w.output.recommendations
      }))
    )
    console.log('Synthesis complete:', Date.now() - startTime, 'ms')

    // Prepare the API response with more detailed information
    const response = {
      analysis: {
        ...orchestratorOutput,
        workerStatus: workerOutputs.map(w => ({
          type: w.type,
          success: w.output !== null,
          error: w.error
        }))
      },
      finalRecommendation
    }

    // Validate the response format
    ApiResponseSchema.parse(response)

    return NextResponse.json(response)
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error('API error after', duration, 'ms:', error)

    // More detailed error response
    return NextResponse.json(
      { 
        error: error.message || 'An unexpected error occurred',
        duration,
        timeoutThreshold: 300000,
        stage: duration < 45000 ? 'orchestrator' :
               duration < 240000 ? 'workers' :
               duration < 270000 ? 'synthesis' : 'unknown',
        details: error instanceof z.ZodError ? error.errors : undefined
      },
      { status: error instanceof z.ZodError ? 400 : error.status || 500 }
    )
  }
}