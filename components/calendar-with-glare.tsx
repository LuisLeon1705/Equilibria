"use client"

import { useMemo, useState } from "react"
import { format, startOfWeek, addDays, subWeeks, addWeeks, endOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import type { Event } from "@/types"
import { calculateStressMetrics, getStressGradient } from "@/lib/stress-calculator-improved"
import { Button } from "@/components/ui/button"

interface CalendarWithGlareProps {
  events: Event[]
  colorLow?: string
  colorHigh?: string
}

const typeColors = {
  class: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  work: "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200",
  exam: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200",
  project: "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
  personal: "bg-gray-100 text-gray-900 dark:bg-gray-900/30 dark:text-gray-200",
}

const typeBadges = {
  class: "bg-blue-200 dark:bg-blue-900/50",
  work: "bg-green-200 dark:bg-green-900/50",
  exam: "bg-red-200 dark:bg-red-900/50",
  project: "bg-purple-200 dark:bg-purple-900/50",
  personal: "bg-gray-200 dark:bg-gray-900/50",
}

export function CalendarWithGlare({ events, colorLow = "#22c55e", colorHigh = "#ef4444" }: CalendarWithGlareProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [currentDate])

  const groupedEvents = useMemo(() => {
    const grouped: Record<string, Event[]> = {}
    weekDays.forEach((day) => {
      grouped[format(day, "yyyy-MM-dd")] = []
    })

    events.forEach((event) => {
      const eventDate = format(new Date(event.start_time), "yyyy-MM-dd")
      if (grouped[eventDate]) {
        grouped[eventDate].push(event)
      }
    })

    return grouped
  }, [events, weekDays])

  const dailyStressLevels = useMemo(() => {
    const stress: Record<string, number> = {}
    weekDays.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd")
      const dayStart = new Date(day)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(day)
      dayEnd.setHours(23, 59, 59, 999)

      const dayEvents = events.filter((e) => {
        const eventDate = format(new Date(e.start_time), "yyyy-MM-dd")
        return eventDate === dateStr
      })

      const metrics = calculateStressMetrics(dayEvents, dayStart, dayEnd, "day")
      stress[dateStr] = metrics.stressLevel
    })
    return stress
  }, [events, weekDays])

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm")
  }

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
  const handleToday = () => setCurrentDate(new Date())

  const weekRange = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
  }, [currentDate])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{weekRange}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek} aria-label="Previous week">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>Today</Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek} aria-label="Next week">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd")
          const dayStress = dailyStressLevels[dateStr] || 0
          const glareBackground = getStressGradient(dayStress, colorLow, colorHigh)

          return (
            <div
              key={dateStr}
              className="space-y-2 p-2 rounded-lg border border-border relative overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(135deg, ${colorLow}15 0%, ${colorHigh}08 100%)`,
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-30 rounded-lg"
                style={{ background: glareBackground }}
              />

              <div className="text-center pb-2 border-b border-border relative z-10">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: es })}
                </p>
                <p className="text-lg font-bold text-foreground">{format(day, "d")}</p>
                <p className="text-xs text-muted-foreground mt-1">Stress: {dayStress}/10</p>
              </div>

              <div className="space-y-1 min-h-40 relative z-10">
                {groupedEvents[dateStr]?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No events</p>
                ) : (
                  groupedEvents[dateStr]?.map((event) => {
                    const isExpanded = expandedEvent === event.id
                    return (
                      <div key={event.id} className="space-y-1">
                        <button
                          onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                          className={`w-full p-2 rounded text-xs font-medium text-left transition-all ${
                            typeColors[event.type as keyof typeof typeColors] || typeColors.personal
                          } hover:shadow-md`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="truncate flex-1">{event.title}</span>
                            {event.priority >= 4 && <AlertCircle className="w-3 h-3 flex-shrink-0 text-red-600" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div
                            className={`p-2 rounded text-xs space-y-1 ${typeBadges[event.type as keyof typeof typeBadges] || typeBadges.personal} bg-opacity-50`}
                          >
                            <p>
                              <span className="font-semibold">Time:</span> {formatTime(event.start_time)} -{" "}
                              {formatTime(event.end_time)}
                            </p>
                            <p>
                              <span className="font-semibold">Priority:</span> P{event.priority}
                            </p>
                            {event.description && (
                              <p>
                                <span className="font-semibold">Notes:</span> {event.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}