"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, CreditCard, Calendar, DollarSign, Users } from "lucide-react"
import { format } from "date-fns"

const mockSubscriptions = [
  {
    id: "1",
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    plan: "Premium",
    status: "ACTIVE",
    amount: 29.99,
    currency: "USD",
    currentPeriodStart: new Date("2024-01-01"),
    currentPeriodEnd: new Date("2024-02-01"),
    trialEnd: null,
    cancelAtPeriodEnd: false,
  },
  {
    id: "2",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    plan: "Basic",
    status: "TRIALING",
    amount: 9.99,
    currency: "USD",
    currentPeriodStart: new Date("2024-01-10"),
    currentPeriodEnd: new Date("2024-02-10"),
    trialEnd: new Date("2024-01-25"),
    cancelAtPeriodEnd: false,
  },
  {
    id: "3",
    userName: "Mike Johnson",
    userEmail: "mike.johnson@example.com",
    plan: "Premium",
    status: "CANCELED",
    amount: 29.99,
    currency: "USD",
    currentPeriodStart: new Date("2023-12-01"),
    currentPeriodEnd: new Date("2024-01-01"),
    trialEnd: null,
    cancelAtPeriodEnd: true,
  },
]

export function SubscriptionManagement() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "TRIALING":
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>
      case "CANCELED":
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>
      case "PAST_DUE":
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "Premium":
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
      case "Basic":
        return <Badge className="bg-blue-100 text-blue-800">Basic</Badge>
      case "Free":
        return <Badge variant="outline">Free</Badge>
      default:
        return <Badge variant="outline">{plan}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Total MRR</p>
            <p className="text-2xl font-bold">$12,450</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Active Subscriptions</p>
            <p className="text-2xl font-bold">342</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Churn Rate</p>
            <p className="text-2xl font-bold">3.2%</p>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Current Period</TableHead>
            <TableHead>Trial End</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockSubscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{subscription.userName}</span>
                  <span className="text-sm text-muted-foreground">{subscription.userEmail}</span>
                </div>
              </TableCell>
              <TableCell>
                {getPlanBadge(subscription.plan)}
              </TableCell>
              <TableCell>
                {getStatusBadge(subscription.status)}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className="font-medium">${subscription.amount}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    /{subscription.plan === "Premium" ? "month" : "month"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span>{format(subscription.currentPeriodStart, "MMM dd")}</span>
                  <span className="text-muted-foreground">
                    to {format(subscription.currentPeriodEnd, "MMM dd, yyyy")}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {subscription.trialEnd ? (
                  <span className="text-sm">{format(subscription.trialEnd, "MMM dd, yyyy")}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Change Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Cancel Subscription
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      View Invoices
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Force Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
