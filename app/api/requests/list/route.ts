import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

import { authorize, verifySession } from '@/lib/auth-guard';

export async function GET(request: Request) {
	try {
		if (!(await authorize('user', 'can_view'))) {
			return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
		}

		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get('tax_session');
		const sessionUser = verifySession(sessionCookie?.value);
		const roleId = Number(sessionUser.role_id);
		const empID = sessionUser.empID;

		const { searchParams } = new URL(request.url);
		const statusFilter = searchParams.get('status'); // 'pending' | 'approved' | 'denied' | null (all)

		let query = supabaseAdmin
			.from('permission_requests')
			.select('*')
			.order('created_at', { ascending: false });

		// Non-super-admins can only see their own requests
		if (roleId !== 1) {
			query = query.eq('requester_emp_id', empID);
		}

		if (statusFilter && ['pending', 'approved', 'denied'].includes(statusFilter)) {
			query = query.eq('status', statusFilter);
		}

		const { data, error } = await query;

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ requests: data || [] });
	} catch {
		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 },
		);
	}
}
