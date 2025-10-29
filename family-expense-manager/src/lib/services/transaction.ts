import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TransactionFormData } from "@/lib/validations/transaction"
import { Transaction } from "@prisma/client"

// List transactions with pagination and filters
export async function getTransactions({
  type,
  category,
  startDate,
  endDate,
  page = 1,
  limit = 10,
}: {
  type?: "INCOME" | "EXPENSE"
  category?: string
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}) {
  const skip = (page - 1) * limit
  const where: any = {
    ...(type && { type }),
    ...(category && { category }),
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
    where: { id }
  })

  if (!transaction) {
    return null
  }

  // Verify user owns this transaction
  if (transaction.userId !== session.user.id) {
    throw new Error("Not authorized")
  }

  return transaction
}

// Create new transaction
export async function createTransaction(data: TransactionFormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const transaction = await prisma.transaction.create({
    data: {
      ...data,
      userId: session.user.id
    }
  })

  return transaction
}

// Update transaction
export async function updateTransaction(id: string, data: Partial<TransactionFormData>) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const existingTransaction = await prisma.transaction.findUnique({
    where: { id }
  })

  if (!existingTransaction) {
    throw new Error("Transaction not found")
  }

  // Verify user owns this transaction
  if (existingTransaction.userId !== session.user.id) {
    throw new Error("Not authorized")
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data
  })

  return transaction
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

  // Verify user owns this transaction
  if (transaction.userId !== session.user.id) {
    throw new Error("Not authorized")
  }

  await prisma.transaction.delete({
    where: { id }
  })
}

// Get transaction summary
export async function getTransactionSummary({
  startDate,
  endDate
}: {
  startDate: Date
  endDate: Date
}) {
  const [income, expenses] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
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
    by: ["category"],
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true
    }
  })

  return {
    income: income._sum.amount || 0,
    expenses: expenses._sum.amount || 0,
    net: (income._sum.amount || 0) - (expenses._sum.amount || 0),
    categoryBreakdown
  }
}