"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { LayoutWithNav } from '../layout-with-nav'

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

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getSupabaseClient()
  const [preferences, setPreferences] = useState<any>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getPrefs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: prefsData } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single()
        if (prefsData) {
          setPreferences(prefsData)
        }
      }
      setLoading(false)
    }
    getPrefs()
  }, [supabase])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div style={backgroundStyle}>
      <LayoutWithNav>{children}</LayoutWithNav>
    </div>
  )
}
