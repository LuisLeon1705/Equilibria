"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { getSupabaseClient } from "@/lib/supabase-client"
import { CalendarWithGlare } from "@/components/calendar-with-glare"
import { InteractiveCalendar } from "@/components/dashboard/interactive-calendar"
import { TaskList } from "@/components/dashboard/task-list"
import { StressIndicatorEnhanced } from "@/components/stress-indicator-enhanced"
import { Modal } from "@/components/modal-dialog"
import { EventForm } from "@/components/event-form"
import { TaskForm } from "@/components/task-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Event, Task } from "@/types"
import type { TimePeriod } from "@/lib/stress-calculator-improved"
import { Separator } from "@/components/ui/separator"

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

export default function DashboardPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [preferences, setPreferences] = useState<any>(DEFAULT_PREFERENCES)
  const [profileData, setProfileData] = useState<any>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week")

  const fetchData = async (userId: string) => {
    try {
      const [eventsRes, tasksRes, prefsRes, profileRes] = await Promise.all([
        supabase.from("events").select("*").eq("user_id", userId).order("start_time", { ascending: true }).limit(100),
        supabase.from("tasks").select("*").eq("user_id", userId).order("due_date", { ascending: true }).limit(50),
        supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", userId)
          .single(),
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .single(),
      ])

      const eventsData = eventsRes.data || []
      const tasksData = tasksRes.data || []
      const prefsData = prefsRes.data
      const profileData = profileRes.data

      setEvents(eventsData)
      setTasks(tasksData)
      setPreferences(prefsData || DEFAULT_PREFERENCES)
      setProfileData(profileData)

      if (!prefsData) {
        try {
          await supabase.from("user_preferences").insert([
            {
              user_id: userId,
              ...DEFAULT_PREFERENCES,
            },
          ])
        } catch (err) {
          console.log("[v0] Could not auto-create preferences:", err)
        }
      }
    } catch (error) {
      console.log("[v0] Error fetching data:", error)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        setUser(user)
        await fetchData(user.id)
      } catch (error) {
        console.log("[v0] Auth error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  const handleEventAdded = async () => {
    setShowEventModal(false)
    if (user) {
      await fetchData(user.id)
    }
  }

  const handleTaskAdded = async () => {
    setShowTaskModal(false)
    if (user) {
      await fetchData(user.id)
    }
  }

  const handleDeleteEvent = async (eventId: string | number) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId)
      if (error) throw error
      await fetchData(user.id) // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting event:", error)
      // Aquí podrías añadir un toast de error
    }
  }

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

  return (
    <div className="min-h-screen bg-background" style={backgroundStyle}>
      <DashboardHeader profile={{...user, ...profileData, ...preferences}} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Weekly Schedule</CardTitle>
                <Button
                  onClick={() => setShowEventModal(true)}
                  size="sm"
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                  Add Event
                </Button>
              </CardHeader>
              <CardContent>
                <CalendarWithGlare events={events} colorLow={colorLow} colorHigh={colorHigh} />
                <Separator className="my-6" />
                <h3 className="text-lg font-semibold text-foreground mb-4">Full Calendar</h3>
                <InteractiveCalendar
                  events={events}
                  colorLow={colorLow}
                  colorHigh={colorHigh}
                  onDeleteEvent={handleDeleteEvent}
                  onRefreshEvents={() => fetchData(user.id)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <Button
                  onClick={() => setShowTaskModal(true)}
                  size="sm"
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                <TaskList tasks={tasks} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <StressIndicatorEnhanced
              events={events}
              period={selectedPeriod}
              colorLow={colorLow}
              colorHigh={colorHigh}
              onPeriodChange={setSelectedPeriod}
            />

            <Card className="border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Total Events</span>
                  <span className="font-medium text-foreground">{events.length}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Active Tasks</span>
                  <span className="font-medium text-foreground">
                    {tasks.filter((t) => t.status !== "completed").length}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium text-foreground">
                    {tasks.filter((t) => t.status === "completed").length}
                  </span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title="Add New Event">
        <EventForm onSuccess={handleEventAdded} onCancel={() => setShowEventModal(false)} />
      </Modal>

      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Add New Task">
        <TaskForm onSuccess={handleTaskAdded} onCancel={() => setShowTaskModal(false)} />
      </Modal>
    </div>
  )
}
