import type { Event } from "@/types"

export interface BufferConfig {
  baseBufferMinutes: number
  examMultiplier: number
  projectMultiplier: number
  workMultiplier: number
  maxBufferMinutes: number
  minBufferMinutes: number
}

export const DEFAULT_BUFFER_CONFIG: BufferConfig = {
  baseBufferMinutes: 15,
  examMultiplier: 3, // 45 minutes after exams
  projectMultiplier: 2, // 30 minutes after projects
  workMultiplier: 1.5, // 22.5 minutes after work
  maxBufferMinutes: 120,
  minBufferMinutes: 5,
}

export function calculateDynamicBuffers(
  events: Event[],
  config: BufferConfig = DEFAULT_BUFFER_CONFIG,
): Array<{
  afterEventId: string
  durationMinutes: number
  reason: string
}> {
  const sortedEvents = [...events].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  const buffers: Array<{
    afterEventId: string
    durationMinutes: number
    reason: string
  }> = []

  // Calculate buffer after each event based on type and priority
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const currentEvent = sortedEvents[i]
    const nextEvent = sortedEvents[i + 1]

    // Calculate existing gap between events
    const gapMinutes =
      (new Date(nextEvent.start_time).getTime() - new Date(currentEvent.end_time).getTime()) / (1000 * 60)

    // Determine base buffer needed
    let bufferMultiplier = 1

    if (currentEvent.type === "exam") {
      bufferMultiplier = config.examMultiplier
    } else if (currentEvent.type === "project") {
      bufferMultiplier = config.projectMultiplier
    } else if (currentEvent.type === "work") {
      bufferMultiplier = config.workMultiplier
    }

    // Add priority influence
    if (currentEvent.priority >= 8) {
      bufferMultiplier *= 1.3
    } else if (currentEvent.priority >= 6) {
      bufferMultiplier *= 1.1
    }

    let recommendedBuffer = config.baseBufferMinutes * bufferMultiplier
    recommendedBuffer = Math.min(recommendedBuffer, config.maxBufferMinutes)
    recommendedBuffer = Math.max(recommendedBuffer, config.minBufferMinutes)

    // Only add buffer if gap is insufficient
    if (gapMinutes < recommendedBuffer) {
      const bufferNeeded = recommendedBuffer - gapMinutes

      buffers.push({
        afterEventId: currentEvent.id,
        durationMinutes: Math.round(bufferNeeded),
        reason: `Buffer after ${currentEvent.type} (priority ${currentEvent.priority})`,
      })
    }
  }

  return buffers
}

export function getRiskMetrics(events: Event[], buffers: Array<{ afterEventId: string; durationMinutes: number }>) {
  const sortedEvents = [...events].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  const metricsPerDay: Record<string, { eventCount: number; bufferedEvents: number }> = {}

  // Group events by day
  events.forEach((event) => {
    const date = event.start_time.split("T")[0]
    if (!metricsPerDay[date]) {
      metricsPerDay[date] = { eventCount: 0, bufferedEvents: 0 }
    }
    metricsPerDay[date].eventCount++
  })

  // Count buffered events
  buffers.forEach((buffer) => {
    const event = events.find((e) => e.id === buffer.afterEventId)
    if (event) {
      const date = event.start_time.split("T")[0]
      if (metricsPerDay[date]) {
        metricsPerDay[date].bufferedEvents++
      }
    }
  })

  return metricsPerDay
}

export function getBufferRecommendations(
  events: Event[],
  buffers: Array<{ afterEventId: string; durationMinutes: number }>,
): string[] {
  const recommendations: string[] = []
  const riskMetrics = getRiskMetrics(events, buffers)

  // Check for days with too many events
  Object.values(riskMetrics).forEach((metrics) => {
    if (metrics.eventCount > 6) {
      recommendations.push(`Considera reducir eventos en días con ${metrics.eventCount} actividades`)
    }
  })

  // Check for insufficient buffers
  if (buffers.length > 5) {
    recommendations.push("Tu agenda tiene muchos eventos seguidos - agrega más espacios entre tareas")
  }

  // Check for high-priority clustering
  const highPriorityEvents = events.filter((e) => e.priority >= 8)
  if (highPriorityEvents.length > 3) {
    recommendations.push("Tienes muchos elementos de prioridad crítica - considera distribuirlos mejor")
  }

  return recommendations
}
