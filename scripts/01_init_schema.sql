-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  field_of_study TEXT,
  hours_per_week_working INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events/Classes table (academic, work shifts, personal)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('class', 'work', 'personal', 'exam', 'project')),
  priority INT DEFAULT 2 CHECK (priority BETWEEN 1 AND 5),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority INT DEFAULT 2 CHECK (priority BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  due_date DATE,
  estimated_hours DECIMAL(5, 2),
  linked_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time buffers table (dinámicos colchones de tiempo)
CREATE TABLE IF NOT EXISTS public.time_buffers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  duration_minutes INT NOT NULL,
  buffer_type TEXT NOT NULL CHECK (buffer_type IN ('after_event', 'before_event', 'rest')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stress level logs table
CREATE TABLE IF NOT EXISTS public.stress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stress_level INT CHECK (stress_level BETWEEN 1 AND 10),
  date DATE DEFAULT CURRENT_DATE,
  daily_density DECIMAL(3, 2),
  high_priority_events_count INT,
  insufficient_buffers BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Productivity reports table
CREATE TABLE IF NOT EXISTS public.productivity_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_starting DATE NOT NULL,
  total_tasks INT,
  completed_tasks INT,
  completion_rate DECIMAL(5, 2),
  average_stress_level DECIMAL(3, 2),
  study_hours_logged DECIMAL(6, 2),
  work_hours_logged DECIMAL(6, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_time_buffers_user_id ON public.time_buffers(user_id);
CREATE INDEX IF NOT EXISTS idx_stress_logs_user_id ON public.stress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_reports_user_id ON public.productivity_reports(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_buffers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own events" ON public.events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own events" ON public.events
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own events" ON public.events
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tasks" ON public.tasks
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own time buffers" ON public.time_buffers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create time buffers" ON public.time_buffers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own time buffers" ON public.time_buffers
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own stress logs" ON public.stress_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create stress logs" ON public.stress_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own reports" ON public.productivity_reports
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create reports" ON public.productivity_reports
  FOR INSERT WITH CHECK (user_id = auth.uid());
