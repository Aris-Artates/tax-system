import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type BarangayRecord = { name: string };

type TaxpayerRow = {
  id: number | string;
  owner_name: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  tin: string | null;
  owner_type: string | null;
  status: string | null;
  phone: string | null;
  email: string | null;
  address_details: string | null;
  barangay_id: number | null;
  barangays: BarangayRecord | BarangayRecord[] | null;
};
import { authorize } from '@/lib/auth-guard';

export async function GET() {
  try {
    if (!(await authorize('taxpayers', 'can_view'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const { data, error } = await supabaseAdmin
      .from('taxpayers')
      .select(
        'id, owner_name, first_name, middle_name, last_name, suffix, tin, owner_type, status, phone, email, address_details, barangay_id, barangays(name)',
      )
      .order('owner_name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const mapped = ((data ?? []) as TaxpayerRow[]).map((row) => {
      const barangayRecord = Array.isArray(row.barangays)
        ? row.barangays[0]
        : row.barangays;
      const barangayName = barangayRecord?.name?.trim() || '';
      const addressDetails = row.address_details?.trim() || '';

      return {
        ...row,
        address: [addressDetails, barangayName].filter(Boolean).join(', ') || null,
      };
    });

    const payloadString = JSON.stringify(mapped);
    const l1 = Buffer.from(payloadString).toString("base64");
    const l2 = Buffer.from(l1).toString("base64");
    const obscuredPayload = Buffer.from(l2).toString("base64");
    return NextResponse.json({ _data: obscuredPayload });
  } catch {
    return NextResponse.json(
      { error: 'Unable to load taxpayers.' },
      { status: 500 },
    );
  }
}
