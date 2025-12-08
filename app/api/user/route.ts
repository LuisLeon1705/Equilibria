
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { name, email, password } = await request.json();

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const { error: userError } = await supabase.auth.updateUser({
    email,
    password,
  });

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ name })
    .eq('id', user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Profile updated successfully' });
}
