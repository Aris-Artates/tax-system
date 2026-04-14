import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

type RoleRecord = { name: string };

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username?.trim() || !password?.trim()) {
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400 }
    );
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, empID, username, firstname, lastname, email, role_id, status, password, temp_pass, roles(name)')
    .eq('username', username.trim())
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  }

  if (!user.status) {
    return NextResponse.json(
      { error: 'Your account is inactive. Contact your administrator.' },
      { status: 403 }
    );
  }

  const passwordMatch =
    user.password === password || user.temp_pass === password;

  if (!passwordMatch) {
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  }

  const roleRecord = Array.isArray(user.roles)
    ? (user.roles[0] as RoleRecord | undefined)
    : (user.roles as RoleRecord | null);

  const sessionData = {
    id: user.id,
    empID: user.empID,
    username: user.username,
    name: `${user.firstname} ${user.lastname}`,
    email: user.email || '',
    role: roleRecord?.name || '',
    role_id: user.role_id,
  };

  const cookieStore = await cookies();
  cookieStore.set('tax_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });

  return NextResponse.json({ success: true, user: sessionData });
}
