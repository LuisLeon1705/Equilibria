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
      setError("El título del evento es obligatorio")
      return
    }

    if (!formData.start_time || !formData.end_time) {
      setError("La hora de inicio y fin son obligatorias")
      return
    }

    const startTime = new Date(formData.start_time)
    const endTime = new Date(formData.end_time)

    if (startTime >= endTime) {
      setError("La hora de fin debe ser posterior a la de inicio")
      return
    }

    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    if (durationMinutes < 15) {
      setError("Los eventos deben durar al menos 15 minutos")
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
      setError(err instanceof Error ? err.message : "No se pudo guardar el evento")
    }
  }

  return (
    <Card className="border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">{initialData ? "Editar evento" : "Crear nuevo evento"}</h2>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md flex gap-2">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
            Título del evento
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ej: Examen de Matemáticas"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
            Descripción (opcional)
          </label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Agrega notas sobre este evento"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">
              Tipo de evento
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            >
              <option value="class">Clase</option>
              <option value="work">Turno de trabajo</option>
              <option value="exam">Examen</option>
              <option value="project">Proyecto</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1">
              Prioridad (1-10)
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
              Hora de inicio
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
              Hora de fin
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
          {isLoading ? "Guardando..." : "Guardar evento"}
        </Button>
      </form>
    </Card>
  )
}
