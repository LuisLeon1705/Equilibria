
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(userId: string, name: string) {
  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase
    .from('profiles')
    .update({ name })
    .eq('id', userId);

  if (error) {
    return { error: { message: error.message } };
  }

  revalidatePath('/profile');
  return { error: null };
}

export async function updateThemeSettings(
  userId: string,
  primaryColor: string,
  backgroundColor: string,
  backgroundImage: string
) {
  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase
    .from('user_preferences')
    .update({
      primary_color: primaryColor,
      background_color: backgroundColor,
      background_image: backgroundImage,
    })
    .eq('user_id', userId);

  if (error) {
    return { error: { message: error.message } };
  }

  revalidatePath('/profile');
  return { error: null };
}
