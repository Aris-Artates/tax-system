import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';


import { authorize } from '@/lib/auth-guard';


export async function GET(req: NextRequest) {
  try {
    if (!(await authorize('property', 'can_view'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const barangayId = searchParams.get('barangay_id');

    if (!barangayId) {
      return NextResponse.json({ error: 'barangay_id is required.' }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from('tax_declarations')
      .select(`
        id,
        td_number,
        classification,
        land_area,
        total_market_value,
        total_assessed_value,
        taxpayers ( owner_name ),
        properties!inner ( barangay_id )
      `)
      .eq('properties.barangay_id', Number(barangayId))
      .eq('status', 'Active')
      .order('td_number', { ascending: true });

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
      { error: 'Unable to load properties for this barangay.' },
      { status: 500 },
    );
  }
}