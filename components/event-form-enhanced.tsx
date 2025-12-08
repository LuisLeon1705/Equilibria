"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface EventFormProps {
  onSubmit: (event: any) => Promise<void>
  isLoading?: boolean
  initialData?: any
}

export function EventFormEnhanced({ onSubmit, isLoading = false, initialData }: EventFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      description: "",
      type: "class",
      priority: 5,
      start_time: "",
      end_time: "",
    },
  )
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim()) {
      setError("Event title is required")
      return
    }

    if (!formData.start_time || !formData.end_time) {
      setError("Start and end times are required")
      return
    }

    const startTime = new Date(formData.start_time)
    const endTime = new Date(formData.end_time)

    if (startTime >= endTime) {
      setError("End time must be after start time")
      return
    }

    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    if (durationMinutes < 15) {
      setError("Events must be at least 15 minutes long")
      return
    }

    try {
      await onSubmit(formData)
      // Reset form on success
      setFormData({
        title: "",
        description: "",
        type: "class",
        priority: 5,
        start_time: "",
        end_time: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event")
    }
  }

  return (
    <Card className="border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">{initialData ? "Edit Event" : "Create New Event"}</h2>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md flex gap-2">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
            Event Title
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Math Exam"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
            Description (Optional)
          </label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add notes about this event"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">
              Event Type
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            >
              <option value="class">Class</option>
              <option value="work">Work Shift</option>
              <option value="exam">Exam</option>
              <option value="project">Project</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1">
              Priority (1-10)
            </label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number.parseInt(e.target.value) })}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-foreground mb-1">
              Start Time
            </label>
            <Input
              id="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-foreground mb-1">
              End Time
            </label>
            <Input
              id="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Event"}
        </Button>
      </form>
    </Card>
  )
}
