import { z } from "zod"

export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.number().min(0.01, "Target amount must be greater than 0"),
  deadline: z.date().optional(),
  category: z.string().min(1, "Category is required")
}).refine((data) => {
  if (data.deadline) {
    return data.deadline > new Date()
  }
  return true
}, {
  message: "Deadline must be in the future",
  path: ["deadline"]
})

export type SavingsGoalFormData = z.infer<typeof savingsGoalSchema>

export const savingsContributionSchema = z.object({
  goalId: z.string().min(1, "Goal ID is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional()
})

export type SavingsContributionData = z.infer<typeof savingsContributionSchema>
