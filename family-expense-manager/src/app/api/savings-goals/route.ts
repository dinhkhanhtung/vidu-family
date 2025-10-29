import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSavingsGoal, getSavingsGoalsByUser } from '@/lib/savings-goals'
import { z } from 'zod'

const createSavingsGoalSchema = z.object({
  name: z.string().min(1, 'Tên mục tiêu là bắt buộc'),
  targetAmount: z.number().positive('Số tiền mục tiêu phải lớn hơn 0'),
  targetDate: z.string().transform((str) => new Date(str)),
  description: z.string().optional(),
})

// GET /api/savings-goals - Get all savings goals for workspace
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      )
    }

    const goals = await getSavingsGoalsByUser(session.user.id)

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error fetching savings goals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/savings-goals - Create new savings goal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSavingsGoalSchema.parse(body)

    // Add workspaceId from query params
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      )
    }

    const goalData = {
      ...validatedData,
      deadline: validatedData.targetDate,
      category: "General",
      userId: session.user.id
    }

    const goal = await createSavingsGoal(goalData)

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Error creating savings goal:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
