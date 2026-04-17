import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize } from '@/lib/auth-guard';

export async function GET() {
  try {
    if (!(await authorize('barangay', 'can_view'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const { data, error } = await supabaseAdmin
      .from('barangays')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const payloadString = JSON.stringify(data ?? []);
    const l1 = Buffer.from(payloadString).toString("base64");
    const l2 = Buffer.from(l1).toString("base64");
    const obscuredPayload = Buffer.from(l2).toString("base64");
    return NextResponse.json({ _data: obscuredPayload });
  } catch {
    return NextResponse.json(
      { error: 'Unable to load barangays.' },
      { status: 500 },
    );
  }
}