import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const isNextOrRequest = req.nextUrl.searchParams.get('next-or') === 'true';

    if (isNextOrRequest) {
      const { data, error } = await supabaseAdmin
        .from('payments')
        .select('or_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const currentYear = new Date().getFullYear();
      let nextOrNumber = `OR-${currentYear}-000001`;

      if (data && data.length > 0) {
        const lastOr = data[0].or_number;
        const match = lastOr.match(/OR-(\d+)-(\d+)/);
        if (match) {
          const year = parseInt(match[1]);
          const seq = parseInt(match[2]);
          
          if (year === currentYear) {
            nextOrNumber = `OR-${currentYear}-${(seq + 1).toString().padStart(6, '0')}`;
          }
        }
      }

      return NextResponse.json({ nextOrNumber });
    }

    // Default: Fetch all payments for the Log page
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tdn, taxpayer_name, amount_paid, payment_method, or_number, payment_date } = body;

    if (!tdn || !taxpayer_name || !amount_paid || !payment_method || !or_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert([
        {
          tdn,
          taxpayer_name,
          amount_paid,
          payment_method,
          or_number,
          payment_date: payment_date || new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'O.R. Number already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
