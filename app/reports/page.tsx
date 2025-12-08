"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { BarChart, LineChart } from "@/components/charts"

interface WeeklyData {
  tasks_completed: number
  total_tasks: number
  avg_stress: number
  study_hours: number
  work_hours: number
}
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
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [preferences, setPreferences] = useState<any>(DEFAULT_PREFERENCES)
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    avgStress: 0,
    weeklyTrend: [] as number[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUser(user)

      // --- CAMBIO AQUÍ ---
      // Ahora cargamos todo (logs, tareas y preferencias) al mismo tiempo
      try {
        const [logsRes, tasksRes, prefsRes] = await Promise.all([
          supabase
            .from("stress_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(30),
          supabase.from("tasks").select("*").eq("user_id", user.id),
          supabase
            .from("user_preferences")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1),
        ])

        // 1. Procesar Preferencias (¡ESTO FALTABA!)
        const prefsData = prefsRes.data && prefsRes.data.length > 0 ? prefsRes.data[0] : null
        setPreferences(prefsData || DEFAULT_PREFERENCES)
        
        // Opcional: Crear preferencias si no existen
        if (!prefsData) {
          try {
            await supabase.from("user_preferences").insert([{ user_id: user.id, ...DEFAULT_PREFERENCES }])
          } catch (err) {
             console.log("[v0] Could not auto-create preferences:", err)
          }
        }

        // 2. Procesar Logs y Tareas
        const logs = logsRes.data || []
        const tasks = tasksRes.data || []

        // 3. Calcular Estadísticas
        const completedCount = tasks.filter((t: { status: string }) => t.status === "completed").length || 0
        const avgStressLevel =
          logs.length > 0 ? logs.reduce((sum: any, log: { stress_level: any }) => sum + (log.stress_level || 0), 0) / logs.length : 0

        setStats({
          totalTasks: tasks.length || 0,
          completedTasks: completedCount,
          avgStress: Math.round(avgStressLevel * 10) / 10,
          weeklyTrend:
            logs
              .slice(0, 7)
              .reverse()
              .map((l: { stress_level: any }) => l.stress_level || 0) || [],
        })

      } catch (error) {
        console.error("Error fetching report data:", error)
      } finally {
        setLoading(false)
      }
      // --- FIN DEL CAMBIO ---
    }

    checkAuth()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }
  
  // Esta parte ya estaba correcta, pero ahora `preferences` tendrá los datos reales
  const colorLow = preferences?.stress_color_low || DEFAULT_PREFERENCES.stress_color_low
  const colorHigh = preferences?.stress_color_high || DEFAULT_PREFERENCES.stress_color_high

  const backgroundStyle = {
    backgroundColor:
      preferences?.background_type === "color"
        ? preferences.background_color
        : "transparent",
    backgroundImage:
      preferences?.background_type === "image" && preferences?.background_image_url
        ? `url('${preferences.background_image_url}')`
        : "none",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
  }

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  return (
    // Y esto ahora aplicará el fondo correcto
    <div className="min-h-screen bg-background" style={backgroundStyle}>
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Wellness & Productivity Reports</h1>
          <p className="text-muted-foreground">Track your progress and stress patterns</p>
        </div>

        {/* Key Metrics */}
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
            <p className="text-muted-foreground text-sm font-medium mb-2">Avg. Weekly Stress</p>
            <p className="text-3xl font-bold text-foreground">{stats.avgStress}/10</p>
          </Card>

          <Card className="border border-border p-6">
            <p className="text-muted-foreground text-sm font-medium mb-2">Tasks Completed</p>
            <p className="text-3xl font-bold text-foreground">{stats.completedTasks}</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Stress Trend</h3>
            <LineChart data={stats.weeklyTrend} />
          </Card>

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
        </div>

        {/* Recommendations */}
        <Card className="border border-border p-6 mt-6">
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
            {stats.weeklyTrend.length > 1 && stats.weeklyTrend[stats.weeklyTrend.length - 1] < stats.weeklyTrend[0] && (
              <p className="text-stress-low">✓ Great job! Your stress levels are decreasing. Keep up the good work.</p>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
