/*───────────────────────────────────────────────────────────────────────────*\
  SeekHelp – Recommendation Engine v2.0
  ───────────────────────────────────────────────────────────────────────────
  • Retains the orchestrator architecture you already shipped.
  • Generates deeper, step‑by‑step advice with timelines & resources.
  • Adds graceful degradation paths to stay inside Edge runtime limits.
\*───────────────────────────────────────────────────────────────────────────*/

export const maxDuration   = 60;             // Vercel Edge function limit (s)
export const runtime       = 'edge';
export const dynamic       = 'force-dynamic';
export const fetchCache    = 'force-no-store';
export const preferredRegion = 'iad1';

import { NextResponse } from 'next/server';
import OpenAI            from 'openai';
import { z }             from 'zod';
import { AI_CONFIG }     from '@/lib/config';

/*-------------------------------------------------------------------------*\
  1. Timeout & token budgets
\*-------------------------------------------------------------------------*/

const MODEL_ORCH  = AI_CONFIG.models.orchestrator;  // Using config
const MODEL_SYNTH = AI_CONFIG.models.synthesis;     // Using config

const ORCHESTRATOR_TIMEOUT = AI_CONFIG.timeouts.orchestrator;  // Using config
const WORKER_TIMEOUT       = AI_CONFIG.timeouts.worker;        // Using config
const SYNTHESIS_TIMEOUT    = AI_CONFIG.timeouts.synthesis;     // Using config
const WORKER_PARALLEL_TIMEOUT = AI_CONFIG.timeouts.workerParallel; // Using config

const TOKENS_SMALL  = AI_CONFIG.tokens.small;   // Using config (512)
const TOKENS_LARGE  = AI_CONFIG.tokens.large;   // Using config (1024)

/*-------------------------------------------------------------------------*\
  2. OpenAI helper
\*-------------------------------------------------------------------------*/

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY env variable missing');
  return new OpenAI({
    apiKey,
    timeout: 55_000,
    maxRetries: 0,
    defaultHeaders: { 'Cache-Control': 'no-store' },
    defaultQuery: { stream: 'false' },
  });
}

/*-------------------------------------------------------------------------*\
  3. Schemas ( ↑ detail, still backwards‑compatible )
\*-------------------------------------------------------------------------*/

const RequestSchema = z.object({
  context:     z.string().min(1),
  preferences: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
});

const TaskListSchema = z.object({
  analysis: z.string(),
  tasks: z.array(z.object({
    type:        z.enum(['preference_analysis','constraint_validation','creative_solutions']),
    description: z.string(),
  })).max(3),                    // allow up to 3 subtasks
});

const WorkerOutputSchema = z.object({
  recommendations: z.array(z.object({
    id:          z.string(),
    title:       z.string(),
    description: z.string(),
    /* NEW */ actionPlan:   z.array(z.string()),
    /* NEW */ timeframe:    z.string(),
    pros:        z.array(z.string()),
    cons:        z.array(z.string()),
    tags:        z.array(z.string()).default([]),
  })),
}).nullable();

const ApiResponseSchema = z.object({
  analysis: z.object({
    analysis:    z.string(),
    tasks:       z.array(z.object({ type: z.string(), description: z.string() })),
    workerStatus:z.array(z.object({
      type:    z.string(),
      success: z.boolean(),
      error:   z.string().nullable(),
    })),
  }),
  finalRecommendation: z.object({
    summary:     z.string(),
    reasoning:   z.string(),
    keyPoints:   z.array(z.string()),
    /* NEW */ nextSteps:  z.array(z.string()),
    /* NEW */ resources:  z.array(z.string()),
  }),
});

/*-------------------------------------------------------------------------*\
  4. Prompt factories – tuned for long, actionable answers
\*-------------------------------------------------------------------------*/

function orchestratorPrompt(context: string, prefs: string[], cons: string[]) {
  return `
You are an expert decision strategist.

TASK ➜ Break the problem below into 2‑3 analytical subtasks (json).
• Subtasks should be independent and run in parallel.
• Use only the enum types provided.
• Keep descriptions short: 1‑2 sentences.

INPUT
  "context":     "${context}"
  "preferences": "${prefs.join(' | ')}"
  "constraints": "${cons.join(' | ')}"

OUTPUT (strict JSON):
{
  "analysis": "<30‑word synthesis of the key issue>",
  "tasks": [
    { "type": "preference_analysis | constraint_validation | creative_solutions", "description": "…" }
    …
  ]
}`;
}

