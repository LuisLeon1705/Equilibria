"use client"

import { useState, useMemo, ReactNode } from "react"
import { DayProps } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Event } from "@/types"
import { Button } from "@/components/ui/button"
import {
  format,
  addMonths,
  subMonths,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateStressMetrics, getStressGradient } from "@/lib/stress-calculator-improved"

type CalendarView = "month" | "week" | "day"

interface InteractiveCalendarProps {
  events: Event[]
  colorLow?: string
  colorHigh?: string
}

const EventItem = ({ event }: { event: Event }) => (
  <div className="py-2 px-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
    <p className="font-semibold text-sm">{event.title}</p>
    <p className="text-xs text-muted-foreground">
      {format(new Date(event.start_time), "p", { locale: es })} - {format(new Date(event.end_time), "p", { locale: es })}
    </p>
  </div>
)

export function InteractiveCalendar({ events, colorLow = "#22c55e", colorHigh = "#ef4444" }: InteractiveCalendarProps) {
  const [view, setView] = useState<CalendarView>("month")
  const [selectedDate, setSelectedDate] = useState(new Date())

  const { eventsByDate, dailyStressLevels } = useMemo(() => {
    const eventsByDate = events.reduce((acc, event) => {
      const date = format(new Date(event.start_time), "yyyy-MM-dd")
      if (!acc[date]) acc[date] = []
      acc[date].push(event)
      return acc
    }, {} as Record<string, Event[]>)

    const dailyStressLevels = Object.keys(eventsByDate).reduce((acc, dateStr) => {
      const dayEvents = eventsByDate[dateStr]
      const metrics = calculateStressMetrics(dayEvents, startOfDay(new Date(dateStr)), endOfDay(new Date(dateStr)), "day")
      acc[dateStr] = metrics.stressLevel
      return acc
    }, {} as Record<string, number>)

    return { eventsByDate, dailyStressLevels }
  }, [events])

  const handlePrev = () => {
    if (view === "month") setSelectedDate(subMonths(selectedDate, 1))
    if (view === "week") setSelectedDate(subWeeks(selectedDate, 1))
    if (view === "day") setSelectedDate(subDays(selectedDate, 1))
  }

  const handleNext = () => {
    if (view === "month") setSelectedDate(addMonths(selectedDate, 1))
    if (view === "week") setSelectedDate(addWeeks(selectedDate, 1))
    if (view === "day") setSelectedDate(addDays(selectedDate, 1))
  }

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  const headerTitle = useMemo(() => {
    if (view === "day") return format(selectedDate, "MMMM d, yyyy", { locale: es })
    if (view === "week") {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 })
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
    }
    return format(selectedDate, "MMMM yyyy", { locale: es })
  }, [view, selectedDate])

  const CustomDay = (props: DayProps) => {
    const dayDate = props.day?.date ?? new Date()
    const dateStr = format(dayDate, "yyyy-MM-dd")
    const stress = dailyStressLevels[dateStr] || 0
    const glareBackground = getStressGradient(stress, colorLow, colorHigh)
    return (
      <div className="relative h-full w-full">
        <div
          className="absolute inset-0 pointer-events-none opacity-20 rounded-md"
          style={{ background: glareBackground }}
        />
        {props.children}
      </div>
    )
  }

  const renderMonthView = () => {
    const eventsForSelectedDay = eventsByDate[format(selectedDate, "yyyy-MM-dd")] || []
    eventsForSelectedDay.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={selectedDate}
            onMonthChange={setSelectedDate}
            className="p-0"
            classNames={{
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
            }}
            modifiers={{ hasEvent: (date) => dailyStressLevels[format(date, "yyyy-MM-dd")] > 0 }}
            modifiersClassNames={{ hasEvent: "font-bold !text-primary" }}
            components={{ Day: CustomDay }}
          />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Events for {format(selectedDate, "MMMM d", { locale: es })}</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[380px] overflow-y-auto p-0">
            {eventsForSelectedDay.length > 0 ? (
              eventsForSelectedDay.map((event) => <EventItem key={event.id} event={event} />)
            ) : (
              <p className="p-4 text-center text-muted-foreground">No events for this day.</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderWeekView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i))
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dateStr = format(day, "yyyy-MM-dd")
          const dayEvents = eventsByDate[dateStr] || []
          dayEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
          const stress = dailyStressLevels[dateStr] || 0
          const glareBackground = getStressGradient(stress, colorLow, colorHigh)
          return (
            <Card key={day.toString()} className={`flex flex-col relative overflow-hidden ${isSameDay(day, new Date()) ? 'border-primary' : ''}`}>
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{ background: glareBackground }}
              />
              <CardHeader className="p-3 text-center border-b bg-transparent relative z-10">
                <p className="text-xs font-semibold text-muted-foreground uppercase">{format(day, "EEE", { locale: es })}</p>
                <p className={`text-lg font-bold ${isSameDay(day, selectedDate) ? 'text-primary' : ''}`}>{format(day, "d")}</p>
              </CardHeader>
              <CardContent className="p-0 flex-grow overflow-y-auto bg-transparent relative z-10">
                {dayEvents.length > 0 ? (
                  dayEvents.map(event => <EventItem key={event.id} event={event} />)
                ) : (
                  <p className="p-4 text-xs text-center text-muted-foreground">No events</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderDayView = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    const dayEvents = eventsByDate[dateStr] || []
    dayEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    const stress = dailyStressLevels[dateStr] || 0
    const glareBackground = getStressGradient(stress, colorLow, colorHigh)
    return (
      <Card className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: glareBackground }}
        />
        <CardHeader>
          <CardTitle>Events for {format(selectedDate, "MMMM d, yyyy", { locale: es })}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative z-10">
          {dayEvents.length > 0 ? (
            dayEvents.map(event => <EventItem key={event.id} event={event} />)
          ) : (
            <p className="p-6 text-center text-muted-foreground">No events scheduled for this day.</p>
          )}
        </CardContent>
      </Card>
    )
  }

  const viewContent: Record<CalendarView, ReactNode> = {
    month: renderMonthView(),
    week: renderWeekView(),
    day: renderDayView(),
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrev}>Prev</Button>
            <Button variant="outline" onClick={handleToday}>Today</Button>
            <Button variant="outline" onClick={handleNext}>Next</Button>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-center order-first sm:order-none">
            {headerTitle}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant={view === 'day' ? 'default' : 'outline'} onClick={() => setView("day")}>Day</Button>
            <Button variant={view === 'week' ? 'default' : 'outline'} onClick={() => setView("week")}>Week</Button>
            <Button variant={view === 'month' ? 'default' : 'outline'} onClick={() => setView("month")}>Month</Button>
          </div>
        </CardContent>
      </Card>
      
      {viewContent[view]}
    </div>
  )
}
