export interface Event {
  id: string
  user_id: string
  title: string
  description?: string
  type: "class" | "work" | "exam" | "project" | "personal"
  priority: number
  start_time: string
  end_time: string
  recurrence?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  priority: number
  status: "todo" | "in_progress" | "completed"
  due_date?: string
  estimated_hours?: number
  linked_event_id?: string
  created_at: string
  updated_at: string
}

export interface TimeBuffer {
  id: string
  user_id: string
  event_id: string
  duration_minutes: number
  buffer_type: "after_event" | "before_event" | "rest"
  reason?: string
  created_at: string
}

export interface StressLog {
  id: string
  user_id: string
  stress_level: number
  date: string
  daily_density: number
  high_priority_events_count: number
  insufficient_buffers: boolean
  notes?: string
  created_at: string
}

export interface ProductivityReport {
  id: string
  user_id: string
  week_starting: string
  total_tasks: number
  completed_tasks: number
  completion_rate: number
  average_stress_level: number
  study_hours_logged: number
  work_hours_logged: number
  notes?: string
  created_at: string
}
