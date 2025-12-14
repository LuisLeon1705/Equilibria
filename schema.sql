-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type = ANY (ARRAY['class'::text, 'work'::text, 'personal'::text, 'exam'::text, 'project'::text])),
  priority integer DEFAULT 2 CHECK (priority >= 1 AND priority <= 5),
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  recurrence text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.productivity_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  week_starting date NOT NULL,
  total_tasks integer,
  completed_tasks integer,
  completion_rate numeric,
  average_stress_level numeric,
  study_hours_logged numeric,
  work_hours_logged numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT productivity_reports_pkey PRIMARY KEY (id),
  CONSTRAINT productivity_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  field_of_study text,
  hours_per_week_working integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.stress_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  date date DEFAULT CURRENT_DATE,
  daily_density numeric,
  high_priority_events_count integer,
  insufficient_buffers boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stress_logs_pkey PRIMARY KEY (id),
  CONSTRAINT stress_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  priority integer DEFAULT 2 CHECK (priority >= 1 AND priority <= 5),
  status text NOT NULL DEFAULT 'todo'::text CHECK (status = ANY (ARRAY['todo'::text, 'in_progress'::text, 'completed'::text])),
  due_date date,
  estimated_hours numeric,
  linked_event_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT tasks_linked_event_id_fkey FOREIGN KEY (linked_event_id) REFERENCES public.events(id)
);
CREATE TABLE public.time_buffers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  event_id uuid NOT NULL,
  duration_minutes integer NOT NULL,
  buffer_type text NOT NULL CHECK (buffer_type = ANY (ARRAY['after_event'::text, 'before_event'::text, 'rest'::text])),
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT time_buffers_pkey PRIMARY KEY (id),
  CONSTRAINT time_buffers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT time_buffers_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  background_type text DEFAULT 'color'::text CHECK (background_type = ANY (ARRAY['color'::text, 'image'::text])),
  background_color text DEFAULT '#f8f9fa'::text,
  background_image_url text,
  stress_color_low text DEFAULT '#22c55e'::text,
  stress_color_medium text DEFAULT '#eab308'::text,
  stress_color_high text DEFAULT '#ef4444'::text,
  profile_picture_url text,
  theme text DEFAULT 'light'::text CHECK (theme = ANY (ARRAY['light'::text, 'dark'::text, 'auto'::text])),
  default_calendar_view text DEFAULT 'week'::text CHECK (default_calendar_view = ANY (ARRAY['day'::text, 'week'::text, 'month'::text, 'year'::text])),
  stress_alerts_enabled boolean DEFAULT true,
  stress_alert_threshold integer DEFAULT 7,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);