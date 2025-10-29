import { z } from "zod"

export const budgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  categoryId: z.string().optional(),
  period: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean().default(true),
  alert80: z.boolean().default(false),
  alert90: z.boolean().default(false),
  alert100: z.boolean().default(false)
}).refine((data) => {
  return data.endDate > data.startDate
}, {
  message: "End date must be after start date",
  path: ["endDate"]
})

export type BudgetFormData = z.infer<typeof budgetSchema>

export const budgetAlertSchema = z.object({
  type: z.enum(["PERCENTAGE_80", "PERCENTAGE_90", "PERCENTAGE_100"]),
  threshold: z.number().min(0).max(100),
  triggered: z.boolean().default(false)
})

export type BudgetAlertData = z.infer<typeof budgetAlertSchema>

export default budgetSchema
