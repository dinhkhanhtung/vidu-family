"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", churnRate: 4.2, newCustomers: 145, churnedCustomers: 6 },
  { month: "Feb", churnRate: 3.8, newCustomers: 167, churnedCustomers: 6 },
  { month: "Mar", churnRate: 4.1, newCustomers: 132, churnedCustomers: 5 },
  { month: "Apr", churnRate: 3.5, newCustomers: 189, churnedCustomers: 7 },
  { month: "May", churnRate: 3.2, newCustomers: 201, churnedCustomers: 6 },
  { month: "Jun", churnRate: 3.7, newCustomers: 178, churnedCustomers: 7 },
  { month: "Jul", churnRate: 3.0, newCustomers: 234, churnedCustomers: 7 },
  { month: "Aug", churnRate: 2.8, newCustomers: 256, churnedCustomers: 7 },
  { month: "Sep", churnRate: 3.1, newCustomers: 198, churnedCustomers: 6 },
  { month: "Oct", churnRate: 2.9, newCustomers: 267, churnedCustomers: 8 },
  { month: "Nov", churnRate: 2.6, newCustomers: 289, churnedCustomers: 8 },
  { month: "Dec", churnRate: 3.2, newCustomers: 301, churnedCustomers: 10 },
]

export function ChurnAnalysisChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
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
          tickFormatter={(value: number) => `${value}%`}
        />
        <Tooltip
          content={({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Month
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {label}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Churn Rate
                      </span>
                      <span className="font-bold">
                        {payload[0]?.value}%
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        New Customers
                      </span>
                      <span className="font-bold">
                        {payload[1]?.value}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Churned
                      </span>
                      <span className="font-bold">
                        {payload[2]?.value}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="churnRate"
          stroke="hsl(var(--destructive))"
          strokeWidth={2}
          name="Churn Rate (%)"
        />
        <Line
          type="monotone"
          dataKey="newCustomers"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="New Customers"
        />
        <Line
          type="monotone"
          dataKey="churnedCustomers"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={2}
          name="Churned Customers"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
