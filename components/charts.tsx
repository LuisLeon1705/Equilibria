"use client"

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function LineChart({ data }: { data: { name: string; stress: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-secondary/30 rounded-lg">
        <p className="text-muted-foreground text-sm">Not enough data to display chart.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RechartsLineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="stress" stroke="#8884d8" activeDot={{ r: 8 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export function BarChart({
  data,
  colors,
}: {
  data: { label: string; value: number }[]
  colors?: string[]
}) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0)

  if (!data || data.length === 0 || totalValue === 0) {
    return (
      <div className="w-full h-24 flex items-center justify-center bg-secondary/30 rounded-lg">
        <p className="text-muted-foreground text-sm">No tasks to display.</p>
      </div>
    )
  }

  const defaultColors = ["var(--stress-low)", "var(--muted)"]

  return (
    <div className="w-full space-y-4">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">{item.label}</span>
            <span className="text-muted-foreground">{item.value}</span>
          </div>
          <div className="w-full h-8 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${(item.value / totalValue) * 100}%`,
                backgroundColor: colors?.[i] || defaultColors[i],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
