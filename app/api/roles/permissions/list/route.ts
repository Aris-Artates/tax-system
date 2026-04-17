import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize } from '@/lib/auth-guard';

export async function GET(request: Request) {
  try {
    if (!(await authorize('user', 'can_view'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const url = new URL(request.url);
    const roleId = url.searchParams.get('roleId');
    if (!roleId) {
      return NextResponse.json({ error: 'roleId query parameter is required.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('roles')
      .select('permission_id')
      .eq('id', roleId as string)
      .single();

    if (error) {
      return NextResponse.json({ permission_id: null, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ permission_id: data?.permission_id ?? null });
  } catch {
    return NextResponse.json({ permission_id: null, error: 'Unable to load permissions.' }, { status: 500 });
  }
}