import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/assessment/billing/drafts
 * Lists all recent billing drafts.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('billing_drafts')
      .select('*')
      .eq('status', 'draft')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ drafts: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch drafts.' }, { status: 500 });
  }
}

/**
 * POST /api/assessment/billing/drafts
 * Saves or updates a billing draft.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...payload } = body;

    let result;
    if (id) {
      // Update existing
      result = await supabaseAdmin
        .from('billing_drafts')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
    } else {
      // Create new
      result = await supabaseAdmin
        .from('billing_drafts')
        .insert({
          ...payload,
          status: 'draft',
        })
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ draft: result.data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save draft.' }, { status: 500 });
  }
}
