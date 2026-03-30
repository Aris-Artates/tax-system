import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch all schedule tables in parallel
    const [smvRes, levelRes, depRes] = await Promise.all([
      supabaseAdmin.from('smv_schedules').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('assessment_level_schedules').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('depreciation_schedules').select('*').order('created_at', { ascending: false }),
    ]);

    if (smvRes.error || levelRes.error || depRes.error) {
      throw new Error('Failed to fetch some schedules');
    }

    return NextResponse.json({
      smv: smvRes.data || [],
      levels: levelRes.data || [],
      depreciation: depRes.data || [],
    });
  } catch (error) {
    console.error('Schedules GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let tableName = '';
    if (type === 'smv') tableName = 'smv_schedules';
    else if (type === 'level') tableName = 'assessment_level_schedules';
    else if (type === 'depreciation') tableName = 'depreciation_schedules';
    else throw new Error('Invalid schedule type');

    const { error } = await supabaseAdmin.from(tableName).insert([data]);

    if (error) {
      console.error(`Schedules POST error (${tableName}):`, error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Schedules POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
