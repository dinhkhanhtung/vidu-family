"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Premium", value: 28450, users: 142, color: "#8B5CF6" },
  { name: "Basic", value: 12340, users: 185, color: "#3B82F6" },
  { name: "Free", value: 0, users: 2520, color: "#6B7280" },
]

export function RevenueByPlanChart() {
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Plan
              </span>
              <span className="font-bold text-muted-foreground">
                {data.name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Revenue
              </span>
              <span className="font-bold">
                ${data.value.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Users
              </span>
              <span className="font-bold">
                {data.users}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={renderCustomTooltip} />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 text-center">
        {data.map((item) => (
          <div key={item.name} className="space-y-1">
            <div
              className="w-4 h-4 rounded-full mx-auto"
              style={{ backgroundColor: item.color }}
            />
            <div className="text-sm font-medium">{item.name}</div>
            <div className="text-xs text-muted-foreground">
              {item.users} users
            </div>
            <div className="text-sm font-bold">
              ${item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
