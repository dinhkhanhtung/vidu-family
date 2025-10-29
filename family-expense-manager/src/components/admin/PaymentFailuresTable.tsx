"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, CreditCard, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"

const mockPaymentFailures = [
  {
    id: "1",
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    amount: 29.99,
    currency: "USD",
    failureReason: "Insufficient funds",
    paymentMethod: "**** **** **** 4242",
    attemptDate: new Date("2024-01-15T10:30:00"),
    status: "PENDING",
    retryCount: 2,
  },
  {
    id: "2",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    amount: 9.99,
    currency: "USD",
    failureReason: "Card expired",
    paymentMethod: "**** **** **** 5555",
    attemptDate: new Date("2024-01-15T09:15:00"),
    status: "FAILED",
    retryCount: 0,
  },
  {
    id: "3",
    userName: "Mike Johnson",
    userEmail: "mike.johnson@example.com",
    amount: 29.99,
    currency: "USD",
    failureReason: "Transaction declined",
    paymentMethod: "**** **** **** 7777",
    attemptDate: new Date("2024-01-15T08:45:00"),
    status: "RESOLVED",
    retryCount: 1,
  },
  {
    id: "4",
    userName: "Sarah Wilson",
    userEmail: "sarah.wilson@example.com",
    amount: 29.99,
    currency: "USD",
    failureReason: "Insufficient funds",
    paymentMethod: "**** **** **** 8888",
    attemptDate: new Date("2024-01-15T08:30:00"),
    status: "PENDING",
    retryCount: 3,
  },
  {
    id: "5",
    userName: "David Brown",
    userEmail: "david.brown@example.com",
    amount: 9.99,
    currency: "USD",
    failureReason: "Card expired",
    paymentMethod: "**** **** **** 9999",
    attemptDate: new Date("2024-01-15T08:15:00"),
    status: "FAILED",
    retryCount: 0,
  },
]

export function PaymentFailuresTable() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "RESOLVED":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">Total Failures: {mockPaymentFailures.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Resolved: {mockPaymentFailures.filter(f => f.status === 'RESOLVED').length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">Pending: {mockPaymentFailures.filter(f => f.status === 'PENDING').length}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Retry All Pending
          </Button>
          <Button variant="outline" size="sm">
            Send Notifications
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Failure Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Retry Count</TableHead>
            <TableHead>Attempt Date</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPaymentFailures.map((failure) => (
            <TableRow key={failure.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{failure.userName}</span>
                  <span className="text-sm text-muted-foreground">{failure.userEmail}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className="font-medium">${failure.amount}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {failure.currency}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span className="font-mono text-sm">{failure.paymentMethod}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{failure.failureReason}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {getStatusIcon(failure.status)}
                  <span className="ml-2">{getStatusBadge(failure.status)}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={failure.retryCount > 2 ? "destructive" : "outline"}>
                  {failure.retryCount}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">{format(failure.attemptDate, "MMM dd, HH:mm")}</span>
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
                      Retry Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Contact User
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Update Payment Method
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Cancel Subscription
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
