"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Settings, CreditCard, FileText, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

const mockActivityLogs = [
  {
    id: "1",
    user: "john.doe@example.com",
    action: "USER_LOGIN",
    description: "User logged in",
    timestamp: new Date("2024-01-15T10:30:00"),
    ipAddress: "192.168.1.100",
    userAgent: "Chrome/120.0.0.0",
    severity: "INFO",
  },
  {
    id: "2",
    user: "jane.smith@example.com",
    action: "SUBSCRIPTION_UPGRADED",
    description: "Upgraded to Premium plan",
    timestamp: new Date("2024-01-15T09:15:00"),
    ipAddress: "192.168.1.101",
    userAgent: "Firefox/120.0.0.0",
    severity: "INFO",
  },
  {
    id: "3",
    user: "mike.johnson@example.com",
    action: "PASSWORD_CHANGED",
    description: "Password changed successfully",
    timestamp: new Date("2024-01-15T08:45:00"),
    ipAddress: "192.168.1.102",
    userAgent: "Safari/17.0.0.0",
    severity: "INFO",
  },
  {
    id: "4",
    user: "sarah.wilson@example.com",
    action: "BUDGET_ALERT",
    description: "Budget limit exceeded: Marketing (95%)",
    timestamp: new Date("2024-01-15T08:30:00"),
    ipAddress: "192.168.1.103",
    userAgent: "Chrome/120.0.0.0",
    severity: "WARNING",
  },
  {
    id: "5",
    user: "david.brown@example.com",
    action: "FAILED_LOGIN",
    description: "Failed login attempt",
    timestamp: new Date("2024-01-15T08:15:00"),
    ipAddress: "203.0.113.1",
    userAgent: "Chrome/120.0.0.0",
    severity: "ERROR",
  },
  {
    id: "6",
    user: "admin@company.com",
    action: "USER_SUSPENDED",
    description: "Suspended user account: spam_violation",
    timestamp: new Date("2024-01-15T08:00:00"),
    ipAddress: "10.0.0.50",
    userAgent: "Chrome/120.0.0.0",
    severity: "CRITICAL",
  },
]

export function UserActivityLogs() {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "INFO":
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
      case "WARNING":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "ERROR":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case "CRITICAL":
        return <Badge className="bg-purple-100 text-purple-800">Critical</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "USER_LOGIN":
        return <User className="h-4 w-4" />
      case "SUBSCRIPTION_UPGRADED":
      case "PASSWORD_CHANGED":
        return <Settings className="h-4 w-4" />
      case "PAYMENT_SUCCESS":
        return <CreditCard className="h-4 w-4" />
      case "BUDGET_ALERT":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="USER_LOGIN">Login</SelectItem>
              <SelectItem value="SUBSCRIPTION_UPGRADED">Subscription</SelectItem>
              <SelectItem value="PASSWORD_CHANGED">Password</SelectItem>
              <SelectItem value="BUDGET_ALERT">Budget Alert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>IP Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockActivityLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <div className="flex flex-col">
                  <div className="flex items-center text-sm">
                    <Clock className="mr-1 h-3 w-3" />
                    {format(log.timestamp, "HH:mm:ss")}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(log.timestamp, "MMM dd, yyyy")}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{log.user}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {getActionIcon(log.action)}
                  <span className="ml-2 text-sm">{log.action.replace('_', ' ')}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{log.description}</span>
              </TableCell>
              <TableCell>
                {getSeverityBadge(log.severity)}
              </TableCell>
              <TableCell>
                <span className="text-sm font-mono">{log.ipAddress}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
