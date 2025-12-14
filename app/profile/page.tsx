"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { ProfileForm } from "@/components/settings/profile-form"
import ThemeSettings from "@/components/profile/theme-settings"

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

export default function ProfilePage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState<any>(DEFAULT_PREFERENCES)

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

        const { data: prefsData, error: prefsError } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (prefsData) {
            setPreferences(prefsData)
        } else if (prefsError?.code === 'PGRST116') {
            const { data: insertedPrefs, error: insertError } = await supabase.from("user_preferences").insert([
                {
                  user_id: user.id,
                  ...DEFAULT_PREFERENCES,
                },
              ]).select().single();

            if(insertedPrefs) {
                setPreferences(insertedPrefs);
            } else {
                console.log("[v0] Could not auto-create preferences:", insertError)
            }
        }
        
      } catch (error) {
        console.log("[v0] Auth error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profile & Settings</h1>
      <div className="space-y-8">
        <ProfileForm user={user} />
        <ThemeSettings preferences={preferences} />
      </div>
    </div>
  );
}


