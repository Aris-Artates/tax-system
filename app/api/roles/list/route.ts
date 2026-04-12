import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
	try {
		const { data: roles, error: rolesError } = await supabaseAdmin
			.from('roles')
			.select('id, name, icon, created_at')
			.neq('id', 1)
			.order('name', { ascending: true });

		if (rolesError) {
			return NextResponse.json({ error: rolesError.message }, { status: 400 });
		}

		const roleIds = (roles ?? []).map((role) => role.id).filter(Boolean);

		if (roleIds.length === 0) {
			return NextResponse.json({ roles: [] });
		}

		const { data: rolePermissionRows, error: rolePermissionsError } = await supabaseAdmin
			.from('role_permissions')
			.select('role_id, permission_id, permissions(id, name)')
			.in('role_id', roleIds);

		if (rolePermissionsError) {
			return NextResponse.json({ error: rolePermissionsError.message }, { status: 400 });
		}

		const permissionNamesByRoleId = new Map<number, string[]>();

		for (const row of rolePermissionRows ?? []) {
			const roleId = Number(row.role_id);
			if (!Number.isInteger(roleId)) continue;

			const permissionRecord = Array.isArray(row.permissions)
				? row.permissions[0]
				: row.permissions;
			const permissionName = permissionRecord?.name?.trim() ?? '';
			if (!permissionName) continue;

			const current = permissionNamesByRoleId.get(roleId) ?? [];
			if (!current.includes(permissionName)) {
				current.push(permissionName);
				permissionNamesByRoleId.set(roleId, current);
			}
		}

		const normalizedRoles = (roles ?? []).map((role) => {
			const roleId = Number(role.id);
			const permissionNames = Number.isInteger(roleId)
				? permissionNamesByRoleId.get(roleId) ?? []
				: [];

			return {
				...role,
				permission_names: permissionNames,
			};
		});

		return NextResponse.json({ roles: normalizedRoles });
	} catch {
		return NextResponse.json(
			{ error: 'Unable to load roles.' },
			{ status: 500 },
		);
	}
}
