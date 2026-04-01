import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('tax_declarations')
      .select(`
        td_number,
        taxpayers (
          owner_name,
          first_name,
          middle_name,
          last_name,
          suffix
        )
      `)
      .order('td_number', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Format the data for the Combobox
    const formattedData = data?.map((td: any) => {
      const tp = td.taxpayers;
      let fullName = tp.owner_name;
      
      if (!fullName && tp.first_name) {
        fullName = [tp.first_name, tp.middle_name, tp.last_name, tp.suffix]
          .filter(Boolean)
          .join(' ');
      }

      return {
        value: td.td_number,
        label: td.td_number,
        sublabel: fullName || 'No owner assigned',
      };
    });

    return NextResponse.json(formattedData);
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