function workerPrompt(context: string, prefs: string[], cons: string[], type: string, desc: string) {
  return `
You are an elite specialist asked to perform: ${type.toUpperCase()}.

CONTEXT:      ${context}
PREFERENCES:  ${prefs.join(' | ') || '–'}
CONSTRAINTS:  ${cons.join(' | ') || '–'}
SUBTASK:      ${desc}

DELIVERABLE
Return 3‑5 diverse recommendations.  For each:
• Give a compelling title & 40‑word description.
• Provide an actionPlan → 3–6 numbered steps the user can follow immediately.
• Assign a realistic timeframe (e.g. "3–4 weeks").
• Provide key pros & cons.
• Optional tags (max 3) to hint at scenario or persona.

Strict JSON schema:
{
  "recommendations": [
    {
      "id": "snake_case_id",
      "title": "…",
      "description": "…",
      "actionPlan": ["Step 1 …", "Step 2 …"],
      "timeframe": "…",
      "pros": ["…"],
      "cons": ["…"],
      "tags": ["…"]
    }, …
  ]
}`;
}

function synthesisPrompt(context: string, workerOutputs: any[]) {
  return `
You are the Chief Decision Architect synthesising specialist reports.

GOAL
Present ONE consolidated, life‑changing recommendation package.

CONTEXT: ${context}

WORKER OUTPUTS:
${JSON.stringify(workerOutputs, null, 2)}

INSTRUCTIONS
• Merge overlapping ideas; discard weak ones.
• Produce: summary, reasoning, 4–6 keyPoints.
• Add nextSteps: a punch‑list of what the user should do in the coming week.
• Suggest high‑quality resources (books, tools, services; ≤5).

Strict JSON:
{
  "summary":    "≤60 words",
  "reasoning":  "100–140 words explaining why this path excels",
  "keyPoints":  ["…"],
  "nextSteps":  ["…"],
  "resources":  ["…"]
}`;
}

/*-------------------------------------------------------------------------*\
  5. Timeout helper
\*-------------------------------------------------------------------------*/

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), ms));
  return Promise.race([promise, timeout]);
}

// Enhanced JSON parsing helper with sophisticated recovery logic
function parseJSONSafely(content: string): any {
  try {
    // First attempt: parse as-is
    return JSON.parse(content);
  } catch (error) {
    console.warn('Initial JSON parse failed, attempting recovery...');
    
    // Try basic cleaning first
    let cleaned = content
      .trim()
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote unquoted keys
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
    
    try {
      return JSON.parse(cleaned);
    } catch (secondError) {
      // Advanced recovery for truncated JSON
      console.warn('Basic cleaning failed, attempting advanced recovery...');
      
      // Try to extract and parse just the recommendations array if present
      const recommendationsMatch = cleaned.match(/{\s*"recommendations"\s*:\s*\[([\s\S]*)/);
      if (recommendationsMatch) {
        try {
          // Attempt to close the truncated recommendations array
          let partialContent = recommendationsMatch[0];
          partialContent = recoverTruncatedJSON(partialContent);
          const recovered = JSON.parse(partialContent);
          console.warn('Successfully recovered truncated JSON');
          return recovered;
        } catch (e) {
          // Continue to full recovery
        }
      }
      
      // Full recovery attempt
      cleaned = recoverTruncatedJSON(cleaned);
      
      try {
        const recovered = JSON.parse(cleaned);
        console.warn('Successfully recovered truncated JSON');
        return recovered;
      } catch (recoveryError) {
        console.error('Advanced recovery failed:', cleaned.slice(0, 200));
        throw new Error('Failed to parse AI response as JSON');
      }
    }
  }
}

// Advanced recovery function for truncated JSON
function recoverTruncatedJSON(jsonStr: string): string {
  let result = jsonStr;
  
  // First, handle incomplete strings
  let inString = false;
  let escaped = false;
  let lastQuoteIndex = -1;
  
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    
    if (escaped) {
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      continue;
    }
    
    if (char === '"' && !escaped) {
      inString = !inString;
      if (inString) {
        lastQuoteIndex = i;
      }
    }
  }
  
  // If we're still in a string at the end, close it
  if (inString && lastQuoteIndex !== -1) {
    result += '"';
    inString = false;
  }
  
  // Remove any incomplete property at the end
  result = result.replace(/,\s*"[^"]*$/, ''); // Remove incomplete property
  result = result.replace(/,\s*$/, ''); // Remove trailing comma
  
  // Count open/close brackets and braces
  let openBraces = 0;
  let openBrackets = 0;
  inString = false;
  escaped = false;
  
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    
    if (escaped) {
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      continue;
    }
    
    if (char === '"' && !escaped) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') openBraces++;
      else if (char === '}') openBraces--;
      else if (char === '[') openBrackets++;
      else if (char === ']') openBrackets--;
    }
  }
  
  // Close any incomplete arrays or objects
  while (openBrackets > 0) {
    result += ']';
    openBrackets--;
  }
  
  while (openBraces > 0) {
    result += '}';
    openBraces--;
  }
  
  // Try to validate and fix common patterns
  try {
    JSON.parse(result);
    return result;
  } catch (e) {
    // If still invalid, try more aggressive recovery
    
    // Check for incomplete array items
    if (result.includes('"recommendations"')) {
      // Find the last complete recommendation object
      const matches = [...result.matchAll(/{\s*"id"\s*:\s*"[^"]+"/g)];
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        const lastCompleteIndex = result.lastIndexOf(lastMatch[0]);
        
        // Find the end of this recommendation object
        let braceCount = 0;
        let endIndex = lastCompleteIndex;
        inString = false;
        
        for (let i = lastCompleteIndex; i < result.length; i++) {
          const char = result[i];
          
          if (char === '"' && (i === 0 || result[i-1] !== '\\')) {
            inString = !inString;
          }
          
          if (!inString) {
            if (char === '{') braceCount++;
            else if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                endIndex = i + 1;
                break;
              }
            }
          }
        }
        
        // If we found a complete recommendation, truncate after it
        if (endIndex > lastCompleteIndex) {
          result = result.substring(0, endIndex) + ']}';
          
          // Recount and close any remaining open structures
          openBraces = 0;
          openBrackets = 0;
          inString = false;
          
          for (let i = 0; i < result.length; i++) {
            const char = result[i];
            if (char === '"' && (i === 0 || result[i-1] !== '\\')) {
              inString = !inString;
            }
            if (!inString) {
              if (char === '{') openBraces++;
              else if (char === '}') openBraces--;
              else if (char === '[') openBrackets++;
              else if (char === ']') openBrackets--;
            }
          }
          
          while (openBrackets > 0) {
            result += ']';
            openBrackets--;
          }
          while (openBraces > 0) {
            result += '}';
            openBraces--;
          }
        }
      }
    }
  }
  
  return result;
}

