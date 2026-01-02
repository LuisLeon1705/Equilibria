"use client"

interface StressIndicatorProps {
  stressLevel: number // 1-10
  density: number // 0-1
  highPriorityCount: number
  hasInsufficientBuffers: boolean
}

export function StressIndicator({
  stressLevel,
  density,
  highPriorityCount,
  hasInsufficientBuffers,
}: StressIndicatorProps) {
  const getStressColor = () => {
    if (stressLevel <= 3) return "bg-stress-low"
    if (stressLevel <= 6) return "bg-stress-medium"
    return "bg-stress-high"
  }

  const getStressLabel = () => {
    if (stressLevel <= 3) return "Bajo"
    if (stressLevel <= 6) return "Medio"
    return "Alto"
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Nivel de estrés semanal</h3>

      <div className="space-y-3">
        {/* Stress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Nivel de estrés</span>
            <span className="text-sm font-medium text-foreground">{stressLevel}/10</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${getStressColor()} transition-all duration-300`}
              style={{ width: `${(stressLevel / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Density */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Densidad de agenda</span>
            <span className="text-sm font-medium text-foreground">{Math.round(density * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${density * 100}%` }} />
          </div>
        </div>

        {/* Alerts */}
        <div className="pt-2 space-y-1 text-xs">
          {highPriorityCount > 3 && (
            <p className="text-stress-high">⚠️ {highPriorityCount} tareas de alta prioridad esta semana</p>
          )}
          {hasInsufficientBuffers && <p className="text-stress-high">⚠️ Se detectaron buffers de tiempo limitados</p>}
          {stressLevel > 7 && <p className="text-stress-high">⚠️ Considera añadir más buffers o reprogramar</p>}
        </div>
      </div>
    </div>
  )
}
