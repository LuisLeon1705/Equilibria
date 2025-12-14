'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { getSupabaseClient } from '@/lib/supabase-client';

export function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchTheme = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: preferences } = await supabase
          .from("user_preferences")
          .select("theme")
          .eq("user_id", user.id)
          .single();
        if (preferences?.theme) {
          setTheme(preferences.theme);
        }
      }
    };
    fetchTheme();
  }, [setTheme, supabase]);

  return <>{children}</>;
}
