"use client"

export function LineChart({ data }: { data: number[] }) {
  if (!data || data.length < 2) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-secondary/30 rounded-lg">
        <p className="text-muted-foreground text-sm">Not enough data to display chart.</p>
      </div>
    )
  }

  const maxValue = Math.max(...data, 1)
  const chartHeight = 160
  const chartWidth = 300

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * chartWidth
      const y = chartHeight - (value / maxValue) * chartHeight
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="w-full h-48 bg-secondary/30 rounded-lg p-4">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
        <polyline
          fill="none"
          stroke="var(--color-primary, #007bff)"
          strokeWidth="2"
          points={points}
        />
        {data.map((value, i) => {
          const x = (i / (data.length - 1)) * chartWidth
          const y = chartHeight - (value / maxValue) * chartHeight
          return <circle key={i} cx={x} cy={y} r="3" fill="var(--color-primary, #007bff)" />
        })}
      </svg>
    </div>
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
