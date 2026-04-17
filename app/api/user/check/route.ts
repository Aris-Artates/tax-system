import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize } from '@/lib/auth-guard';

export async function GET(request: Request) {
  try {
    if (!(await authorize('user', 'can_view'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const field = searchParams.get('field'); // 'empID' or 'email'
    const value = searchParams.get('value')?.trim();

    if (!field || !['empID', 'email'].includes(field) || !value) {
      return NextResponse.json({ error: 'Missing field or value parameter' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select(field)
      .eq(field, value)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ exists: !!data });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
