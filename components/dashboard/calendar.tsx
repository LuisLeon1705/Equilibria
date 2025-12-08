"use client"

import { useMemo, useState } from "react"
import { format, startOfWeek, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronDown } from "lucide-react"

interface Event {
  id: string
  title: string
  type: string
  start_time: string
  end_time: string
  priority: number
  description?: string
}

interface CalendarProps {
  events: Event[]
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

export function Calendar({ events }: CalendarProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [])

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

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm")
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={format(day, "yyyy-MM-dd")} className="space-y-2">
            <div className="text-center pb-2 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                {format(day, "EEE", { locale: es })}
              </p>
              <p className="text-lg font-bold text-foreground">{format(day, "d")}</p>
            </div>

            <div className="space-y-1 min-h-40">
              {groupedEvents[format(day, "yyyy-MM-dd")]?.map((event) => {
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
                        {isExpanded && <ChevronDown className="w-3 h-3 flex-shrink-0" />}
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
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
