"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface ProfileFormProps {
  user?: any
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [fullName, setFullName] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState("")
  const [hoursPerWeek, setHoursPerWeek] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

      if (data) {
        setFullName(data.full_name || "")
        setFieldOfStudy(data.field_of_study || "")
        setHoursPerWeek(data.hours_per_week_working || 0)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [user, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      if (!user) {
        setError("User not found")
        return
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          field_of_study: fieldOfStudy,
          hours_per_week_working: hoursPerWeek,
        })
        .eq("user_id", user.id)

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  return (
    <Card className="border border-border p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Profile Settings</h2>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md flex gap-2 items-start">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100/30 border border-green-500/30 rounded-md">
          <p className="text-sm text-green-600">Profile updated successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
          <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={saving} />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Field of Study</label>
          <Input type="text" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} disabled={saving} />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Hours Working Per Week</label>
          <Input
            type="number"
            min="0"
            max="60"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number.parseInt(e.target.value))}
            disabled={saving}
          />
        </div>

        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Card>
  )
}
