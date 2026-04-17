import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ALLOWED_DECLARATION_TYPES = ['New', 'Revision', 'Cancellation', 'Transfer'] as const;
const ALLOWED_CLASSIFICATIONS = ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Special', 'Timberland', 'Mineral'] as const;
const ALLOWED_QUARTERS = ['1st', '2nd', '3rd', '4th'] as const;
const ALLOWED_STRUCTURAL_TYPES = ['Type I Wood', 'Type II Mixed', 'Type III Masonry/Steel', 'Type IV Steel/RC', 'Type V RC'] as const;

type CreateTaxDeclarationBody = {
  td_number: string;
  arp_number?: string | null;
  declaration_type: string;
  tax_year: number;
  effectivity_year: number;
  effectivity_quarter: string;
  previous_td_id?: number | null;
  classification: string;
  actual_use?: string | null;
  land_area?: number | null;
  land_unit_value?: number | null;
  land_market_value?: number | null;
  land_assessment_level?: number | null;
  land_assessed_value?: number | null;
  total_market_value?: number | null;
  total_assessed_value?: number | null;
  taxpayer_id: string | number;
  property: {
    pin: string;
    barangay_id?: number | null;
    barangay_name?: string | null;
    municipality?: string | null;
    province?: string | null;
    street?: string | null;
    lot_number?: string | null;
    block_number?: string | null;
    survey_number?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  building?: {
    kind_of_building?: string | null;
    structural_type?: string | null;
    floor_area?: number | null;
    year_built?: number | null;
    market_value?: number | null;
    assessment_level?: number | null;
    assessed_value?: number | null;
    condition?: 'New' | 'Good' | 'Fair' | 'Poor' | 'Dilapidated' | null;
  } | null;
};

function isOneOf<T extends readonly string[]>(value: string, allowed: T): value is T[number] {
  return allowed.includes(value as T[number]);
}

function sanitizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
import { authorize } from '@/lib/auth-guard';

export async function POST(req: NextRequest) {
  try {
    if (!(await authorize('property', 'can_edit'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const body = (await req.json()) as CreateTaxDeclarationBody;

    if (!body.td_number?.trim()) {
      return NextResponse.json({ error: 'TD Number is required.' }, { status: 400 });
    }
    const taxpayerIdRaw = String(body.taxpayer_id ?? '').trim();
    if (!taxpayerIdRaw) {
      return NextResponse.json({ error: 'Taxpayer is required.' }, { status: 400 });
    }
    if (!body.property?.pin?.trim()) {
      return NextResponse.json({ error: 'Property PIN is required.' }, { status: 400 });
    }
    if (!body.property?.barangay_id && !body.property?.barangay_name?.trim()) {
      return NextResponse.json({ error: 'Barangay is required.' }, { status: 400 });
    }

    if (!isOneOf(body.declaration_type, ALLOWED_DECLARATION_TYPES)) {
      return NextResponse.json({ error: 'Invalid declaration type.' }, { status: 400 });
    }
    if (!isOneOf(body.classification, ALLOWED_CLASSIFICATIONS)) {
      return NextResponse.json({ error: 'Invalid classification.' }, { status: 400 });
    }
    if (!isOneOf(body.effectivity_quarter, ALLOWED_QUARTERS)) {
      return NextResponse.json({ error: 'Invalid effectivity quarter.' }, { status: 400 });
    }

    const { data: existingTd, error: existingTdError } = await supabaseAdmin
      .from('tax_declarations')
      .select('id')
      .eq('td_number', body.td_number.trim())
      .maybeSingle();

    if (existingTdError) {
      return NextResponse.json({ error: existingTdError.message }, { status: 400 });
    }
    if (existingTd) {
      return NextResponse.json({ error: 'TD Number already exists.' }, { status: 409 });
    }

    let resolvedBarangayId = body.property.barangay_id ?? null;

    if (!resolvedBarangayId) {
      const barangayName = body.property.barangay_name?.trim();
      const municipality = sanitizeText(body.property.municipality) ?? 'Sta. Rita';
      const province = sanitizeText(body.property.province) ?? 'Samar';

      const { data: existingBarangays, error: existingBarangaysError } = await supabaseAdmin
        .from('barangays')
        .select('id')
        .ilike('name', barangayName ?? '')
        .limit(1);

      if (existingBarangaysError) {
        return NextResponse.json({ error: existingBarangaysError.message }, { status: 400 });
      }

      if (existingBarangays && existingBarangays.length > 0) {
        resolvedBarangayId = existingBarangays[0].id;
      } else {
        const { data: insertedBarangay, error: insertBarangayError } = await supabaseAdmin
          .from('barangays')
          .insert({
            name: barangayName,
            municipality,
            province,
          })
          .select('id')
          .single();

        if (insertBarangayError || !insertedBarangay) {
          return NextResponse.json({ error: insertBarangayError?.message ?? 'Unable to create barangay.' }, { status: 400 });
        }

        resolvedBarangayId = insertedBarangay.id;
      }
    }

    const { data: matchedProperties, error: propertyLookupError } = await supabaseAdmin
      .from('properties')
      .select('id, pin')
      .eq('pin', body.property.pin.trim())
      .order('id', { ascending: false })
      .limit(1);

    if (propertyLookupError) {
      return NextResponse.json({ error: propertyLookupError.message }, { status: 400 });
    }

    let property = matchedProperties?.[0] ?? null;

    if (!property) {
      const { data: insertedProperty, error: propertyInsertError } = await supabaseAdmin
        .from('properties')
        .insert({
          pin: body.property.pin.trim(),
          barangay_id: resolvedBarangayId,
          municipality: sanitizeText(body.property.municipality) ?? 'Sta. Rita',
          province: sanitizeText(body.property.province) ?? 'Samar',
          street: sanitizeText(body.property.street),
          lot_number: sanitizeText(body.property.lot_number),
          block_number: sanitizeText(body.property.block_number),
          survey_number: sanitizeText(body.property.survey_number),
          latitude: body.property.latitude ?? null,
          longitude: body.property.longitude ?? null,
        })
        .select('id, pin')
        .single();

      if (propertyInsertError || !insertedProperty) {
        return NextResponse.json({ error: propertyInsertError?.message ?? 'Unable to create property.' }, { status: 400 });
      }

      property = insertedProperty;
    }

    const { data: declaration, error: declarationError } = await supabaseAdmin
      .from('tax_declarations')
      .insert({
        td_number: body.td_number.trim(),
        arp_number: sanitizeText(body.arp_number),
        declaration_type: body.declaration_type,
        tax_year: body.tax_year,
        effectivity_year: body.effectivity_year,
        effectivity_quarter: body.effectivity_quarter,
        previous_td_id: body.previous_td_id ?? null,
        classification: body.classification,
        actual_use: sanitizeText(body.actual_use),
        land_area: body.land_area ?? null,
        land_unit_value: body.land_unit_value ?? null,
        land_market_value: body.land_market_value ?? null,
        land_assessment_level: body.land_assessment_level ?? null,
        land_assessed_value: body.land_assessed_value ?? null,
        total_market_value: body.total_market_value ?? null,
        total_assessed_value: body.total_assessed_value ?? null,
        status: 'Active',
        taxpayer_id: taxpayerIdRaw,
        property_id: property.id,
      })
      .select('id, td_number, property_id, taxpayer_id')
      .single();

    if (declarationError || !declaration) {
      return NextResponse.json({ error: declarationError?.message ?? 'Unable to create tax declaration.' }, { status: 400 });
    }

    const hasBuilding = !!(
      body.building && (
        sanitizeText(body.building.kind_of_building)
        || sanitizeText(body.building.structural_type)
        || body.building.floor_area != null
        || body.building.year_built != null
        || body.building.market_value != null
        || body.building.assessment_level != null
        || body.building.assessed_value != null
      )
    );

    if (hasBuilding && body.building) {
      if (
        body.building.structural_type
        && !isOneOf(body.building.structural_type, ALLOWED_STRUCTURAL_TYPES)
      ) {
        return NextResponse.json({ error: 'Invalid structural type.' }, { status: 400 });
      }

      const { error: buildingError } = await supabaseAdmin
        .from('buildings')
        .insert({
          td_id: declaration.id,
          kind_of_building: sanitizeText(body.building.kind_of_building),
          structural_type: sanitizeText(body.building.structural_type),
          floor_area: body.building.floor_area ?? null,
          year_built: body.building.year_built ?? null,
          market_value: body.building.market_value ?? null,
          assessment_level: body.building.assessment_level ?? null,
          assessed_value: body.building.assessed_value ?? null,
          condition: body.building.condition ?? null,
        });

      if (buildingError) {
        return NextResponse.json({ error: buildingError.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      {
        message: 'Tax declaration created successfully.',
        td: declaration,
        property,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Unable to create tax declaration.' },
      { status: 500 },
    );
  }
}