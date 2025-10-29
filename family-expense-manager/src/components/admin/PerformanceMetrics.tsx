"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, Cpu, HardDrive, Wifi, Zap, Clock } from "lucide-react"

const performanceData = [
  {
    metric: "CPU Usage",
    current: 45,
    average: 42,
    peak: 78,
    status: "good",
    unit: "%",
    icon: Cpu,
  },
  {
    metric: "Memory Usage",
    current: 67,
    average: 63,
    peak: 89,
    status: "warning",
    unit: "%",
    icon: Activity,
  },
  {
    metric: "Disk I/O",
    current: 23,
    average: 28,
    peak: 45,
    status: "good",
    unit: "MB/s",
    icon: HardDrive,
  },
  {
    metric: "Network I/O",
    current: 156,
    average: 142,
    peak: 298,
    status: "good",
    unit: "Mbps",
    icon: Wifi,
  },
  {
    metric: "Response Time",
    current: 145,
    average: 138,
    peak: 234,
    status: "good",
    unit: "ms",
    icon: Clock,
  },
  {
    metric: "Throughput",
    current: 1250,
    average: 1180,
    peak: 1890,
    status: "excellent",
    unit: "req/s",
    icon: Zap,
  },
]

export function PerformanceMetrics() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
      case "good":
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500"
      case "good":
        return "bg-blue-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {performanceData.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.metric}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metric.current}{metric.unit}
                  </span>
                  {getStatusBadge(metric.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current</span>
                    <span>{metric.current}{metric.unit}</span>
                  </div>
                  <Progress
                    value={metric.current}
                    max={100}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Average:</span>
                    <div className="font-medium">{metric.average}{metric.unit}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peak:</span>
                    <div className="font-medium">{metric.peak}{metric.unit}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
