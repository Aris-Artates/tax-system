import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
	try {
		const { data, error } = await supabaseAdmin
			.from('users')
			.select('empID, username, firstname, middlename, lastname, suffix, role_id, status, email, sex, birthdate, age, phone, department, position, roles(name)')
			.order('firstname', { ascending: true });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ users: data ?? [] });
	} catch {
		return NextResponse.json(
			{ error: 'Unable to load users.' },
			{ status: 500 },
		);
	}
}
