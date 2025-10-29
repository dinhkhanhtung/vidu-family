import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TransactionFormData } from "@/lib/validations/transaction"
import { FinancialAccount, Transaction } from "@prisma/client"

// List transactions with pagination and filters
export async function getTransactions({
  workspaceId,
  type,
  categoryId,
  accountId,
  startDate,
  endDate,
  page = 1,
  limit = 10,
}: {
  workspaceId: string
  type?: "INCOME" | "EXPENSE" | "TRANSFER"
  categoryId?: string
  accountId?: string
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}) {
  const skip = (page - 1) * limit
  const where = {
    workspaceId,
    ...(type && { type }),
    ...(categoryId && { categoryId }),
    ...(accountId && { accountId }),
    ...(startDate && endDate && {
      date: {
        gte: startDate,
        lte: endDate
      }
    })
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true
      },
      orderBy: {
        date: "desc"
      },
      skip,
      take: limit
    }),
    prisma.transaction.count({ where })
  ])

  return {
    transactions,
    total,
    pages: Math.ceil(total / limit)
  }
}

// Get transaction by ID
export async function getTransaction(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      category: true,
      account: true
    }
  })

  if (!transaction) {
    return null
  }

  // Verify user has access to this transaction's workspace
  const hasAccess = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: transaction.workspaceId
      }
    }
  })

  if (!hasAccess) {
    throw new Error("Not authorized")
  }

  return transaction
}

// Create new transaction
export async function createTransaction(data: TransactionFormData & { workspaceId: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const { workspaceId, accountId, type, amount } = data

  // Start a transaction to handle account balance updates
  return await prisma.$transaction(async (tx) => {
    // Create the transaction record
    const transaction = await tx.transaction.create({
      data: {
        ...data,
        createdBy: session.user.id
      },
      include: {
        category: true,
        account: true
      }
    })

    // Update account balance
    const account = await tx.financialAccount.findUnique({
      where: { id: accountId }
    })

    if (!account) {
      throw new Error("Account not found")
    }

    const balanceChange = type === "EXPENSE" ? -amount : amount
    await tx.financialAccount.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    })

    // If it's a transfer, update the target account
    if (type === "TRANSFER" && data.targetAccountId) {
      await tx.financialAccount.update({
        where: { id: data.targetAccountId },
        data: {
          balance: {
            increment: amount
          }
        }
      })
    }

    return transaction
  })
}

// Update transaction
export async function updateTransaction(id: string, data: Partial<TransactionFormData>) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const existingTransaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      account: true
    }
  })

  if (!existingTransaction) {
    throw new Error("Transaction not found")
  }

  // Start a transaction to handle account balance updates
  return await prisma.$transaction(async (tx) => {
    // Revert previous balance changes
    if (data.amount !== existingTransaction.amount || data.type !== existingTransaction.type) {
      const oldBalanceChange = existingTransaction.type === "EXPENSE" 
        ? existingTransaction.amount 
        : -existingTransaction.amount

      await tx.financialAccount.update({
        where: { id: existingTransaction.accountId },
        data: {
          balance: {
            increment: oldBalanceChange
          }
        }
      })

      // Apply new balance changes
      const newBalanceChange = data.type === "EXPENSE" 
        ? -(data.amount || 0)
        : (data.amount || 0)

      await tx.financialAccount.update({
        where: { id: data.accountId || existingTransaction.accountId },
        data: {
          balance: {
            increment: newBalanceChange
          }
        }
      })
    }

    // Update the transaction record
    const transaction = await tx.transaction.update({
      where: { id },
      data,
      include: {
        category: true,
        account: true
      }
    })

    return transaction
  })
}

// Delete transaction
export async function deleteTransaction(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id }
  })

  if (!transaction) {
    throw new Error("Transaction not found")
  }

  // Start a transaction to handle account balance updates
  return await prisma.$transaction(async (tx) => {
    // Revert balance changes
    const balanceChange = transaction.type === "EXPENSE" 
      ? transaction.amount 
      : -transaction.amount

    await tx.financialAccount.update({
      where: { id: transaction.accountId },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    })

    // Delete the transaction record
    await tx.transaction.delete({
      where: { id }
    })
  })
}

// Get transaction summary
export async function getTransactionSummary({
  workspaceId,
  startDate,
  endDate
}: {
  workspaceId: string
  startDate: Date
  endDate: Date
}) {
  const [income, expenses] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        workspaceId,
        type: "INCOME",
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    }),
    prisma.transaction.aggregate({
      where: {
        workspaceId,
        type: "EXPENSE",
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    })
  ])

  const categoryBreakdown = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      workspaceId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true
    }
  })

  const accountBalances = await prisma.financialAccount.findMany({
    where: {
      workspaceId
    },
    select: {
      id: true,
      name: true,
      balance: true,
      currency: true
    }
  })

  return {
    income: income._sum.amount || 0,
    expenses: expenses._sum.amount || 0,
    net: (income._sum.amount || 0) - (expenses._sum.amount || 0),
    categoryBreakdown,
    accountBalances
  }
}