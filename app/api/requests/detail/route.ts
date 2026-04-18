import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySession, authorize } from '@/lib/auth-guard';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
	try {
        const cookieStore = await cookies();
		const sessionCookie = cookieStore.get('tax_session');
		const sessionUser = verifySession(sessionCookie?.value);

		if (!sessionUser) {
			return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
		}

		if (!(await authorize('user', 'can_view'))) {
			return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json({ error: 'id is required' }, { status: 400 });
		}

		const { data, error } = await supabaseAdmin
			.from('permission_requests')
			.select('*, users(role_id)')
			.eq('id', id)
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ request: data });
	} catch {
		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 }
		);
	}
}
