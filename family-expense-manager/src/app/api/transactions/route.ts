import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  notes: z.string().optional(),
  date: z.string(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  categoryId: z.string(),
  accountId: z.string(),
  workspaceId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createTransactionSchema.parse(body)

    // Check if user is member of workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: validatedData.workspaceId,
        userId: session.user.id,
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not a workspace member' }, { status: 403 })
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: validatedData.amount, // Store as number directly
        description: validatedData.description,
        notes: validatedData.notes,
        date: new Date(validatedData.date),
        type: validatedData.type,
        categoryId: validatedData.categoryId,
        accountId: validatedData.accountId,
        userId: session.user.id,
        workspaceId: validatedData.workspaceId,
      },
      include: {
        category: true,
        account: true,
      },
    })

    // Update account balances for EXPENSE and INCOME
    if (validatedData.type !== 'TRANSFER') {
      const multiplier = validatedData.type === 'INCOME' ? 1 : -1
      await prisma.financialAccount.update({
        where: { id: validatedData.accountId },
        data: {
          balance: {
            increment: validatedData.amount * multiplier,
          },
        },
      })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    // Check membership
    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: session.user.id },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not a workspace member' }, { status: 403 })
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Filters
    const filters: any = { workspaceId }

    if (searchParams.get('type')) {
      filters.type = searchParams.get('type')
    }
    if (searchParams.get('categoryId')) {
      filters.categoryId = searchParams.get('categoryId')
    }
    if (searchParams.get('accountId')) {
      filters.accountId = searchParams.get('accountId')
    }
    if (searchParams.get('dateFrom') || searchParams.get('dateTo')) {
      filters.date = {}
      if (searchParams.get('dateFrom')) {
        filters.date.gte = new Date(searchParams.get('dateFrom')!)
      }
      if (searchParams.get('dateTo')) {
        filters.date.lte = new Date(searchParams.get('dateTo')!)
      }
    }

    const [transactions, total] = await Promise.all([
      (prisma as any).transaction.findMany({
        where: filters,
        include: {
          category: true,
          account: true,
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).transaction.count({ where: filters }),
    ])

    const mapTransaction = (t: any) => ({
      ...t,
      amount: typeof t.encryptedAmount !== 'undefined' ? Number(t.encryptedAmount) : (t as any).amount,
    })

    return NextResponse.json({
      transactions: (transactions as any[]).map(mapTransaction),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
