"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

interface UserPreferences {
  background_type: "color" | "image"
  background_color: string
  background_image_url?: string
  profile_picture_url?: string
  stress_color_low: string
  stress_color_high: string
  theme: "light" | "dark" | "auto"
  default_calendar_view: "day" | "week" | "month" | "year"
  stress_alerts_enabled: boolean
  stress_alert_threshold: number
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState<UserPreferences>({
    background_type: "color",
    background_color: "#f8f9fa",
    stress_color_low: "#22c55e",
    stress_color_high: "#ef4444",
    theme: "light",
    default_calendar_view: "week",
    stress_alerts_enabled: true,
    stress_alert_threshold: 7,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

      // Fetch user preferences
      try {
        const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

        if (data) {
          setPreferences(data)
        } else if (error?.code === "PGRST116") {
          // No preferences found, create defaults
          const { error: insertError } = await supabase.from("user_preferences").insert({
            user_id: user.id,
            ...preferences,
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

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSavePreferences = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.from("user_preferences").update(preferences).eq("user_id", user.id)

      if (error) throw error
      setSuccess("Preferences saved successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("Failed to save preferences")
      console.error("Error saving preferences:", err)
    } finally {
      setSaving(false)
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

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        backgroundColor: preferences.background_type === "color" ? preferences.background_color : "transparent",
        backgroundImage:
          preferences.background_type === "image" && preferences.background_image_url
            ? `url('${preferences.background_image_url}')`
            : "none",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings & Customization</h1>
          <p className="text-muted-foreground">Personalize your Equilibria experience</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          <Card className="border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Background</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Background Type</label>
                <div className="flex gap-3">
                  {(["color", "image"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handlePreferenceChange("background_type", type)}
                      className={`px-4 py-2 rounded transition-colors ${
                        preferences.background_type === type
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {preferences.background_type === "color" && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Background Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={preferences.background_color}
                      onChange={(e) => handlePreferenceChange("background_color", e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={preferences.background_color}
                      onChange={(e) => handlePreferenceChange("background_color", e.target.value)}
                      placeholder="#f8f9fa"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {preferences.background_type === "image" && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Image URL</label>
                  <Input
                    type="url"
                    value={preferences.background_image_url || ""}
                    onChange={(e) => handlePreferenceChange("background_image_url", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Stress Indicator Colors</h3>
            <p className="text-sm text-muted-foreground mb-4">Customize the color gradient from low to high stress</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Low Stress Color (Good)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={preferences.stress_color_low}
                    onChange={(e) => handlePreferenceChange("stress_color_low", e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={preferences.stress_color_low}
                    onChange={(e) => handlePreferenceChange("stress_color_low", e.target.value)}
                    placeholder="#22c55e"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">High Stress Color (Bad)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={preferences.stress_color_high}
                    onChange={(e) => handlePreferenceChange("stress_color_high", e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={preferences.stress_color_high}
                    onChange={(e) => handlePreferenceChange("stress_color_high", e.target.value)}
                    placeholder="#ef4444"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">Preview</p>
                <div
                  className="h-6 rounded-full border border-border"
                  style={{
                    background: `linear-gradient(to right, ${preferences.stress_color_low}, ${preferences.stress_color_high})`,
                  }}
                />
              </div>
            </div>
          </Card>

          <Card className="border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Theme</label>
                <div className="flex gap-2">
                  {(["light", "dark", "auto"] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handlePreferenceChange("theme", theme)}
                      className={`px-3 py-2 rounded text-sm transition-colors ${
                        preferences.theme === theme
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Default Calendar View</label>
                <div className="flex gap-2">
                  {(["day", "week", "month", "year"] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => handlePreferenceChange("default_calendar_view", view)}
                      className={`px-3 py-2 rounded text-sm transition-colors ${
                        preferences.default_calendar_view === view
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Stress Alerts Threshold</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={preferences.stress_alert_threshold}
                    onChange={(e) => handlePreferenceChange("stress_alert_threshold", Number.parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-medium text-foreground w-8 text-right">
                    {preferences.stress_alert_threshold}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Alert when stress level exceeds {preferences.stress_alert_threshold}/10
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="alerts"
                  checked={preferences.stress_alerts_enabled}
                  onChange={(e) => handlePreferenceChange("stress_alerts_enabled", e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="alerts" className="text-sm text-muted-foreground">
                  Enable stress alerts
                </label>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleSavePreferences}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
