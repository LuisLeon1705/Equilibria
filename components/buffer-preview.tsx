"use client"

import { calculateDynamicBuffers, getBufferRecommendations, DEFAULT_BUFFER_CONFIG } from "@/lib/dynamic-buffers"
import type { Event } from "@/types"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

interface BufferPreviewProps {
  events: Event[]
}

export function BufferPreview({ events }: BufferPreviewProps) {
  const buffers = calculateDynamicBuffers(events, DEFAULT_BUFFER_CONFIG)
  const recommendations = getBufferRecommendations(events, buffers)

  const totalBufferMinutes = buffers.reduce((sum, b) => sum + b.durationMinutes, 0)
  const averageBufferPerDay = Math.round(totalBufferMinutes / 7)

  return (
    <Card className="border border-border p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-foreground mb-2">Buffers dinámicos</h3>
        <div className="text-sm space-y-1 text-muted-foreground">
          <p>
            <strong>Tiempo total de buffer:</strong> {totalBufferMinutes} minutos esta semana
          </p>
          <p>
            <strong>Promedio diario:</strong> {averageBufferPerDay} minutos/día
          </p>
        </div>
      </div>

      {buffers.length > 0 && (
        <div>
          <h4 className="font-medium text-foreground mb-2">Horario de buffers:</h4>
          <div className="space-y-2 text-sm">
            {buffers.slice(0, 5).map((buffer, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground">{buffer.durationMinutes} min buffer</p>
                  <p className="text-xs text-muted-foreground">{buffer.reason}</p>
                </div>
              </div>
            ))}
            {buffers.length > 5 && <p className="text-xs text-muted-foreground">+{buffers.length - 5} buffers más</p>}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Recomendaciones
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
            {recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
