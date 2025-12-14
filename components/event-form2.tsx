"use client"

import type React from "react"
import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

interface EventFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function EventForm({ onSuccess, onCancel }: EventFormProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"class" | "work" | "exam" | "project" | "personal">("personal")
  const [priority, setPriority] = useState(2)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = getSupabaseClient()

  const validateForm = () => {
    if (!title.trim()) return "Title is required"
    if (!startTime || !endTime) return "Start and end times are required"

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (end <= start) return "End time must be after start time"

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in")
        return
      }

      const { error: insertError } = await supabase.from("events").insert({
        user_id: user.id,
        title,
        type,
        priority,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        description,
      })

      if (insertError) {
        setError(insertError.message)
      } else {
        setTitle("")
        setType("personal")
        setPriority(2)
        setStartTime("")
        setEndTime("")
        setDescription("")
        onSuccess?.()
      }
    } catch (err) {
      console.log("[v0] Error adding event:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md flex gap-2 items-start">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Title</label>
        <Input
          type="text"
          placeholder="e.g., Math Lecture"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
            disabled={loading}
          >
            <option value="class">Class</option>
            <option value="work">Work</option>
            <option value="exam">Exam</option>
            <option value="project">Project</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Priority (1-5)</label>
          <Input
            type="number"
            min="1"
            max="5"
            value={priority.toString()}
            onChange={(e) => {
              const val = e.target.value ? Number.parseInt(e.target.value) : 2
              setPriority(Math.min(5, Math.max(1, val)))
            }}
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Start Time</label>
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">End Time</label>
          <Input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Description (optional)</label>
        <textarea
          placeholder="Add any notes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm resize-none"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
          {loading ? "Adding..." : "Add Event"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
