"use client"

import type React from "react"
import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

interface TaskFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function TaskForm({ onSuccess, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState(2)
  const [dueDate, setDueDate] = useState("")
  const [estimatedHours, setEstimatedHours] = useState(1)
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = getSupabaseClient()

  const validateForm = () => {
    if (!title.trim()) return "El título es obligatorio"
    if (!dueDate) return "La fecha límite es obligatoria"
    if (estimatedHours <= 0) return "Las horas estimadas deben ser mayores a 0"

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

      const { error: insertError } = await supabase.from("tasks").insert({
        user_id: user.id,
        title,
        priority,
        due_date: dueDate,
        estimated_hours: Number.parseFloat(estimatedHours.toString()),
        description,
        status: "todo",
      })

      if (insertError) {
        setError(insertError.message)
      } else {
        setTitle("")
        setPriority(2)
        setDueDate("")
        setEstimatedHours(1)
        setDescription("")
        onSuccess?.()
      }
    } catch (err) {
      console.log("[v0] Error adding task:", err)
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
        <label className="block text-sm font-medium text-foreground mb-1">Título de la tarea</label>
        <Input
          type="text"
          placeholder="Ej: Leer capítulo 5"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Horas estimadas</label>
          <Input
            type="number"
            min="0.5"
            step="0.5"
            value={estimatedHours.toString()}
            onChange={(e) => {
              const val = e.target.value ? Number.parseFloat(e.target.value) : 1
              setEstimatedHours(Math.max(0.5, val))
            }}
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Fecha límite</label>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required disabled={loading} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Descripción (opcional)</label>
        <textarea
          placeholder="Agrega detalles de la tarea..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm resize-none"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
          {loading ? "Agregando..." : "Agregar tarea"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
