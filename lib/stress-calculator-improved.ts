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
      stressLevel: 0,
      density: 0,
      highPriorityCount: 0,
      hasInsufficientBuffers: false,
      recommendations: ["¡Tienes una agenda libre! Es un gran momento para relajarte."],
      period,
    }
  }

  // 1. Density
  const periodDurationMinutes = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60)
  const eventMinutes = periodEvents.reduce((sum, e) => {
    const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60)
    return sum + duration
  }, 0)
  const density = Math.min(1, eventMinutes / periodDurationMinutes)

  // 2. Density Score (0-5 points)
  const densityScore = density * 5

  // 3. Priority Value (0-5 points)
  const avgPriority = periodEvents.reduce((sum, e) => sum + e.priority, 0) / periodEvents.length
  const priorityValue = ((avgPriority - 1) / 4) * 5 // Scales average priority from 1-5 to a 0-5 value

  // 4. Density-based Multiplier (1x to 2x)
  const multiplier = 1 + density

  // 5. Priority Part (0-5 points)
  const priorityPart = (priorityValue * multiplier) / 2

  // 6. Total Stress (0-10 points)
  let stressLevel = densityScore + priorityPart

  // --- Other metrics for recommendations ---

  const highPriorityCount = periodEvents.filter((e) => e.priority >= 4).length
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
        break
      }
    }
  }

  // Final capping
  stressLevel = Math.min(Math.round(stressLevel), 10)

  // --- Recommendations ---
  const recommendations: string[] = []
  if (density > 0.8) {
    recommendations.push("Tu agenda está muy saturada. Considera buscar tiempo libre.")
  }
  if (avgPriority > 4) {
    recommendations.push("Tienes muchas tareas de alta prioridad. Intenta delegar o posponer algunas.")
  }
  if (hasInsufficientBuffers) {
    recommendations.push("Tienes eventos programados uno tras otro. Considera añadir tiempo de descanso.")
  }
  if (stressLevel === 0 && periodEvents.length > 0) {
    recommendations.push("¡Tu agenda se ve excelente! ¡Sigue así!")
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
