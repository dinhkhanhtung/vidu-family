"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Clock, Server, Database, ExternalLink } from "lucide-react"
import { format } from "date-fns"

const mockErrorLogs = [
  {
    id: "1",
    timestamp: new Date("2024-01-15T10:30:00"),
    level: "ERROR",
    source: "API",
    message: "Failed to connect to payment gateway",
    details: "Connection timeout after 30 seconds",
    stackTrace: "Error: ETIMEDOUT\n    at PaymentService.processPayment (/app/services/payment.js:45:12)",
    userId: "user_123",
    requestId: "req_abc123",
  },
  {
    id: "2",
    timestamp: new Date("2024-01-15T10:25:00"),
    level: "WARNING",
    source: "DATABASE",
    message: "Slow query detected",
    details: "Query took 5.2 seconds to execute",
    stackTrace: "SELECT * FROM transactions WHERE user_id = ? AND created_at > ?",
    userId: null,
    requestId: "req_def456",
  },
  {
    id: "3",
    timestamp: new Date("2024-01-15T10:20:00"),
    level: "CRITICAL",
    source: "API",
    message: "Rate limit exceeded",
    details: "Too many requests from IP 192.168.1.100",
    stackTrace: "RateLimitError: Too many requests\n    at RateLimiter.checkLimit (/app/middleware/rate-limit.js:78:15)",
    userId: "user_456",
    requestId: "req_ghi789",
  },
  {
    id: "4",
    timestamp: new Date("2024-01-15T10:15:00"),
    level: "ERROR",
    source: "DATABASE",
    message: "Connection pool exhausted",
    details: "All 20 database connections are in use",
    stackTrace: "PoolExhaustedError: No connections available\n    at Database.getConnection (/app/database/pool.js:123:18)",
    userId: null,
    requestId: "req_jkl012",
  },
  {
    id: "5",
    timestamp: new Date("2024-01-15T10:10:00"),
    level: "WARNING",
    source: "API",
    message: "Deprecated endpoint accessed",
    details: "User accessed /api/v1/legacy endpoint",
    stackTrace: "DeprecationWarning: Endpoint /api/v1/legacy is deprecated\n    at APIRouter.handle (/app/routes/api.js:234:20)",
    userId: "user_789",
    requestId: "req_mno345",
  },
]

export function ErrorLogsTable() {
  const getLevelBadge = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      case "ERROR":
        return <Badge className="bg-orange-100 text-orange-800">Error</Badge>
      case "WARNING":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "INFO":
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "API":
        return <Server className="h-4 w-4" />
      case "DATABASE":
        return <Database className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="auth">Authentication</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Clear Logs
          </Button>
          <Button variant="outline" size="sm">
            Export Logs
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Request ID</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockErrorLogs.map((log) => (
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
                {getLevelBadge(log.level)}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {getSourceIcon(log.source)}
                  <span className="ml-2 text-sm">{log.source}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-sm">{log.message}</div>
                  <div className="text-xs text-muted-foreground">{log.details}</div>
                </div>
              </TableCell>
              <TableCell>
                {log.userId ? (
                  <span className="text-sm">{log.userId}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">System</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm font-mono">{log.requestId}</span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
