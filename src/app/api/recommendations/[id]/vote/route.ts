import { NextResponse } from 'next/server'
import { z } from 'zod'

// Input validation schema
const VoteSchema = z.object({
  score: z.number().min(-1).max(1),
})

// POST handler for votes
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { score } = VoteSchema.parse(body)

    // Here you would typically save the vote to a database
    // For now, we'll just return a success response
    console.log(`Received vote for recommendation ${params.id}: ${score}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving vote:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid vote data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save vote' },
      { status: 500 }
    )
  }
} 