"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", users: 1200, newUsers: 120 },
  { month: "Feb", users: 1350, newUsers: 150 },
  { month: "Mar", users: 1480, newUsers: 130 },
  { month: "Apr", users: 1620, newUsers: 140 },
  { month: "May", users: 1800, newUsers: 180 },
  { month: "Jun", users: 1950, newUsers: 150 },
  { month: "Jul", users: 2100, newUsers: 150 },
  { month: "Aug", users: 2300, newUsers: 200 },
  { month: "Sep", users: 2450, newUsers: 150 },
  { month: "Oct", users: 2650, newUsers: 200 },
  { month: "Nov", users: 2800, newUsers: 150 },
  { month: "Dec", users: 2847, newUsers: 47 },
]

export function UserGrowthChart() {
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
          tickFormatter={(value: number) => `${value}`}
        />
        <Tooltip
          content={({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
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
                        Total Users
                      </span>
                      <span className="font-bold">
                        {payload[0].value}
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
          dataKey="users"
          strokeWidth={2}
          activeDot={{
            r: 6,
            style: { fill: "hsl(var(--primary))", opacity: 0.25 },
          }}
          style={{
            stroke: "hsl(var(--primary))",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
