import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';
import { signSession } from '@/lib/auth-guard';
import { logActivity } from '@/lib/activity-log';

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
    await logActivity(
      null,
      'LOGIN',
      'Authentication',
      `Failed login attempt: Username not found (${username})`,
      'Failed'
    );
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  }

  if (!user.status) {
    await logActivity(
      user.id,
      'LOGIN',
      'Authentication',
      `Failed login attempt: Account is inactive (${username})`,
      'Failed'
    );
    return NextResponse.json(
      { error: 'Your account is inactive. Contact your administrator.' },
      { status: 403 }
    );
  }

  const passwordMatch =
    user.password === password || user.temp_pass === password;

  if (!passwordMatch) {
    await logActivity(
      user.id,
      'LOGIN',
      'Authentication',
      `Failed login attempt: Incorrect password (${username})`,
      'Failed'
    );
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
  const signedSession = signSession(sessionData);

  cookieStore.set('tax_session', signedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });

  await logActivity(
    user.id,
    'LOGIN',
    'Authentication',
    `User logged in: ${user.firstname} ${user.lastname} (${user.username})`
  );

  return NextResponse.json({ success: true, user: sessionData });
}
