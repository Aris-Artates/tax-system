import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/properties/linked?id=<property_id>
 *
 * Returns the property record and all linked tax declarations
 * with taxpayer info joined.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const [propertyResult, declsResult] = await Promise.all([
      supabaseAdmin
        .from('properties')
        .select(
          'id, pin, street, lot_number, survey_number, latitude, longitude, barangay_id, barangays(id, name)',
        )
        .eq('id', id)
        .single(),

      supabaseAdmin
        .from('tax_declarations')
        .select(
          `id, td_number, classification, land_area,
           total_market_value, total_assessed_value, status, effectivity_year,
           taxpayers(
             id, owner_name, tin, owner_type, phone, email, address_details, barangay_id,
             barangays(id, name, municipality, province)
           )`,
        )
        .eq('property_id', id)
        .order('td_number', { ascending: true }),
    ]);

    if (propertyResult.error) {
      return NextResponse.json(
        { error: propertyResult.error.message },
        { status: 400 },
      );
    }
    if (declsResult.error) {
      return NextResponse.json(
        { error: declsResult.error.message },
        { status: 400 },
      );
    }

    const declarations = (declsResult.data ?? []).map((decl) => {
      const taxpayerRaw = decl.taxpayers as
        | {
            address_details?: string | null;
            barangays?: { name?: string | null } | { name?: string | null }[] | null;
          }
        | null
        | undefined;

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
        : taxpayerRaw;

      return {
        ...decl,
        taxpayers: taxpayer,
      };
    });

    const payloadString = JSON.stringify({
      property: propertyResult.data,
      declarations,
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
