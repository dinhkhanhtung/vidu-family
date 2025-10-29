export interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  notes: string | null;
  date: Date;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  categoryId: string;
  accountId: string;
  workspaceId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
    type: "INCOME" | "EXPENSE";
  };
  account?: {
    id: string;
    name: string;
    type: "CASH" | "BANK_ACCOUNT" | "CREDIT_CARD" | "E_WALLET" | "INVESTMENT" | "OTHER";
  };
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  type: "INCOME" | "EXPENSE";
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialAccount {
  id: string;
  name: string;
  type: "CASH" | "BANK_ACCOUNT" | "CREDIT_CARD" | "E_WALLET" | "INVESTMENT" | "OTHER";
  balance: number;
  currency: string;
  isActive: boolean;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionFilters {
  search?: string;
  categoryId?: string;
  accountId?: string;
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
}
