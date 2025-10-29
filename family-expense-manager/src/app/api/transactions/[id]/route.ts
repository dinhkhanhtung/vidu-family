import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  notes: z.string().optional(),
  date: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        account: true,
        workspace: true,
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Check membership
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: transaction.workspaceId,
        userId: session.user.id
      },
    })

    if (!membership) {
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateTransactionSchema.parse(body)

    // Get current transaction to check authorization and calculate balance changes
    const currentTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        amount: true,
        type: true,
        accountId: true,
        workspaceId: true,
        createdBy: true,
        category: true,
        account: true,
        workspace: true,
      },
    })

    if (!currentTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Check membership
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: currentTransaction.workspaceId,
        userId: session.user.id
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not authorized to update this transaction' }, { status: 403 })
    }

    // Start a transaction to update balances correctly
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // If amount or type or account changed, we need to reverse the old transaction and apply new one
      const amount = validatedData.amount || (currentTransaction as any).amount
      const type = validatedData.type || currentTransaction.type
      const accountId = validatedData.accountId || currentTransaction.accountId

      // Reverse old transaction balance impact
      if (currentTransaction.type !== 'TRANSFER') {
        const oldMultiplier = currentTransaction.type === 'INCOME' ? -1 : 1
        await tx.financialAccount.update({
          where: { id: currentTransaction.accountId },
          data: {
            balance: {
              increment: (currentTransaction as any).amount * oldMultiplier,
            },
          },
        })
      }

      // Apply new transaction balance impact
      if (type !== 'TRANSFER') {
        const newMultiplier = type === 'INCOME' ? 1 : -1
        await tx.financialAccount.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: amount * newMultiplier,
            },
          },
        })
      }

      // Update the transaction
      return await tx.transaction.update({
        where: { id: params.id },
        data: {
          ...validatedData,
          ...(validatedData.date && { date: new Date(validatedData.date) }),
        },
        include: {
          category: true,
          account: true,
        },
      })
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current transaction
    const currentTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { workspace: true },
    })

    if (!currentTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Check membership
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: currentTransaction.workspaceId,
        userId: session.user.id
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not authorized to delete this transaction' }, { status: 403 })
    }

    // Reverse the balance impact when deleting
    if (currentTransaction.type !== 'TRANSFER') {
      const multiplier = currentTransaction.type === 'INCOME' ? -1 : 1
      await prisma.financialAccount.update({
        where: { id: currentTransaction.accountId },
        data: {
          balance: {
            increment: (currentTransaction as any).amount * multiplier,
          },
        },
      })
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
