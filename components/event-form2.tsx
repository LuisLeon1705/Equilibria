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
    if (!title.trim()) return "El título es obligatorio"
    if (!startTime || !endTime) return "La hora de inicio y fin son obligatorias"

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (end <= start) return "La hora de fin debe ser posterior a la de inicio"

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
        setError("Debes iniciar sesión")
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
      setError("Ocurrió un error inesperado")
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
        <label className="block text-sm font-medium text-foreground mb-1">Título</label>
        <Input
          type="text"
          placeholder="Ej: Clase de Matemáticas"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
            disabled={loading}
          >
            <option value="class">Clase</option>
            <option value="work">Trabajo</option>
            <option value="exam">Examen</option>
            <option value="project">Proyecto</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Prioridad (1-5)</label>
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
          <label className="block text-sm font-medium text-foreground mb-1">Hora de inicio</label>
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Hora de fin</label>
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
        <label className="block text-sm font-medium text-foreground mb-1">Descripción (opcional)</label>
        <textarea
          placeholder="Agrega notas..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm resize-none"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
          {loading ? "Agregando..." : "Agregar evento"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
