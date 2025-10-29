import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'
import { getRequestIdFromHeaders, logError, logInfo } from '@/lib/logger'

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.string(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string(),
  userId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const requestId = getRequestIdFromHeaders(request.headers)
      if (requestId) res.headers.set('x-request-id', requestId)
      return res
    }

    const body = await request.json()
    const validatedData = createTransactionSchema.parse(body)

    // For now, allow all authenticated users to create transactions
    // In production, you'd want to check workspace membership

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: validatedData.amount,
        description: validatedData.description,
        date: new Date(validatedData.date),
        type: validatedData.type,
        category: validatedData.category,
        userId: validatedData.userId,
      },
    })

    const requestId = getRequestIdFromHeaders(request.headers)
    logInfo('transaction_created', { requestId, userId: session.user.id, transactionId: transaction.id })
    const res = NextResponse.json(transaction)
    if (requestId) res.headers.set('x-request-id', requestId)
    return res
  } catch (error) {
    const requestId = getRequestIdFromHeaders(request.headers)
    logError('transaction_create_failed', { requestId, error: (error as Error)?.message })
    const res = NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
    if (requestId) res.headers.set('x-request-id', requestId)
    return res
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const requestId = getRequestIdFromHeaders(request.headers)
      if (requestId) res.headers.set('x-request-id', requestId)
      return res
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    // For now, allow all authenticated users to view transactions
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Filters
    const filters: any = { userId: session.user.id }

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

    const body = {
      transactions: (transactions as any[]).map(mapTransaction),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
    const requestId = getRequestIdFromHeaders(request.headers)
    logInfo('transactions_listed', { requestId, userId: session.user.id, count: (transactions as any[]).length })
    const res = NextResponse.json(body)
    if (requestId) res.headers.set('x-request-id', requestId)
    return res
  } catch (error) {
    const requestId = getRequestIdFromHeaders(request.headers)
    logError('transactions_list_failed', { requestId, error: (error as Error)?.message })
    const res = NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
    if (requestId) res.headers.set('x-request-id', requestId)
    return res
  }
}
