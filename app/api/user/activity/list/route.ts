import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize } from '@/lib/auth-guard';

export async function GET() {
	try {
		if (!(await authorize('user', 'can_view'))) {
			return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
		}

		const { data, error } = await supabaseAdmin
			.from('activity_logs')
			.select(`
				*,
				users (
					firstname,
					middlename,
					lastname,
					suffix
				)
			`)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching activity logs:', error);
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ logs: data });
	} catch (err) {
		console.error('API Error:', err);
		return NextResponse.json(
			{ error: 'Internal Server Error.' },
			{ status: 500 },
		);
	}
}
