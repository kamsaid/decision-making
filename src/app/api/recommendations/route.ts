export const maxDuration = 60
export const runtime = 'edge' 
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const preferredRegion = 'iad1'

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

const ORCHESTRATOR_TIMEOUT = 15000
const WORKER_TIMEOUT = 15000
const SYNTHESIS_TIMEOUT = 15000
const WORKER_PARALLEL_TIMEOUT = 45000

// Initialize OpenAI client with official OpenAI API
const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY || '',
 timeout: 55000,
 maxRetries: 0,
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
 })).max(2),
})

const WorkerOutputSchema = z.object({
 recommendations: z.array(z.object({
   id: z.string(),
   title: z.string(),
   description: z.string(),
   pros: z.array(z.string()),
   cons: z.array(z.string())
 }))
}).nullable()

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
 return `Break down this into 1-2 key analyses:
Context: ${context}
Preferences: ${preferences.join(', ')}
Constraints: ${constraints.join(', ')}

Provide brief analysis and 1-2 focused subtasks in JSON:
{
 "analysis": "Brief analysis of context",
 "tasks": [
   {
     "type": "preference_analysis | constraint_validation | creative_solutions",
     "description": "Focus for this subtask"
   }
 ]
}`
}

function generateWorkerPrompt(context: string, preferences: string[], constraints: string[], taskType: string, taskDescription: string) {
 return `Quick analysis for ${taskType}:
Context: ${context}
Preferences: ${preferences.join(', ')}
Constraints: ${constraints.join(', ')}
Task: ${taskDescription}

Return concise JSON:
{
 "recommendations": [
   {
     "id": "unique-id",
     "title": "Clear title",
     "description": "Brief explanation",
     "pros": ["key pro 1", "key pro 2"],
     "cons": ["key con 1", "key con 2"]
   }
 ]
}`
}

function generateSynthesisPrompt(context: string, workerOutputs: any[]) {
 return `Quick synthesis of analyses:
Context: ${context}
Worker Results: ${JSON.stringify(workerOutputs, null, 2)}

Return concise JSON:
{
 "summary": "1-2 sentence summary",
 "reasoning": "Brief reasoning paragraph",
 "keyPoints": ["Key point 1", "Key point 2"]
}`
}

async function runWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
 const timeout = new Promise<never>((_, reject) => {
   setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
 });
 return Promise.race([promise, timeout]);
}

async function runOrchestrator(context: string, preferences: string[], constraints: string[]) {
 const startTime = Date.now()
 try {
   console.log('Orchestrator started:', new Date().toISOString())
   const completion = await runWithTimeout(
     // Use OpenAI's GPT-4o model for orchestrator analysis (supports JSON mode)
     openai.chat.completions.create({
       model: 'gpt-4o',
       messages: [
         {
           role: 'system',
           content: 'Break down decisions into 1-2 key analyses. Be very concise.',
         },
         {
           role: 'user',
           content: generateOrchestratorPrompt(context, preferences, constraints),
         },
       ],
       temperature: 0.7,
       response_format: { type: 'json_object' },
     }),
     ORCHESTRATOR_TIMEOUT
   );
   console.log('Orchestrator complete:', Date.now() - startTime, 'ms')
   
   const content = completion.choices[0].message.content
   if (!content) throw new Error('Empty orchestrator response')
   return JSON.parse(content)
 } catch (error) {
   console.error('Orchestrator error:', Date.now() - startTime, 'ms:', error)
   throw error
 }
}

async function runWorker(context: string, preferences: string[], constraints: string[], taskType: string, taskDescription: string) {
 const startTime = Date.now()
 try {
   console.log(`Worker ${taskType} started:`, new Date().toISOString())
   const completion = await runWithTimeout(
     // Use OpenAI's GPT-4o model for worker analysis (supports JSON mode)
     openai.chat.completions.create({
       model: 'gpt-4o',
       messages: [
         {
           role: 'system',
           content: `Quick ${taskType} analysis. Be very concise.`,
         },
         {
           role: 'user',
           content: generateWorkerPrompt(context, preferences, constraints, taskType, taskDescription),
         },
       ],
       temperature: 0.7,
       response_format: { type: 'json_object' },
     }),
     WORKER_TIMEOUT
   );
   console.log(`Worker ${taskType} complete:`, Date.now() - startTime, 'ms')

   const content = completion.choices[0].message.content
   if (!content) throw new Error('Empty worker response')
   return JSON.parse(content)
 } catch (error) {
   console.error(`Worker ${taskType} error:`, Date.now() - startTime, 'ms:', error)
   throw error
 }
}

async function synthesizeOutputs(context: string, workerOutputs: any[]) {
 const startTime = Date.now()
 try {
   console.log('Synthesis started:', new Date().toISOString())
   const completion = await runWithTimeout(
     // Use OpenAI's GPT-4o model for synthesis (supports JSON mode)
     openai.chat.completions.create({
       model: 'gpt-4o',
       messages: [
         {
           role: 'system',
           content: 'Synthesize analyses very concisely.',
         },
         {
           role: 'user',
           content: generateSynthesisPrompt(context, workerOutputs),
         },
       ],
       temperature: 0.5,
       response_format: { type: 'json_object' },
     }),
     SYNTHESIS_TIMEOUT
   );
   console.log('Synthesis complete:', Date.now() - startTime, 'ms')

   const content = completion.choices[0].message.content
   if (!content) throw new Error('Empty synthesis response')
   return JSON.parse(content)
 } catch (error) {
   console.error('Synthesis error:', Date.now() - startTime, 'ms:', error)
   throw error
 }
}

export async function POST(req: Request) {
 const startTime = Date.now()
 try {
   const body = await req.json()
   const { context, preferences, constraints } = RequestSchema.parse(body)

   // Check for OpenAI API key configuration
   if (!process.env.OPENAI_API_KEY) {
     throw new Error('API key not configured')
   }

   const orchestratorOutput = await runOrchestrator(context, preferences, constraints)
   const tasks = TaskListSchema.parse(orchestratorOutput).tasks

   const workerPromises = tasks.map((task, index) => {
     return runWorker(context, preferences, constraints, task.type, task.description)
       .then(result => ({ type: task.type, output: result, error: null }))
       .catch(error => ({ type: task.type, output: null, error: error.message }))
   })

   const workerOutputs = await runWithTimeout(
     Promise.all(workerPromises),
     WORKER_PARALLEL_TIMEOUT
   )

   const successfulOutputs = workerOutputs.filter(w => w.output !== null)
   if (successfulOutputs.length === 0) {
     throw new Error('All analyses failed')
   }

   const finalRecommendation = await synthesizeOutputs(
     context, 
     successfulOutputs.map(w => ({
       type: w.type,
       recommendations: w.output.recommendations
     }))
   )

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

   ApiResponseSchema.parse(response)
   return NextResponse.json(response)

 } catch (error: any) {
   console.error('API error:', Date.now() - startTime, 'ms:', error)
   return NextResponse.json(
     { 
       error: error.message || 'Request failed',
       stage: Date.now() - startTime < ORCHESTRATOR_TIMEOUT ? 'orchestrator' :
              Date.now() - startTime < WORKER_PARALLEL_TIMEOUT ? 'workers' : 'synthesis'
     },
     { status: error instanceof z.ZodError ? 400 : 500 }
   )
 }
}