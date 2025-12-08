"use client"

import EditProfileForm from '@/components/profile/edit-profile-form';
import ThemeSettings from '@/components/profile/theme-settings';
import { useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import type { Event, Task } from "@/types"
import type { TimePeriod } from "@/lib/stress-calculator-improved"

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
export default async function ProfilePage() {
  const router = useRouter()
    const supabase = getSupabaseClient()
    const [user, setUser] = useState<any>(null)
    const [events, setEvents] = useState<Event[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [showEventModal, setShowEventModal] = useState(false)
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [preferences, setPreferences] = useState<any>(DEFAULT_PREFERENCES)
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week")
  
    const fetchData = async (userId: string) => {
      try {
        const [eventsRes, tasksRes, prefsRes] = await Promise.all([
          supabase.from("events").select("*").eq("user_id", userId).order("start_time", { ascending: true }).limit(100),
          supabase.from("tasks").select("*").eq("user_id", userId).order("due_date", { ascending: true }).limit(50),
          supabase
            .from("user_preferences")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1),
        ])
  
        const eventsData = eventsRes.data || []
        const tasksData = tasksRes.data || []
        const prefsData = prefsRes.data && prefsRes.data.length > 0 ? prefsRes.data[0] : null
  
        setEvents(eventsData)
        setTasks(tasksData)
        setPreferences(prefsData || DEFAULT_PREFERENCES)
  
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
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="space-y-8">
        <EditProfileForm user={user} />
        <ThemeSettings preferences={preferences} />
      </div>
    </div>
  );
}
