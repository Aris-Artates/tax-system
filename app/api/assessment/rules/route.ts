import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/assessment/rules
 * Lists all tax rules with triple-base64 encoding.
 */
import { authorize } from '@/lib/auth-guard';

/**
 * GET /api/assessment/rules
 * Lists all tax rules with triple-base64 encoding.
 */
export async function GET() {
  try {
    if (!(await authorize('assessment', 'can_view'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const { data, error } = await supabaseAdmin
      .from('tax_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const payloadString = JSON.stringify({ rules: data || [] });
    // Triple base64 encoding as per project convention
    const l1 = Buffer.from(payloadString).toString("base64");
    const l2 = Buffer.from(l1).toString("base64");
    const obscuredPayload = Buffer.from(l2).toString("base64");

    return NextResponse.json({ _data: obscuredPayload });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch rules.' }, { status: 500 });
  }
}

/**
 * POST /api/assessment/rules
 * Saves or updates a tax rule.
 */
export async function POST(req: Request) {
  try {
    if (!(await authorize('assessment', 'can_edit'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const body = await req.json();
    const { id, ...payload } = body;

    let result;
    if (id) {
      // Update existing rule
      result = await supabaseAdmin
        .from('tax_rules')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
    } else {
      // Create new rule
      result = await supabaseAdmin
        .from('tax_rules')
        .insert({
          ...payload,
        })
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ rule: result.data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save rule.' }, { status: 500 });
  }
}

/**
 * DELETE /api/assessment/rules
 * Deletes a tax rule by ID.
 */
export async function DELETE(req: Request) {
  try {
    if (!(await authorize('assessment', 'can_delete'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('tax_rules')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete rule.' }, { status: 500 });
  }
}
