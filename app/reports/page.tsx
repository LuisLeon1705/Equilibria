"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { BarChart, LineChart } from "@/components/charts"
import { calculateStressMetrics } from "@/lib/stress-calculator-improved"
import type { Event } from "@/types"
import { Button } from "@/components/ui/button"
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  add,
  sub,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
} from "date-fns"
import { es } from "date-fns/locale"

type View = "week" | "month" | "year"

const DEFAULT_PREFERENCES = {
  background_type: "color",
  background_color: "#f8f9fa",
  stress_color_low: "#22c55e",
  stress_color_high: "#ef4444",
  theme: "light",
  default_calendar_view: "week",
  stress_alerts_enabled: true,
  stress_alert_threshold: 7,
}

export default function ReportsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(DEFAULT_PREFERENCES)
  const [profileData, setProfileData] = useState<any>(null)
  const [stats, setStats] = useState<{
    totalTasks: number
    completedTasks: number
    avgStress: number
    trendData: { name: string; stress: number }[]
  }>({
    totalTasks: 0,
    completedTasks: 0,
    avgStress: 0,
    trendData: [],
  })
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>("week")
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)

      let periodStart: Date, periodEnd: Date
      if (view === "week") {
        periodStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        periodEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
      } else if (view === "month") {
        periodStart = startOfMonth(currentDate)
        periodEnd = endOfMonth(currentDate)
      } else {
        periodStart = startOfYear(currentDate)
        periodEnd = endOfYear(currentDate)
      }

      try {
        const [eventsRes, tasksRes, prefsRes, profileRes] = await Promise.all([
          supabase
            .from("events")
            .select("*")
            .eq("user_id", user.id)
            .gte("start_time", periodStart.toISOString())
            .lte("start_time", periodEnd.toISOString()),
          supabase.from("tasks").select("*").eq("user_id", user.id),
          supabase.from("user_preferences").select("*").eq("user_id", user.id).single(),
          supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        ])

        const events: Event[] = eventsRes.data || []
        const tasks = tasksRes.data || []
        const prefsData = prefsRes.data
        const profileData = profileRes.data
        setPreferences(prefsData || DEFAULT_PREFERENCES)
        setProfileData(profileData)

        let trendData: { name: string; stress: number }[] = []

        if (view === "year") {
          const months = eachMonthOfInterval({ start: periodStart, end: periodEnd })
          trendData = months.map((month) => {
            const monthStart = startOfMonth(month)
            const monthEnd = endOfMonth(month)
            const monthEvents = events.filter(e => {
                const eventDate = new Date(e.start_time);
                return eventDate >= monthStart && eventDate <= monthEnd;
            });
            const metrics = calculateStressMetrics(monthEvents, monthStart, monthEnd, "month")
            return {
              name: format(month, "MMM", { locale: es }),
              stress: metrics.stressLevel,
            }
          })
        } else {
          const days = eachDayOfInterval({ start: periodStart, end: periodEnd })
          trendData = days.map((day) => {
            const dayStart = new Date(day)
            dayStart.setHours(0, 0, 0, 0)
            const dayEnd = new Date(day)
            dayEnd.setHours(23, 59, 59, 999)
            const dayEvents = events.filter(e => {
                const eventDate = new Date(e.start_time);
                return eventDate >= dayStart && eventDate <= dayEnd;
            });
            const metrics = calculateStressMetrics(dayEvents, dayStart, dayEnd, "day")
            return {
              name: view === "week" ? format(day, "EEE", { locale: es }) : format(day, "d"),
              stress: metrics.stressLevel,
            }
          })
        }

        const completedCount = tasks.filter((t: { status: string }) => t.status === "completed").length || 0
        const avgStressLevel =
          trendData.length > 0 ? trendData.reduce((sum, item) => sum + item.stress, 0) / trendData.length : 0

        setStats({
          totalTasks: tasks.length || 0,
          completedTasks: completedCount,
          avgStress: Math.round(avgStressLevel * 10) / 10,
          trendData: trendData,
        })
      } catch (error) {
        console.error("Error fetching report data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, router, view, currentDate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleDateChange = (direction: "prev" | "next" | "today") => {
    if (direction === "today") {
      setCurrentDate(new Date())
      return
    }
    const duration = { [view + "s"]: 1 }
    setCurrentDate((current) => (direction === "prev" ? sub(current, duration) : add(current, duration)))
  }

  const backgroundStyle = {
    backgroundColor:
      preferences?.background_type === "color" ? preferences.background_color : "transparent",
    backgroundImage:
      preferences?.background_type === "image" && preferences?.background_image_url
        ? `url('${preferences.background_image_url}')`
        : "none",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
  }

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  const headerTitle = format(
    currentDate,
    view === "week" ? "MMMM yyyy" : view === "month" ? "MMMM yyyy" : "yyyy",
    { locale: es }
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const colorLow = preferences?.stress_color_low || DEFAULT_PREFERENCES.stress_color_low
  const colorHigh = preferences?.stress_color_high || DEFAULT_PREFERENCES.stress_color_high

  return (
    <div className="min-h-screen bg-background" style={backgroundStyle}>
      <DashboardHeader profile={{...user, ...profileData, ...preferences}} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Wellness & Productivity Reports</h1>
          <p className="text-muted-foreground">Track your progress and stress patterns</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border border-border p-6">
            <p className="text-muted-foreground text-sm font-medium mb-2">Total Tasks</p>
            <p className="text-3xl font-bold text-foreground">{stats.totalTasks}</p>
          </Card>

          <Card className="border border-border p-6">
            <p className="text-muted-foreground text-sm font-medium mb-2">Completion Rate</p>
            <p className="text-3xl font-bold text-foreground">{completionRate}%</p>
          </Card>

          <Card className="border border-border p-6">
            <p className="text-muted-foreground text-sm font-medium mb-2">Avg. Stress</p>
            <p className="text-3xl font-bold text-foreground">{stats.avgStress}/10</p>
          </Card>

          <Card className="border border-border p-6">
            <p className="text-muted-foreground text-sm font-medium mb-2">Tasks Completed</p>
            <p className="text-3xl font-bold text-foreground">{stats.completedTasks}</p>
          </Card>
        </div>

        <Card className="border border-border p-6 mb-6">
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleDateChange("prev")}>Prev</Button>
              <Button variant="outline" onClick={() => handleDateChange("today")}>Today</Button>
              <Button variant="outline" onClick={() => handleDateChange("next")}>Next</Button>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-center order-first sm:order-none">{headerTitle}</h2>
            <div className="flex items-center gap-2">
              <Button variant={view === "week" ? "default" : "outline"} onClick={() => setView("week")}>Week</Button>
              <Button variant={view === "month" ? "default" : "outline"} onClick={() => setView("month")}>Month</Button>
              <Button variant={view === "year" ? "default" : "outline"} onClick={() => setView("year")}>Year</Button>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Stress Trend</h3>
          <LineChart data={stats.trendData} />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Task Completion</h3>
            <BarChart
              colors={[colorLow, colorHigh]}
              data={[
                { label: "Completed", value: stats.completedTasks },
                { label: "Pending", value: stats.totalTasks - stats.completedTasks },
              ]}
            />
          </Card>
          
          <Card className="border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recommendations</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {stats.avgStress > 7 && (
                <p className="text-stress-high">
                  ⚠️ Your stress levels are elevated. Consider adding more buffer time or reducing commitments.
                </p>
              )}
              {completionRate < 50 && (
                <p>💡 Focus on completing high-priority tasks first. Break large tasks into smaller steps.</p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
