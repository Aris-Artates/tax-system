import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type CreateRolePayload = {
	name: string;
	permission_id?: number;
	permission_ids?: number[];
	icon?: string;
};

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as Partial<CreateRolePayload>;
		const name = body.name?.trim() ?? '';
		const rawPermissionIds = Array.isArray(body.permission_ids)
			? body.permission_ids
			: body.permission_id !== undefined
				? [body.permission_id]
				: [];

		const permissionIds = [...new Set(rawPermissionIds.map((value) => Number(value)))].filter(
			(value) => Number.isInteger(value) && value > 0,
		);

		if (!name) {
			return NextResponse.json({ error: 'name is required.' }, { status: 400 });
		}

		if (permissionIds.length === 0) {
			return NextResponse.json({ error: 'permission_ids is required.' }, { status: 400 });
		}

		const { data: existingRole, error: existingRoleError } = await supabaseAdmin
			.from('roles')
			.select('id, name')
			.ilike('name', name)
			.limit(1)
			.maybeSingle();

		if (existingRoleError) {
			return NextResponse.json({ error: existingRoleError.message }, { status: 400 });
		}

		if (existingRole) {
			return NextResponse.json({ error: 'Role already exists.' }, { status: 409 });
		}

		const { data: permissionRows, error: permissionError } = await supabaseAdmin
			.from('permissions')
			.select('id')
			.in('id', permissionIds);

		if (permissionError || (permissionRows ?? []).length !== permissionIds.length) {
			return NextResponse.json(
				{ error: 'One or more selected permissions are invalid.' },
				{ status: 400 },
			);
		}

		const icon = body.icon ?? 'KeyRound';

		const { data, error } = await supabaseAdmin
			.from('roles')
			.insert({ name, icon })
			.select('*')
			.single();

		if (error) {
			if (error.code === '23505') {
				return NextResponse.json({ error: 'Role already exists.' }, { status: 409 });
			}

			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const roleId = data?.id;
		if (roleId) {
			const rolePermissionRows = permissionIds.map((permissionId) => ({
				role_id: roleId,
				permission_id: permissionId,
			}));

			const { error: rolePermissionsError } = await supabaseAdmin
				.from('role_permissions')
				.insert(rolePermissionRows);

			if (rolePermissionsError) {
				await supabaseAdmin.from('roles').delete().eq('id', roleId);

				return NextResponse.json(
					{
						error: rolePermissionsError.message,
					},
					{ status: 400 },
				);
			}
		}

		return NextResponse.json({
			message: 'Role created successfully.',
			role: data,
			permission_ids: permissionIds,
		});
	} catch {
		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 },
		);
	}
}
