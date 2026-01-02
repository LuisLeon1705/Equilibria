"use client"

import { useState, useEffect, useMemo } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Circle, CheckCircle2, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface Task {
  id: string
  title: string
  status: string
  priority: number
  due_date: string
}

interface TaskListProps {
  tasks: Task[]
}

const priorityColors = {
  1: "text-blue-600 dark:text-blue-400",
  2: "text-green-600 dark:text-green-400",
  3: "text-yellow-600 dark:text-yellow-400",
  4: "text-orange-600 dark:text-orange-400",
  5: "text-red-600 dark:text-red-400",
}

export function TaskList({ tasks: initialTasks }: TaskListProps) {
  const supabase = getSupabaseClient()
  const [localTasks, setLocalTasks] = useState(initialTasks)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    setLocalTasks(initialTasks)
  }, [initialTasks])

  const toggleTaskComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed"
    const originalTasks = [...localTasks]
    
    // Optimistic UI update
    setLocalTasks(prevTasks => 
      prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    )
    setUpdatingId(taskId)

    try {
      const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId)
      if (error) throw error
    } catch (error) {
      console.log("[v0] Error updating task, reverting:", error)
      // Revert on error
      setLocalTasks(originalTasks)
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteTask = async (taskId: string) => {
    const originalTasks = [...localTasks]
    
    // Optimistic UI update
    setLocalTasks(prevTasks => prevTasks.filter(t => t.id !== taskId))
    setUpdatingId(taskId)

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)
      if (error) throw error
    } catch (error) {
      console.log("[v0] Error deleting task, reverting:", error)
      // Revert on error
      setLocalTasks(originalTasks)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredTasks = useMemo(() => {
    return localTasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCompleted = showCompleted ? true : task.status !== "completed"
        return matchesSearch && matchesCompleted
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
  }, [localTasks, searchTerm, showCompleted])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-completed"
            checked={showCompleted}
            onCheckedChange={setShowCompleted}
          />
          <Label htmlFor="show-completed" className="text-sm">Mostrar completadas</Label>
        </div>
      </div>

      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">
            {searchTerm
              ? "No hay tareas que coincidan con tu búsqueda."
              : (showCompleted
                  ? "No hay tareas para mostrar."
                  : "No hay tareas activas. ¡Buen trabajo!")}
          </p>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleTaskComplete(task.id, task.status)}
                disabled={updatingId === task.id}
                className="mt-0.5 flex-shrink-0 h-auto px-0 py-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Marcar "${task.title}" como ${task.status === "completed" ? "incompleta" : "completada"}`}
              >
                {task.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </Button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-foreground truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">{new Date(task.due_date).toLocaleDateString()}</p>
              </div>

              <div
                className={`text-xs font-semibold flex-shrink-0 ${
                  priorityColors[task.priority as keyof typeof priorityColors] || priorityColors[3]
                }`}
              >
                P{task.priority}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask(task.id)}
                disabled={updatingId === task.id}
                className="flex-shrink-0 h-auto px-0 py-0 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                aria-label={`Eliminar tarea "${task.title}"`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}