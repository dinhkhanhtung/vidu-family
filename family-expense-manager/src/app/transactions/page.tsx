'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, Filter, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Transaction } from '@/types/transaction'

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color?: string | null
}

interface FinancialAccount {
  id: string
  name: string
  type: string
}

export default function TransactionsPage() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<(Transaction & { category: Category; account: FinancialAccount })[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Partial<Transaction> | undefined>()
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState<string>('')

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    categoryId: '',
    accountId: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  })

  useEffect(() => {
    if (session?.user?.id) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    try {
      // For now, create a demo workspace and categories/accounts
      // In a real app, you'd get user's workspaces
      const demoWorkspaceId = crypto.randomUUID()

      // Demo categories
      const demoCategories: Category[] = [
        { id: '1', name: 'Ăn uống', type: 'EXPENSE', color: '#EF4444' },
        { id: '2', name: 'Di chuyển', type: 'EXPENSE', color: '#F97316' },
        { id: '3', name: 'Lương', type: 'INCOME', color: '#22C55E' },
        { id: '4', name: 'Thưởng', type: 'INCOME', color: '#10B981' },
      ]

      // Demo accounts
      const demoAccounts: FinancialAccount[] = [
        { id: '1', name: 'Tiền mặt', type: 'CASH' },
        { id: '2', name: 'Ví điện tử', type: 'E_WALLET' },
      ]

      setWorkspaceId(demoWorkspaceId)
      setCategories(demoCategories)
      setAccounts(demoAccounts)
      setTransactions([])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransaction = async (data: any) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, workspaceId }),
      })

      if (response.ok) {
        const newTransaction = await response.json()
        setTransactions(prev => [newTransaction, ...prev])
        setIsFormOpen(false)
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
    }
  }

  const handleUpdateTransaction = async (data: any) => {
    try {
      const response = await fetch(`/api/transactions/${editingTransaction?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updatedTransaction = await response.json()
        setTransactions(prev =>
          prev.map(t => t.id === updatedTransaction.id ? { ...updatedTransaction, category: t.category, account: t.account } : t)
        )
        setEditingTransaction(undefined)
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTransactions(prev => prev.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.type && !filters.type.includes(transaction.type)) return false
    if (filters.categoryId && transaction.categoryId !== filters.categoryId) return false
    if (filters.accountId && transaction.accountId !== filters.accountId) return false
    if (filters.search && !transaction.description?.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return <div className="flex justify-center p-8">Đang tải...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Giao dịch</h1>

        <Dialog open={isFormOpen || !!editingTransaction} onOpenChange={(open: boolean) => {
          setIsFormOpen(open)
          if (!open) setEditingTransaction(undefined)
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm giao dịch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Cập nhật giao dịch' : 'Thêm giao dịch mới'}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              categories={categories}
              accounts={accounts}
              onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingTransaction(undefined)
              }}
              initialData={editingTransaction ? {
                amount: (editingTransaction as any).amount ?? 0,
                description: editingTransaction.description ?? '',
                notes: (editingTransaction as any).notes ?? '',
                date: editingTransaction.date ? new Date(editingTransaction.date as any) : new Date(),
                type: (editingTransaction.type === 'TRANSFER' ? 'EXPENSE' : editingTransaction.type) ?? 'EXPENSE',
                category: typeof editingTransaction.category?.name === 'string'
                  ? editingTransaction.category.name
                  : (editingTransaction.category as any)?.name || '',
              } : undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Select value={filters.type} onValueChange={(value: string) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Loại giao dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                <SelectItem value="INCOME">Thu nhập</SelectItem>
                <SelectItem value="EXPENSE">Chi tiêu</SelectItem>
                <SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.categoryId} onValueChange={(value: string) => setFilters(prev => ({ ...prev, categoryId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.accountId} onValueChange={(value: string) => setFilters(prev => ({ ...prev, accountId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Tài khoản" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Tìm kiếm..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />

            <Button variant="outline" onClick={() => setFilters({
              type: '',
              categoryId: '',
              accountId: '',
              dateFrom: '',
              dateTo: '',
              search: '',
            })}>
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có giao dịch nào. Hãy thêm giao dịch đầu tiên!
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: transaction.category?.color || '#6B7280' }}
                    />
                    <div>
                      <div className="font-medium">{transaction.category?.name}</div>
                      <div className="text-sm text-gray-600">{transaction.description}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: vi })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`font-mono font-bold ${
                        transaction.type === 'INCOME' ? 'text-green-600' :
                        transaction.type === 'EXPENSE' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : transaction.type === 'EXPENSE' ? '-' : ''}
                        {transaction.amount?.toLocaleString('vi-VN')} ₫
                      </div>
                      <div className="text-sm text-gray-500">{transaction.account?.name}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTransaction(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
