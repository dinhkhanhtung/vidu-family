import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
  date: z.date(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
