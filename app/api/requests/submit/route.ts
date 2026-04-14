import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type ModuleRequest = {
	module: string;
	tabs: string[];
};

type SubmitPayload = {
	modules: ModuleRequest[];
	justification: string;
};

export async function POST(request: Request) {
	try {
		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get('tax_session');

		if (!sessionCookie?.value) {
			return NextResponse.json({ error: 'Unauthorized: No active session.' }, { status: 401 });
		}

		const sessionUser = JSON.parse(sessionCookie.value);
		const empID = sessionUser.empID;
		const name = sessionUser.name || `${sessionUser.firstname} ${sessionUser.lastname}`;
		const role = sessionUser.role || 'Unknown';

		if (!empID) {
			return NextResponse.json({ error: 'Invalid session data.' }, { status: 401 });
		}

		const body = (await request.json()) as Partial<SubmitPayload>;

		if (!body.modules || !Array.isArray(body.modules) || body.modules.length === 0) {
			return NextResponse.json({ error: 'At least one module must be selected.' }, { status: 400 });
		}

		if (!body.justification?.trim()) {
			return NextResponse.json({ error: 'Justification is required.' }, { status: 400 });
		}

		// Validate each module entry
		for (const mod of body.modules) {
			if (!mod.module || !Array.isArray(mod.tabs) || mod.tabs.length === 0) {
				return NextResponse.json({ error: 'Each module must have at least one sub-module selected.' }, { status: 400 });
			}
		}

		const { data, error } = await supabaseAdmin
			.from('permission_requests')
			.insert({
				requester_user_id: sessionUser.id ? Number(sessionUser.id) : null,
				requester_emp_id: empID,
				requester_name: name,
				requester_role: role,
				modules: body.modules,
				justification: body.justification.trim(),
				status: 'pending'
			})
			.select('id, created_at')
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ 
			message: 'Permission request submitted successfully.', 
			request: data 
		});
	} catch {
		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 },
		);
	}
}
