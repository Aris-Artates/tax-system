import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize, getCurrentUser } from '@/lib/auth-guard';
import { logActivity } from '@/lib/activity-log';

export async function POST(request: Request) {
	try {
		// 1. Authorize the user (Server-side)
		if (!(await authorize('user', 'can_delete'))) {
			return NextResponse.json({ error: 'Unauthorized: You do not have permission to delete roles.' }, { status: 403 });
		}

		const body = (await request.json()) as { name?: string };
		const name = typeof body.name === 'string' ? body.name.trim() : '';

		if (!name) {
			return NextResponse.json({ error: 'name is required.' }, { status: 400 });
		}

		const { data: role, error: roleError } = await supabaseAdmin
			.from('roles')
			.select('id, name')
			.eq('name', name)
			.maybeSingle();

		if (roleError) {
			return NextResponse.json({ error: roleError.message }, { status: 400 });
		}

		if (!role?.id) {
			return NextResponse.json({ error: 'Role not found.' }, { status: 404 });
		}

		const { count: assignedUsersCount, error: usersCountError } = await supabaseAdmin
			.from('users')
			.select('empID', { count: 'exact', head: true })
			.eq('role_id', role.id);

		if (usersCountError) {
			return NextResponse.json({ error: usersCountError.message }, { status: 400 });
		}

		if ((assignedUsersCount ?? 0) > 0) {
			return NextResponse.json(
				{
					error: `Cannot delete role. ${assignedUsersCount} user(s) are still assigned to this role. Reassign them first.`,
				},
				{ status: 409 },
			);
		}

		const { error: rolePermissionsError } = await supabaseAdmin
			.from('role_permissions')
			.delete()
			.eq('role_id', role.id);

		if (rolePermissionsError) {
			return NextResponse.json({ error: rolePermissionsError.message }, { status: 400 });
		}

		const { error: deleteRoleError } = await supabaseAdmin
			.from('roles')
			.delete()
			.eq('id', role.id);

		if (deleteRoleError) {
			if (deleteRoleError.code === '23503') {
				return NextResponse.json(
					{ error: 'Cannot delete role while users are assigned to it. Reassign users first.' },
					{ status: 409 },
				);
			}

			return NextResponse.json({ error: deleteRoleError.message }, { status: 400 });
		}

		const currentUser = await getCurrentUser();
		if (currentUser) {
			await logActivity(
				currentUser.id,
				'DELETE',
				'Role Management',
				`Deleted role: ${name}`
			);
		}

		return NextResponse.json({ message: 'Role deleted successfully.' });
	} catch (err: any) {
		const currentUser = await getCurrentUser();
		if (currentUser) {
			await logActivity(
				currentUser.id,
				'DELETE',
				'Role Management',
				`Error deleting role: ${err.message || 'Unknown error'}`,
				'Failed'
			);
		}
		return NextResponse.json({ error: 'Unable to process request.' }, { status: 500 });
	}
}