/*-------------------------------------------------------------------------*\
  6. Pipeline functions
\*-------------------------------------------------------------------------*/

async function runOrchestrator(ai: OpenAI, ctx: string, prefs: string[], cons: string[]) {
  const start = Date.now();
  try {
    const completion = await withTimeout(
      ai.chat.completions.create({
        model: MODEL_ORCH,
        max_completion_tokens: TOKENS_SMALL,
        temperature: AI_CONFIG.temperature.orchestrator,  // Using config
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Respond ONLY with valid JSON.' },
          { role: 'user',   content: orchestratorPrompt(ctx, prefs, cons) },
        ],
      }),
      ORCHESTRATOR_TIMEOUT,
    );
    
    const content = completion.choices[0]?.message?.content;
    if (!content || content.trim() === '') {
      throw new Error('Empty response from orchestrator');
    }
    
    return parseJSONSafely(content);
  } catch (err) {
    console.error('Orchestrator failed in', Date.now() - start, 'ms', err);
    throw err;
  }
}

async function runWorker(ai: OpenAI, ctx: string, prefs: string[], cons: string[],
                          type: string, desc: string) {
  const start = Date.now();
  try {
    const completion = await withTimeout(
      ai.chat.completions.create({
        model: MODEL_ORCH,
        max_completion_tokens: TOKENS_SMALL,
        temperature: AI_CONFIG.temperature.worker,  // Using config
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Respond ONLY with valid JSON.' },
          { role: 'user',   content: workerPrompt(ctx, prefs, cons, type, desc) },
        ],
      }),
      WORKER_TIMEOUT,
    );
    
    const content = completion.choices[0]?.message?.content;
    if (!content || content.trim() === '') {
      throw new Error(`Empty response from worker ${type}`);
    }
    
    return parseJSONSafely(content);
  } catch (err) {
    console.error(`Worker ${type} failed in`, Date.now() - start, 'ms', err);
    throw err;
  }
}

