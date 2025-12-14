"use client"

import { useEffect, useState } from "react"
import type { TimePeriod, StressMetrics } from "@/lib/stress-calculator-improved"
import { calculateStressMetrics, getStressGradient } from "@/lib/stress-calculator-improved"
import type { Event } from "@/types"
import { AlertCircle, Zap } from "lucide-react"

interface StressIndicatorProps {
  events: Event[]
  period: TimePeriod
  colorLow?: string
  colorHigh?: string
  onPeriodChange?: (period: TimePeriod) => void
}

export function StressIndicatorEnhanced({
  events,
  period = "week",
  colorLow = "#22c55e",
  colorHigh = "#ef4444",
  onPeriodChange,
}: StressIndicatorProps) {
  const [metrics, setMetrics] = useState<StressMetrics | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(period)

  // Keep selectedPeriod in sync if parent changes the prop
  useEffect(() => {
    setSelectedPeriod(period)
  }, [period])

  useEffect(() => {
    const now = new Date()
    let periodStart = new Date()
    let periodEnd = new Date()

    switch (selectedPeriod) {
      case "day": {
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
        break
      }
      case "week": {
        // use clones to avoid mutating `now`
        const clone = new Date(now)
        const dayOfWeek = clone.getDay()
        const diff = clone.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Monday as start
        periodStart = new Date(clone.getFullYear(), clone.getMonth(), diff)
        periodStart.setHours(0, 0, 0, 0)
        periodEnd = new Date(periodStart)
        periodEnd.setDate(periodEnd.getDate() + 6)
        periodEnd.setHours(23, 59, 59, 999)
        break
      }
      case "month": {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        break
      }
      case "year": {
        periodStart = new Date(now.getFullYear(), 0, 1)
        periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
        break
      }
    }

    const newMetrics = calculateStressMetrics(events, periodStart, periodEnd, selectedPeriod)
    setMetrics(newMetrics)
  }, [events, selectedPeriod])

  // Helper to ensure widths are valid percentages
  const clampPercent = (value: number) => `${Math.max(0, Math.min(100, value))}%`

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setSelectedPeriod(newPeriod)
    onPeriodChange?.(newPeriod)
  }

  if (!metrics) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  const getStressLabel = () => {
    if (metrics.stressLevel <= 3) return "Low"
    if (metrics.stressLevel <= 6) return "Medium"
    return "High"
  }

  const gradient = getStressGradient(metrics.stressLevel, colorLow, colorHigh)

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Stress Level</h3>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
          {getStressLabel()}
        </span>
      </div>

      <div className="flex gap-2">
        {(["day", "week", "month", "year"] as TimePeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              selectedPeriod === p ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Stress Level</span>
          <span className="text-sm font-bold text-foreground">{metrics.stressLevel}/10</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border">
          <div
            className="h-full transition-all duration-500 rounded-full shadow-lg"
            style={{
              width: clampPercent((metrics.stressLevel / 10) * 100),
              background: gradient,
            }}
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Schedule Density</span>
          <span className="font-medium text-foreground">{Math.round(metrics.density * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary/50 transition-all" style={{ width: clampPercent(metrics.density * 100) }} />
        </div>

        {metrics.highPriorityCount > 0 && (
          <p className="text-muted-foreground">
            <Zap className="w-3 h-3 inline mr-1 text-warning" />
            {metrics.highPriorityCount} high-priority item{metrics.highPriorityCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {metrics.recommendations.length > 0 && (
        <div className="pt-2 space-y-1 border-t border-border">
          {metrics.recommendations.map((rec, idx) => (
            <p key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{rec}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
