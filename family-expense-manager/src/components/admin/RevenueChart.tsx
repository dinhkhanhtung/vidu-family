"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", mrr: 8500, arr: 102000 },
  { month: "Feb", mrr: 9200, arr: 110400 },
  { month: "Mar", mrr: 8800, arr: 105600 },
  { month: "Apr", mrr: 10500, arr: 126000 },
  { month: "May", mrr: 11200, arr: 134400 },
  { month: "Jun", mrr: 10800, arr: 129600 },
  { month: "Jul", mrr: 12500, arr: 150000 },
  { month: "Aug", mrr: 13200, arr: 158400 },
  { month: "Sep", mrr: 12800, arr: 153600 },
  { month: "Oct", mrr: 14500, arr: 174000 },
  { month: "Nov", mrr: 15200, arr: 182400 },
  { month: "Dec", mrr: 15800, arr: 189600 },
]

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
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
          tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
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
                        MRR
                      </span>
                      <span className="font-bold">
                        ${payload[0]?.value?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        ARR
                      </span>
                      <span className="font-bold">
                        ${payload[1]?.value?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar
          dataKey="mrr"
          fill="hsl(var(--primary))"
          radius={[2, 2, 0, 0]}
        />
        <Bar
          dataKey="arr"
          fill="hsl(var(--primary))"
          radius={[2, 2, 0, 0]}
          opacity={0.6}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
