import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/taxpayers/linked?id=<taxpayer_id>
 *
 * Returns the taxpayer profile and all their linked tax declarations
 * with joined property and barangay data.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const [taxpayerResult, declsResult] = await Promise.all([
      supabaseAdmin
        .from('taxpayers')
        .select(
          'id, owner_name, first_name, middle_name, last_name, suffix, tin, owner_type, phone, email, address_details, barangay_id, barangays(name)',
        )
        .eq('id', id)
        .single(),

      supabaseAdmin
        .from('tax_declarations')
        .select(
          `id, td_number, classification, land_area,
           total_market_value, total_assessed_value, status, effectivity_year,
           properties(
             id, pin, street, lot_number, survey_number,
             latitude, longitude, barangay_id,
             barangays(id, name)
           )`,
        )
        .eq('taxpayer_id', id)
        .order('td_number', { ascending: true }),
    ]);

    if (taxpayerResult.error) {
      return NextResponse.json(
        { error: taxpayerResult.error.message },
        { status: 400 },
      );
    }
    if (declsResult.error) {
      return NextResponse.json(
        { error: declsResult.error.message },
        { status: 400 },
      );
    }

    const taxpayerRaw = taxpayerResult.data as
      | {
          address_details?: string | null;
          barangays?: { name?: string | null } | { name?: string | null }[] | null;
        }
      | null;

    const barangayRecord = Array.isArray(taxpayerRaw?.barangays)
      ? taxpayerRaw?.barangays[0]
      : taxpayerRaw?.barangays;

    const taxpayer = taxpayerRaw
      ? {
          ...taxpayerRaw,
          address:
            [taxpayerRaw.address_details?.trim() || '', barangayRecord?.name?.trim() || '']
              .filter(Boolean)
              .join(', ') || null,
        }
      : null;

    const payloadString = JSON.stringify({
      taxpayer,
      declarations: declsResult.data ?? [],
    });
    const l1 = Buffer.from(payloadString).toString("base64");
    const l2 = Buffer.from(l1).toString("base64");
    const obscuredPayload = Buffer.from(l2).toString("base64");

    return NextResponse.json({ _data: obscuredPayload });
  } catch {
    return NextResponse.json(
      { error: 'Unable to load linked data.' },
      { status: 500 },
    );
  }
}