async function runSynthesis(ai: OpenAI, ctx: string, workerOutputs: any[]) {
  const start = Date.now();
  try {
    const completion = await withTimeout(
      ai.chat.completions.create({
        model: MODEL_SYNTH,
        max_completion_tokens: TOKENS_LARGE,
        temperature: AI_CONFIG.temperature.synthesis,  // Using config
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Respond ONLY with valid JSON.' },
          { role: 'user',   content: synthesisPrompt(ctx, workerOutputs) },
        ],
      }),
      SYNTHESIS_TIMEOUT,
    );
    
    const content = completion.choices[0]?.message?.content;
    if (!content || content.trim() === '') {
      throw new Error('Empty response from synthesis');
    }
    
    return parseJSONSafely(content);
  } catch (err) {
    console.error('Synthesis failed in', Date.now() - start, 'ms', err);
    throw err;
  }
}

/*-------------------------------------------------------------------------*\
  7. Handler
\*-------------------------------------------------------------------------*/

export async function POST(req: Request) {
  const globalStart = Date.now();

  try {
    /* 7.1 Validate request ------------------------------------------------*/
    const { context, preferences, constraints } = RequestSchema.parse(await req.json());

    /* 7.2 Init OpenAI client --------------------------------------------*/
    const openai = createOpenAIClient();

    /* 7.3 Orchestrator ---------------------------------------------------*/
    const orchOut = await runOrchestrator(openai, context, preferences, constraints);
    const tasks    = TaskListSchema.parse(orchOut).tasks;

    /* 7.4 Launch workers in parallel ------------------------------------*/
    const workerPromises = tasks.map(t =>
      runWorker(openai, context, preferences, constraints, t.type, t.description)
        .then(out => ({ type: t.type, output: WorkerOutputSchema.parse(out), error: null }))
        .catch(err => ({ type: t.type, output: null, error: (err as Error).message })),
    );

    const workerResults = await withTimeout(Promise.all(workerPromises), WORKER_PARALLEL_TIMEOUT);

    /* 7.5 Require ≥1 successful worker ----------------------------------*/
    const successful = workerResults.filter(r => r.output);
    if (!successful.length) {
      // Add a fallback to provide some value even if workers fail
      console.warn('All workers failed, providing fallback guidance');
      const fallbackRecommendation = {
        summary: "Here are thoughtful recommendations based on your decision context.",
        reasoning: `Given your context "${context.slice(0, 100)}...", I recommend focusing on a balanced approach that considers both immediate needs and long-term goals. This path offers flexibility while maintaining alignment with your stated preferences and constraints.`,
        keyPoints: [
          "Start with small, reversible steps to test your assumptions",
          "Gather feedback early and often from stakeholders",
          "Document your decision-making process for future reference",
          "Build in checkpoints to reassess and adjust as needed"
        ],
        nextSteps: [
          "Define clear success metrics for your decision",
          "Create a timeline with specific milestones",
          "Identify key stakeholders and communicate your plan",
          "Set up a review process for 30, 60, and 90 days out"
        ],
        resources: [
          "The Decision Book: 50 Models for Strategic Thinking",
          "Good Strategy Bad Strategy by Richard Rumelt",
          "Thinking in Bets by Annie Duke"
        ]
      };
      
      return NextResponse.json({
        analysis: {
          analysis: orchOut.analysis || "Analysis of your decision context",
          tasks: tasks,
          workerStatus: workerResults.map(r => ({
            type: r.type,
            success: false,
            error: r.error,
          })),
        },
        finalRecommendation: fallbackRecommendation,
      });
    }

    /* 7.6 Synthesis ------------------------------------------------------*/
    const finalRecommendation = await runSynthesis(
      openai,
      context,
      successful.map(r => ({ type: r.type, recommendations: r.output!.recommendations })),
    );

    /* 7.7 Assemble response ---------------------------------------------*/
    const response = {
      analysis: {
        analysis: orchOut.analysis,
        tasks: orchOut.tasks,
        workerStatus: workerResults.map(r => ({
          type: r.type,
          success: !!r.output,
          error: r.error,
        })),
      },
      finalRecommendation,
    };

    ApiResponseSchema.parse(response);   // runtime guard

    return NextResponse.json(response);

  } catch (err: any) {
    /* 7.8 Fallback error response ---------------------------------------*/
    const elapsed = Date.now() - globalStart;
    const stage =
      elapsed < ORCHESTRATOR_TIMEOUT        ? 'orchestrator' :
      elapsed < WORKER_PARALLEL_TIMEOUT     ? 'workers'      :
      elapsed < WORKER_PARALLEL_TIMEOUT + SYNTHESIS_TIMEOUT ? 'synthesis' : 'unknown';

    return NextResponse.json(
      { error: err.message || 'Internal error', stage },
      { status: err instanceof z.ZodError ? 400 : 500 },
    );
  }
}

