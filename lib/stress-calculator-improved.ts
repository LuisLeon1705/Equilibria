import type { Event } from "@/types"

export type TimePeriod = "day" | "week" | "month" | "year"

export interface StressMetrics {
  stressLevel: number
  density: number
  highPriorityCount: number
  hasInsufficientBuffers: boolean
  recommendations: string[]
  period: TimePeriod
}

export function calculateStressMetrics(
  events: Event[],
  periodStart: Date,
  periodEnd: Date,
  period: TimePeriod = "week",
): StressMetrics {
  const periodEvents = events.filter((e) => {
    const eventDate = new Date(e.start_time)
    return eventDate >= periodStart && eventDate <= periodEnd
  })

  if (periodEvents.length === 0) {
    return {
      stressLevel: 1,
      density: 0,
      highPriorityCount: 0,
      hasInsufficientBuffers: false,
      recommendations: ["You have a free schedule - great time to relax!"],
      period,
    }
  }

  let stressLevel = 2

  // Calculate density based on period
  const periodDurationMinutes = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60)
  const eventMinutes = periodEvents.reduce((sum, e) => {
    const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60)
    return sum + duration
  }, 0)
  const density = eventMinutes / periodDurationMinutes

  // Adjust density thresholds based on period
  const densityThresholds = {
    day: { high: 0.7, medium: 0.4, low: 0 },
    week: { high: 0.6, medium: 0.35, low: 0 },
    month: { high: 0.4, medium: 0.2, low: 0 },
    year: { high: 0.2, medium: 0.1, low: 0 },
  }

  const thresholds = densityThresholds[period]

  // Add stress based on density
  if (density > thresholds.high) stressLevel += 4
  else if (density > thresholds.medium) stressLevel += 2
  else if (density > thresholds.low) stressLevel += 1

  // Count high-priority events
  const highPriorityCount = periodEvents.filter((e) => e.priority >= 4).length
  stressLevel += Math.min(highPriorityCount * 0.8, 3)

  // Check for gaps between events (only for day view)
  let hasInsufficientBuffers = false
  if (period === "day") {
    const sortedEvents = [...periodEvents].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    )

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const gapMinutes =
        (new Date(sortedEvents[i + 1].start_time).getTime() - new Date(sortedEvents[i].end_time).getTime()) /
        (1000 * 60)
      if (gapMinutes < 15) {
        hasInsufficientBuffers = true
        stressLevel += 2
        break
      }
    }
  } else if (period === "week") {
    // For week view, check daily density
    const dailyDensities: Record<string, number> = {}
    periodEvents.forEach((e) => {
      const dateStr = e.start_time.split("T")[0]
      if (!dailyDensities[dateStr]) dailyDensities[dateStr] = 0
      const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60)
      dailyDensities[dateStr] += duration
    })

    const heavyDays = Object.values(dailyDensities).filter((d) => d > 600).length
    if (heavyDays >= 3) {
      hasInsufficientBuffers = true
      stressLevel += 1
    }
  }

  // Cap stress at 10
  stressLevel = Math.min(Math.round(stressLevel), 10)

  // Generate recommendations based on period
  const recommendations: string[] = []
  if (density > thresholds.high * 0.8) {
    recommendations.push(`Your ${period} is quite packed - consider rescheduling some tasks`)
  }
  if (hasInsufficientBuffers) {
    recommendations.push("Add more buffer time between events")
  }
  if (highPriorityCount > 3) {
    recommendations.push("You have many high-priority items - focus on top 3")
  }
  if (stressLevel >= 7 && period === "week") {
    recommendations.push("Consider spreading some tasks to next week")
  }

  return {
    stressLevel,
    density,
    highPriorityCount,
    hasInsufficientBuffers,
    recommendations,
    period,
  }
}

export function getStressGradient(stressLevel: number, colorLow: string, colorHigh: string): string {
  const percentage = (stressLevel / 10) * 100
  return `linear-gradient(to right, ${colorLow} 0%, ${colorHigh} ${percentage}%, rgba(200,200,200,0.1) ${percentage}%, rgba(200,200,200,0.1) 100%)`
}
