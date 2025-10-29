"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

const responseTimeData = [
  { time: "00:00", responseTime: 120, requests: 45 },
  { time: "04:00", responseTime: 110, requests: 32 },
  { time: "08:00", responseTime: 150, requests: 78 },
  { time: "12:00", responseTime: 180, requests: 95 },
  { time: "16:00", responseTime: 160, requests: 87 },
  { time: "20:00", responseTime: 140, requests: 67 },
]

const endpointData = [
  { endpoint: "/api/users", requests: 15420, avgResponse: 145, errors: 12 },
  { endpoint: "/api/transactions", requests: 12890, avgResponse: 167, errors: 8 },
  { endpoint: "/api/subscriptions", requests: 8930, avgResponse: 123, errors: 15 },
  { endpoint: "/api/budgets", requests: 6740, avgResponse: 134, errors: 5 },
  { endpoint: "/api/auth", requests: 4520, avgResponse: 98, errors: 3 },
]

export function ApiHealthChart() {
  return (
    <div className="space-y-6">
      {/* Response Time Chart */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Response Time (24h)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={responseTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `${value}ms`}
            />
            <Tooltip
              content={({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Time
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {label}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Response Time
                          </span>
                          <span className="font-bold">
                            {payload[0]?.value}ms
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Requests
                          </span>
                          <span className="font-bold">
                            {payload[1]?.value}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="responseTime"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Endpoint Performance Table */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Endpoint Performance</h3>
        <div className="rounded-md border">
          <div className="grid grid-cols-4 gap-4 p-4 font-medium text-sm border-b">
            <div>Endpoint</div>
            <div>Requests</div>
            <div>Avg Response</div>
            <div>Error Rate</div>
          </div>
          {endpointData.map((endpoint, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 p-4 text-sm border-b last:border-b-0">
              <div className="font-mono text-xs">{endpoint.endpoint}</div>
              <div>{endpoint.requests.toLocaleString()}</div>
              <div>{endpoint.avgResponse}ms</div>
              <div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  endpoint.errors < 5
                    ? 'bg-green-100 text-green-800'
                    : endpoint.errors < 10
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {((endpoint.errors / endpoint.requests) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
