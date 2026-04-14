import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

import { authorize } from '@/lib/auth-guard';

export async function GET(request: Request) {
  try {
    if (!(await authorize('barangay', 'can_view'))) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const year = searchParams.get('year') || '2024';
    const barangay = searchParams.get('barangay') || 'All Barangays';
    const classification = searchParams.get('classification') || '';

    if (!type) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('tax_declarations')
      .select(`
        id,
        td_number,
        classification,
        land_area,
        total_market_value,
        total_assessed_value,
        effectivity_year,
        status,
        taxpayers ( owner_name ),
        properties ( 
          pin, 
          barangays!inner ( name ) 
        )
      `)
      .eq('status', 'Active');

    // ── Apply filters based on report type ───────────────────────────────────
    
    if (year && year !== 'All Years') {
      query = query.eq('effectivity_year', parseInt(year));
    }

    if (barangay && barangay !== 'All Barangays') {
      query = query.eq('properties.barangays.name', barangay);
    }

    if (classification && classification !== '') {
      query = query.eq('classification', classification);
    }

    const { data: rows, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // ── Post-process data based on report type ───────────────────────────────
    
    let reportData: any = {
      title: '',
      subtitle: `Tax Year: ${year}${barangay !== 'All Barangays' ? ` | Barangay: ${barangay}` : ''}`,
      rows: []
    };

    if (type === 'assessment-roll') {
      reportData.title = 'Assessment Roll by Barangay';
      reportData.rows = (rows || []).map((r: any) => ({
        td: r.td_number,
        pin: r.properties?.pin || 'N/A',
        owner: r.taxpayers?.owner_name || 'N/A',
        class: r.classification,
        area: r.land_area,
        market: r.total_market_value,
        assessed: r.total_assessed_value
      }));
    } else if (type === 'summary-list') {
      reportData.title = 'Summary Assessment List';
      reportData.rows = (rows || []).map((r: any) => ({
        class: r.classification,
        td: r.td_number,
        owner: r.taxpayers?.owner_name || 'N/A',
        market: r.total_market_value,
        assessed: r.total_assessed_value
      }));
    } else if (type === 'barangay-summary') {
      reportData.title = 'Barangay Property Summary';
      // Group by barangay
      const summaryMap: Record<string, any> = {};
      (rows || []).forEach((r: any) => {
        const bName = r.properties?.barangays?.name || 'Unknown';
        if (!summaryMap[bName]) {
          summaryMap[bName] = { 
            barangay: bName, 
            count: 0, 
            market: 0, 
            assessed: 0 
          };
        }
        summaryMap[bName].count += 1;
        summaryMap[bName].market += (r.total_market_value || 0);
        summaryMap[bName].assessed += (r.total_assessed_value || 0);
      });
      reportData.rows = Object.values(summaryMap);
    } else if (type === 'delinquency-report') {
      reportData.title = 'Delinquency Report';
      // Delinquency report might need special fields (e.g. years overdue)
      // For now we just list current active assessments for the year
      reportData.rows = (rows || []).map((r: any) => ({
        td: r.td_number,
        owner: r.taxpayers?.owner_name || 'N/A',
        barangay: r.properties?.barangays?.name || 'N/A',
        market: r.total_market_value,
        assessed: r.total_assessed_value,
        due: r.total_assessed_value // placeholder for actual due
      }));
    }

    return NextResponse.json({ data: reportData });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unable to generate report data.' },
      { status: 500 },
    );
  }
}
