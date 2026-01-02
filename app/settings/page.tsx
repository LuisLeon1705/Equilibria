"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProfileForm } from "@/components/settings/profile-form"
import ThemeSettings from "@/components/profile/theme-settings"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState<any>(null)

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

      try {
        const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

        if (data) {
          setPreferences(data)
        } else if (error?.code === "PGRST116") {
          const { error: insertError } = await supabase.from("user_preferences").insert({
            user_id: user.id,
          })
          if (insertError) console.error("Error creating preferences:", insertError)
        }
      } catch (err) {
        console.error("Error fetching preferences:", err)
      }

      setLoading(false)
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
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }
  
  return (
    <div
      className="min-h-screen bg-background"
      style={{
        backgroundColor: preferences?.background_type === "color" ? preferences?.background_color : "transparent",
        backgroundImage:
          preferences?.background_type === "image" && preferences?.background_image_url
            ? `url('${preferences.background_image_url}')`
            : "none",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuración y Personalización</h1>
          <p className="text-muted-foreground">Personaliza tu experiencia en Equilibria</p>
        </div>
        <div className="space-y-8">
          <ProfileForm user={user} />
          {preferences && <ThemeSettings preferences={preferences} />}
        </div>
      </main>
    </div>
  )
}
