"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

interface EventFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: any // Para modo de edición
}

/**
 * Formatea una fecha ISO (o Date) a un string para 'datetime-local' input.
 * Se ajusta a la zona horaria local.
 */
const formatToDateTimeLocal = (isoString: string | Date): string => {
  try {
    const date = new Date(isoString)
    // Restar el offset de la zona horaria para que .toISOString() devuelva la hora local
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    // Devuelve 'yyyy-MM-ddTHH:mm'
    return date.toISOString().slice(0, 16)
  } catch (e) {
    return ""
  }
}

/**
 * Formatea una fecha ISO (o Date) a un string para 'time' input.
 * Se ajusta a la zona horaria local.
 */
const formatToTime = (isoString: string | Date): string => {
   try {
    const date = new Date(isoString)
    // Restar el offset de la zona horaria
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    // Devuelve 'HH:mm'
    return date.toISOString().slice(11, 16)
  } catch (e) {
    return ""
  }
}

export function EventForm({ onSuccess, onCancel, initialData }: EventFormProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"class" | "work" | "exam" | "project" | "personal">("personal")
  const [priority, setPriority] = useState(2)
  const [startTime, setStartTime] = useState("") // 'datetime-local'
  const [endTime, setEndTime] = useState("") // 'time'
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = getSupabaseClient()
  const isEditMode = Boolean(initialData)

  // Rellenar el formulario si initialData cambia
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "")
      setType(initialData.type || "personal")
      setPriority(initialData.priority || 2)
      setDescription(initialData.description || "")
      // Formatear las fechas ISO a los formatos de input correctos
      setStartTime(formatToDateTimeLocal(initialData.start_time))
      setEndTime(formatToTime(initialData.end_time))
    } else {
      // Resetear formulario si no hay initialData (ej. al crear)
      setTitle("")
      setType("personal")
      setPriority(2)
      setStartTime("")
      setEndTime("")
      setDescription("")
    }
  }, [initialData])

  const validateForm = () => {
    if (!title.trim()) return "Title is required"
    if (!startTime || !endTime) return "Start and end times are required"
    if (!startTime.includes('T')) return "Invalid start time format."

    const startDatePart = startTime.split('T')[0]
    const fullEndTimeString = `${startDatePart}T${endTime}`
    const start = new Date(startTime)
    const end = new Date(fullEndTimeString)

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in")
        setLoading(false)
        return
      }
      
      const startDatePart = startTime.split('T')[0]
      const fullEndTimeString = `${startDatePart}T${endTime}`

      // Datos del evento listos para enviar
      const eventData = {
        user_id: user.id, // Asegurarse que user_id esté en insert/update si es necesario
        title,
        type,
        priority,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(fullEndTimeString).toISOString(),
        description,
      }

      if (isEditMode) {
        // --- LÓGICA DE ACTUALIZACIÓN ---
        const { error: updateError } = await supabase
          .from("events")
          .update(eventData)
          .match({ id: initialData.id, user_id: user.id }) // Seguridad: solo actualiza si el user_id coincide

        if (updateError) {
          setError(updateError.message)
        } else {
          onSuccess?.()
        }

      } else {
        // --- LÓGICA DE CREACIÓN (la que ya tenías) ---
        const { error: insertError } = await supabase
          .from("events")
          .insert(eventData)

        if (insertError) {
          setError(insertError.message)
        } else {
          // Resetear formulario solo en creación exitosa
          setTitle("")
          setType("personal")
          setPriority(2)
          setStartTime("")
          setEndTime("")
          setDescription("")
          onSuccess?.()
        }
      }
    } catch (err) {
      console.log("[v0] Error processing event:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        {isEditMode ? "Editar evento" : "Crear nuevo evento"}
      </h2>
      
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
            type="time"
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
          {loading ? (isEditMode ? "Guardando..." : "Agregando...") : (isEditMode ? "Guardar cambios" : "Agregar evento")}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}