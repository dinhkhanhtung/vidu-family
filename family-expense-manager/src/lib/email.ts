import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async ({ to, subject, html, text }: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Quản lý Chi Tiêu Gia Đình" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, "")
    })

    if (process.env.NODE_ENV === "development") {
      console.log("Email sent:", info.messageId)
    }

    return info
  } catch (error) {
    console.error("Failed to send email:", error)
    throw error
  }
}

// Helper to send notification to workspace owner
export const notifyWorkspaceOwner = async ({
  workspaceId,
  subject,
  html,
  text
}: {
  workspaceId: string
} & Omit<EmailOptions, "to">) => {
  const owner = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      role: "OWNER"
    },
    include: {
      user: true
    }
  })

  if (!owner?.user?.email) {
    throw new Error("Workspace owner not found")
  }

  return sendEmail({
    to: owner.user.email,
    subject,
    html,
    text
  })
}

// Helper to send notification to workspace members
export const notifyWorkspaceMembers = async ({
  workspaceId,
  subject,
  html,
  text,
  roles = ["OWNER", "ADMIN"]
}: {
  workspaceId: string
  roles?: string[]
} & Omit<EmailOptions, "to">) => {
  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId,
      role: {
        in: roles
      },
      user: {
        isActive: true
      }
    },
    include: {
      user: true
    }
  })

  const emails = members
    .map(member => member.user.email)
    .filter((email): email is string => !!email)

  if (emails.length === 0) {
    throw new Error("No workspace members found")
  }

  return sendEmail({
    to: emails.join(", "),
    subject,
    html,
    text
  })
}

// Helper to send email to current user
export const sendUserEmail = async (options: Omit<EmailOptions, "to">) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("User email not found")
  }

  return sendEmail({
    to: session.user.email,
    ...options
  })
}

// Available email templates
export const emailTemplates = {
  budgetAlert: ({
    budgetName,
    allocated,
    spent,
    remaining,
    period,
    threshold
  }: {
    budgetName: string
    allocated: number
    spent: number
    remaining: number
    period: string
    threshold: number
  }) => ({
    subject: `Budget Alert: ${budgetName} reached ${threshold}% threshold`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Budget Alert</h2>
        <p>Your budget "${budgetName}" has reached ${threshold}% of its allocated amount.</p>
        <ul>
          <li>Budget: ${budgetName}</li>
          <li>Allocated: ${allocated.toLocaleString()} VND</li>
          <li>Spent: ${spent.toLocaleString()} VND</li>
          <li>Remaining: ${remaining.toLocaleString()} VND</li>
          <li>Period: ${period}</li>
        </ul>
        <p>Please review your spending to stay within budget.</p>
      </div>
    `
  }),

  monthlyReport: ({
    workspaceName,
    month,
    year,
    totalIncome,
    totalExpenses,
    netSavings,
    topCategories
  }: {
    workspaceName: string
    month: string
    year: number
    totalIncome: number
    totalExpenses: number
    netSavings: number
    topCategories: Array<{ name: string, amount: number }>
  }) => ({
    subject: `Monthly Financial Report - ${month} ${year}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${workspaceName} - Monthly Financial Report</h2>
        <h3>${month} ${year}</h3>
        
        <div style="margin: 20px 0;">
          <h4>Summary</h4>
          <ul>
            <li>Total Income: ${totalIncome.toLocaleString()} VND</li>
            <li>Total Expenses: ${totalExpenses.toLocaleString()} VND</li>
            <li>Net Savings: ${netSavings.toLocaleString()} VND</li>
          </ul>
        </div>

        <div style="margin: 20px 0;">
          <h4>Top Spending Categories</h4>
          <ul>
            ${topCategories.map(cat => `
              <li>${cat.name}: ${cat.amount.toLocaleString()} VND</li>
            `).join("")}
          </ul>
        </div>
      </div>
    `
  }),

  savingsGoalReached: ({
    goalName,
    targetAmount,
    completedDate
  }: {
    goalName: string
    targetAmount: number
    completedDate: Date
  }) => ({
    subject: `Congratulations! Savings Goal Reached: ${goalName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🎉 Savings Goal Achieved!</h2>
        <p>Congratulations! You've reached your savings goal:</p>
        <ul>
          <li>Goal: ${goalName}</li>
          <li>Target Amount: ${targetAmount.toLocaleString()} VND</li>
          <li>Completed Date: ${completedDate.toLocaleDateString()}</li>
        </ul>
        <p>Keep up the great work with your financial goals!</p>
      </div>
    `
  })
}
