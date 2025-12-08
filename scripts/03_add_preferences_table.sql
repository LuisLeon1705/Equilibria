-- Add preferences table for user customization
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Customization preferences
  background_type TEXT DEFAULT 'color' CHECK (background_type IN ('color', 'image')),
  background_color TEXT DEFAULT '#f8f9fa',
  background_image_url TEXT,
  
  -- Stress indicator colors (hex format: from_color to from_color)
  stress_color_low TEXT DEFAULT '#22c55e',      -- green
  stress_color_medium TEXT DEFAULT '#eab308',   -- yellow
  stress_color_high TEXT DEFAULT '#ef4444',     -- red
  
  -- Profile customization
  profile_picture_url TEXT,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  
  -- Default view preferences
  default_calendar_view TEXT DEFAULT 'week' CHECK (default_calendar_view IN ('day', 'week', 'month', 'year')),
  
  -- Notification preferences
  stress_alerts_enabled BOOLEAN DEFAULT TRUE,
  stress_alert_threshold INT DEFAULT 7,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
