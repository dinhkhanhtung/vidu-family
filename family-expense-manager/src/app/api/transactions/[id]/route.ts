import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import * as z from 'zod'

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  date: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Check ownership
    if (transaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to view this transaction' }, { status: 403 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateTransactionSchema.parse(body)

    // Get current transaction to check authorization
    const currentTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!currentTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Check ownership
    if (currentTransaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to update this transaction' }, { status: 403 })
    }

      // Simple transaction update without complex balance calculations
      const updatedTransaction = await prisma.transaction.update({
        where: { id: params.id },
        data: {
          amount: validatedData.amount,
          description: validatedData.description,
          date: validatedData.date ? new Date(validatedData.date) : undefined,
          type: validatedData.type,
        },
      })
  
      return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current transaction
    const currentTransaction = await (prisma as any).transaction.findUnique({
      where: { id: params.id },
      include: { workspace: true },
    })

    if (!currentTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Check ownership
    if (currentTransaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this transaction' }, { status: 403 })
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
