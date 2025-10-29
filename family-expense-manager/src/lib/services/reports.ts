import { PrismaClient } from "@prisma/client"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { emailTemplates, notifyWorkspaceMembers } from "@/lib/email"

const prisma = new PrismaClient()

async function generateMonthlyReport(workspaceId: string) {
  const now = new Date()
  const startDate = startOfMonth(now)
  const endDate = endOfMonth(now)

  // Get workspace info
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId }
  })

  if (!workspace) {
    throw new Error("Workspace not found")
  }

  // Get transactions for the month
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

  // Get top spending categories
  const topCategories = await prisma.transaction.groupBy({
    by: ["categoryId"],
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
    },
    orderBy: {
      _sum: {
        amount: "desc"
      }
    },
    take: 5,
  })

  const categoriesWithNames = await Promise.all(
    topCategories.map(async (cat) => {
      const category = await prisma.category.findUnique({
        where: { id: cat.categoryId }
      })
      return {
        name: category?.name || "Unknown",
        amount: cat._sum.amount || 0
      }
    })
  )

  const totalIncome = income._sum.amount || 0
  const totalExpenses = expenses._sum.amount || 0
  const netSavings = totalIncome - totalExpenses

  // Generate and send report
  const template = emailTemplates.monthlyReport({
    workspaceName: workspace.name,
    month: format(now, "MMMM"),
    year: now.getFullYear(),
    totalIncome,
    totalExpenses,
    netSavings,
    topCategories: categoriesWithNames
  })

  await notifyWorkspaceMembers({
    workspaceId,
    ...template,
    roles: ["OWNER", "ADMIN", "MEMBER"] // Send to all members
  })
}

export async function generateMonthlyReports() {
  // Get all active workspaces
  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: {
          role: "OWNER"
        }
      }
    }
  })

  // Generate reports for each workspace
  const promises = workspaces.map(workspace => 
    generateMonthlyReport(workspace.id).catch(error => {
      console.error(`Failed to generate report for workspace ${workspace.id}:`, error)
    })
  )

  await Promise.all(promises)
}