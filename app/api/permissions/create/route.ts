import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type CreatePermissionPayload = {
	name: string;
	description?: string;
};

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as Partial<CreatePermissionPayload>;
		const name = body.name?.trim() ?? '';
		const description = body.description?.trim() ?? '';

		if (!name) {
			return NextResponse.json({ error: 'name is required.' }, { status: 400 });
		}

		const { data: existingPermission, error: existingError } = await supabaseAdmin
			.from('permissions')
			.select('id')
			.ilike('name', name)
			.maybeSingle();

		if (existingError) {
			return NextResponse.json({ error: existingError.message }, { status: 400 });
		}

		if (existingPermission) {
			return NextResponse.json({ error: 'Permission already exists.' }, { status: 400 });
		}

		const { data, error } = await supabaseAdmin
			.from('permissions')
			.insert({ name, description })
			.select('id, name, description, created_at')
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ message: 'Permission added successfully.', permission: data });
	} catch {
		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 },
		);
	}
}
