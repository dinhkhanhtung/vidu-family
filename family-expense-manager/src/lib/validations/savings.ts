import { z } from "zod"

export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.number().min(0.01, "Target amount must be greater than 0"),
  targetDate: z.date(),
  description: z.string().optional()
}).refine((data) => {
  return data.targetDate > new Date()
}, {
  message: "Target date must be in the future",
  path: ["targetDate"]
})

export type SavingsGoalFormData = z.infer<typeof savingsGoalSchema>

export const savingsContributionSchema = z.object({
  goalId: z.string().min(1, "Goal ID is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional()
})

export type SavingsContributionData = z.infer<typeof savingsContributionSchema>