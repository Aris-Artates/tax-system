import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize } from '@/lib/auth-guard';

export async function GET() {
	try {
		if (!(await authorize('user', 'can_view'))) {
			return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
		}
		const { data, error } = await supabaseAdmin
			.from('users')
			.select('empID, username, firstname, middlename, lastname, suffix, role_id, status, email, sex, birthdate, age, mobile_number, department, position, image_path, roles(name, icon)')
			.neq('role_id', 1)
			.order('firstname', { ascending: true });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ users: data });
	} catch {
		return NextResponse.json(
			{ error: 'Unable to load users.' },
			{ status: 500 },
		);
	}
}
