import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
	try {
		const { data, error } = await supabaseAdmin
			.from('users')
			.select('empID, username, firstname, middlename, lastname, suffix, role_id, status, email, sex, birthdate, age, phone, department, position, image_path, roles(name)')
			.order('firstname', { ascending: true });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const payloadString = JSON.stringify(data ?? []);
		const l1 = Buffer.from(payloadString).toString("base64");
		const l2 = Buffer.from(l1).toString("base64");
		const obscuredPayload = Buffer.from(l2).toString("base64");
		return NextResponse.json({ _data: obscuredPayload });
	} catch {
		return NextResponse.json(
			{ error: 'Unable to load users.' },
			{ status: 500 },
		);
	}
}
