import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const empID = searchParams.get('empID')?.trim();

		if (!empID) {
			return NextResponse.json({ error: 'empID is required.' }, { status: 400 });
		}

		const { data, error } = await supabaseAdmin
			.from('users')
			.select(
				'empID, username, firstname, middlename, lastname, suffix, birthdate, age, sex, email, phone, role_id, department, position, status, image_path, roles(name)',
			)
			.eq('empID', empID)
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		if (!data) {
			return NextResponse.json({ error: 'User not found.' }, { status: 404 });
		}

		return NextResponse.json({ user: data });
	} catch {
		return NextResponse.json(
			{ error: 'Unable to load user details.' },
			{ status: 500 },
		);
	}
}
