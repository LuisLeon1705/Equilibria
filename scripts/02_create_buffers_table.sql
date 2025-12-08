-- Create time_buffers table if not exists
CREATE TABLE IF NOT EXISTS time_buffers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  buffer_type TEXT DEFAULT 'after_event',
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE time_buffers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own buffers"
  ON time_buffers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own buffers"
  ON time_buffers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buffers"
  ON time_buffers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own buffers"
  ON time_buffers FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_time_buffers_user_id ON time_buffers(user_id);
CREATE INDEX IF NOT EXISTS idx_time_buffers_event_id ON time_buffers(event_id);
