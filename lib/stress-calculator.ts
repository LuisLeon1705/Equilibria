import type { Event } from "@/types"

export interface StressMetrics {
  stressLevel: number
  density: number
  highPriorityCount: number
  hasInsufficientBuffers: boolean
  recommendations: string[]
}

export function calculateStressMetrics(events: Event[], weekStart: Date, weekEnd: Date): StressMetrics {
  const weekEvents = events.filter((e) => {
    const eventDate = new Date(e.start_time)
    return eventDate >= weekStart && eventDate <= weekEnd
  })

  let stressLevel = 3

  // Calculate density (percentage of time occupied by events)
  const weekDurationMinutes = (weekEnd.getTime() - weekStart.getTime()) / (1000 * 60)
  const eventMinutes = weekEvents.reduce((sum, e) => {
    const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60)
    return sum + duration
  }, 0)
  const density = eventMinutes / weekDurationMinutes

  // Add stress based on density
  if (density > 0.8) stressLevel += 3
  else if (density > 0.6) stressLevel += 2
  else if (density > 0.4) stressLevel += 1

  // Count high-priority events
  const highPriorityCount = weekEvents.filter((e) => e.priority >= 4).length
  stressLevel += Math.min(highPriorityCount, 3)

  // Check for gaps between events
  const sortedEvents = [...weekEvents].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
  )

  let hasInsufficientBuffers = false
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const gapMinutes =
      (new Date(sortedEvents[i + 1].start_time).getTime() - new Date(sortedEvents[i].end_time).getTime()) / (1000 * 60)
    if (gapMinutes < 15) {
      hasInsufficientBuffers = true
      stressLevel += 1
      break
    }
  }

  // Cap stress at 10
  stressLevel = Math.min(stressLevel, 10)

  // Generate recommendations
  const recommendations: string[] = []
  if (density > 0.7) {
    recommendations.push("Consider rescheduling or delegating some tasks")
  }
  if (hasInsufficientBuffers) {
    recommendations.push("Add more buffer time between events")
  }
  if (highPriorityCount > 3) {
    recommendations.push("Too many high-priority items - consider prioritizing")
  }

  return {
    stressLevel,
    density,
    highPriorityCount,
    hasInsufficientBuffers,
    recommendations,
  }
}
