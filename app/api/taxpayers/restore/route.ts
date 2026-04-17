import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type RestoreTaxpayerPayload = {
  id: number | string;
};

type BarangayRecord = { name: string };
import { authorize } from '@/lib/auth-guard';

export async function PUT(req: NextRequest) {
  try {
    if (!(await authorize('taxpayers', 'can_edit'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const body = (await req.json()) as Partial<RestoreTaxpayerPayload>;

    const rawId = body.id;
    const id = typeof rawId === 'string' ? rawId.trim() : rawId;

    const hasInvalidId =
      (typeof id !== 'string' && typeof id !== 'number') ||
      (typeof id === 'string' && id.length === 0) ||
      (typeof id === 'number' && !Number.isFinite(id));

    if (hasInvalidId) {
      return NextResponse.json({ error: 'Taxpayer ID is required.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('taxpayers')
      .update({ status: 'Active' })
      .eq('id', id)
      .select(
        'id, owner_name, first_name, middle_name, last_name, suffix, tin, owner_type, status, phone, email, address_details, barangay_id, barangays(name)',
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const barangayRecord = Array.isArray(data?.barangays)
      ? (data?.barangays[0] as BarangayRecord | undefined)
      : (data?.barangays as BarangayRecord | null | undefined);
    const formattedTaxpayer = {
      ...data,
      address:
        [data?.address_details?.trim() || '', barangayRecord?.name?.trim() || '']
          .filter(Boolean)
          .join(', ') || null,
    };

    return NextResponse.json({ message: 'Taxpayer restored successfully.', taxpayer: formattedTaxpayer });
  } catch {
    return NextResponse.json({ error: 'Unable to restore taxpayer.' }, { status: 500 });
  }
}
