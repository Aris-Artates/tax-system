import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type UpdatePermissionPayload = {
	id: number;
	name: string;
	description?: string;
};

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as Partial<UpdatePermissionPayload>;
		const id = Number(body.id);
		const name = body.name?.trim() ?? '';
		const description = body.description?.trim() ?? '';

		if (!Number.isInteger(id) || id <= 0) {
			return NextResponse.json({ error: 'id is required.' }, { status: 400 });
		}

		if (!name) {
			return NextResponse.json({ error: 'name is required.' }, { status: 400 });
		}

		const { data: currentPermission, error: currentPermissionError } = await supabaseAdmin
			.from('permissions')
			.select('id, name')
			.eq('id', id)
			.maybeSingle();

		if (currentPermissionError) {
			return NextResponse.json({ error: currentPermissionError.message }, { status: 400 });
		}

		if (!currentPermission) {
			return NextResponse.json({ error: 'Permission not found.' }, { status: 404 });
		}

		const { data: existingPermission, error: existingError } = await supabaseAdmin
			.from('permissions')
			.select('id')
			.ilike('name', name)
			.neq('id', id)
			.limit(1)
			.maybeSingle();

		if (existingError) {
			return NextResponse.json({ error: existingError.message }, { status: 400 });
		}

		if (existingPermission) {
			return NextResponse.json({ error: 'Permission already exists.' }, { status: 409 });
		}

		const { data, error } = await supabaseAdmin
			.from('permissions')
			.update({ name, description })
			.eq('id', id)
			.select('id, name, description, created_at')
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ message: 'Permission updated successfully.', permission: data });
	} catch {
		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 },
		);
	}
}
