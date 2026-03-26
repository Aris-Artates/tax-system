import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type UpdatePermissionPayload = {
	id: number;
	name: string;
	description?: string;
	roleIds?: number[];
};

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as Partial<UpdatePermissionPayload>;
		const id = Number(body.id);
		const name = body.name?.trim() ?? '';
		const description = body.description?.trim() ?? '';
		const roleIds = body.roleIds;

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

		// 1. Update Permission Name/Description
		const { data, error } = await supabaseAdmin
			.from('permissions')
			.update({ name, description })
			.eq('id', id)
			.select('id, name, description, created_at')
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		// 2. Batch Sync Roles if roleIds provided
		if (Array.isArray(roleIds)) {
			// First, clear existing assignments
			const { error: deleteError } = await supabaseAdmin
				.from('role_permissions')
				.delete()
				.eq('permission_id', id);

			if (deleteError) {
				return NextResponse.json({ error: 'Failed to clear old role assignments: ' + deleteError.message }, { status: 400 });
			}

			// Then insert new ones if any
			if (roleIds.length > 0) {
				const insertRows = roleIds.map(rid => ({
					role_id: rid,
					permission_id: id
				}));
                
				const { error: insertError } = await supabaseAdmin
					.from('role_permissions')
					.insert(insertRows);

				if (insertError) {
					return NextResponse.json({ error: 'Failed to assign roles: ' + insertError.message }, { status: 400 });
				}
			}
		}

		return NextResponse.json({ message: 'Permission updated successfully.', permission: data });
	} catch (e: any) {
		return NextResponse.json(
			{ error: 'Unable to process request: ' + e.message },
			{ status: 500 },
		);
	}
}
