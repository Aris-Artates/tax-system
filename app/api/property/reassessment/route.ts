import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      oldTdId,
      oldTdNumber,
      property_id,
      taxpayer_id,
      newTdNumber,
      reason,
      newClassification,
      newLandArea,
      newUnitValue,
      newMarketValue,
      newAssessLevel,
      newAssessedValue,
      bldgChanges,
      effectivityYear,
      notes,
    } = body;

    // Validate required fields
    if (!oldTdId || !newTdNumber || !reason || !newClassification) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update old TD status to 'Previous'
    const { error: updateError } = await supabaseAdmin
      .from('tax_declarations')
      .update({ status: 'Previous' })
      .eq('id', oldTdId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update old record: ' + updateError.message }, { status: 400 });
    }

    // 2. Insert new TD record
    const { data: newData, error: insertError } = await supabaseAdmin
      .from('tax_declarations')
      .insert({
        td_number: newTdNumber,
        property_id,
        taxpayer_id,
        classification: newClassification,
        land_area: newLandArea,
        total_market_value: newMarketValue,
        land_assessment_level: newAssessLevel,
        total_assessed_value: newAssessedValue,
        effectivity_year: parseInt(effectivityYear) || 2024,
        remarks: notes || `Revision from ${oldTdNumber} due to ${reason}`,
        status: 'Active',
        // If there were building changes, they might be logged here or in a separate table.
        // For now, we put it in remarks if provided.
        notations: bldgChanges || null
      })
      .select()
      .single();

    if (insertError) {
      // Rollback old ID status if possible or notify? Simplest is to just error.
      // In a real system, use a proper transaction or RPC call.
      return NextResponse.json({ error: 'Failed to create new record: ' + insertError.message }, { status: 400 });
    }

    // 3. (Optional) Log the revision history in a dedicated table if exists
    // await supabaseAdmin.from('assessment_history').insert({ ... });

    return NextResponse.json({ success: true, data: newData });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unable to process reassessment.' },
      { status: 500 },
    );
  }
}
