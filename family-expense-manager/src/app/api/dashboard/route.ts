import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getMonthRange(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
    return { start, end }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id
        const { start, end } = getMonthRange(new Date())

        const [incomeAgg, expenseAgg, recent] = await Promise.all([
            prisma.transaction.aggregate({
                where: { userId, type: 'INCOME', date: { gte: start, lte: end } },
                _sum: { amount: true }
            }),
            prisma.transaction.aggregate({
                where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
                _sum: { amount: true }
            }),
            prisma.transaction.findMany({
                where: { userId },
                select: { id: true, amount: true, description: true, date: true, type: true, category: true },
                orderBy: { date: 'desc' },
                take: 10
            })
        ])

        const totalIncome = incomeAgg._sum.amount ?? 0
        const totalExpense = expenseAgg._sum.amount ?? 0
        const balance = totalIncome - totalExpense

        return NextResponse.json({
            stats: { totalIncome, totalExpense, balance },
            recentTransactions: recent
        })
    } catch (error) {
        console.error('Dashboard API error:', error)
        return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
    }
}


