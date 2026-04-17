import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySession, authorize } from '@/lib/auth-guard';

type ReviewPayload = {
	request_id: string;
	action: 'approved' | 'denied';
	review_note?: string;
};

export async function POST(request: Request) {
	try {
		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get('tax_session');
		const sessionUser = verifySession(sessionCookie?.value);

		if (!sessionUser) {
			return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
		}

		// Only Super Admin can review (Role ID 1)
		// Using authorize helper for consistency
		if (!(await authorize('user', 'can_edit'))) {
			return NextResponse.json({ error: 'Unauthorized: You do not have permission to review requests.' }, { status: 403 });
		}

		const roleId = Number(sessionUser.role_id);

		// Only Super Admin can review
		if (roleId !== 1) {
			return NextResponse.json({ error: 'Unauthorized: Only Super Admins can review requests.' }, { status: 403 });
		}

		const body = (await request.json()) as Partial<ReviewPayload>;

		if (!body.request_id) {
			return NextResponse.json({ error: 'request_id is required.' }, { status: 400 });
		}

		if (!body.action || !['approved', 'denied'].includes(body.action)) {
			return NextResponse.json({ error: 'action must be "approved" or "denied".' }, { status: 400 });
		}

		const { data, error } = await supabaseAdmin
			.from('permission_requests')
			.update({
				status: body.action,
				reviewed_by: sessionUser.empID,
				review_note: body.review_note?.trim() || null,
				updated_at: new Date().toISOString(),
			})
			.eq('id', body.request_id)
			.eq('status', 'pending') 
			.select('id, status, updated_at')
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		if (!data) {
			return NextResponse.json({ error: 'Request not found or already reviewed.' }, { status: 404 });
		}

		return NextResponse.json({
			message: `Request ${body.action} successfully.`,
			request: data,
		});
	} catch {
		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 },
		);
	}
}
