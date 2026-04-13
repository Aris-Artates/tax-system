import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize } from '@/lib/auth-guard';

type DeletePermissionPayload = {
	id: number;
};

export async function POST(request: Request) {
	try {
		// 1. Authorize the user (Server-side)
		if (!(await authorize('user', 'can_delete'))) {
			return NextResponse.json({ error: 'Unauthorized: You do not have permission to delete system settings.' }, { status: 403 });
		}

		const body = (await request.json()) as Partial<DeletePermissionPayload>;
		const id = Number(body.id);

		if (!Number.isInteger(id) || id <= 0) {
			return NextResponse.json({ error: 'id is required.' }, { status: 400 });
		}

		const { data: permission, error: permissionError } = await supabaseAdmin
			.from('permissions')
			.select('id, name')
			.eq('id', id)
			.maybeSingle();

		if (permissionError) {
			return NextResponse.json({ error: permissionError.message }, { status: 400 });
		}

		if (!permission?.id) {
			return NextResponse.json({ error: 'Permission not found.' }, { status: 404 });
		}

		const { count: mappedRolesCount, error: mappedRolesError } = await supabaseAdmin
			.from('role_permissions')
			.select('role_id', { count: 'exact', head: true })
			.eq('permission_id', id);

		if (mappedRolesError) {
			return NextResponse.json({ error: mappedRolesError.message }, { status: 400 });
		}

		if ((mappedRolesCount ?? 0) > 0) {
			return NextResponse.json(
				{ error: `Cannot delete permission. It is assigned to ${mappedRolesCount} role(s). Remove it from roles first.` },
				{ status: 409 },
			);
		}

		const { error: deletePermissionError } = await supabaseAdmin
			.from('permissions')
			.delete()
			.eq('id', id);

		if (deletePermissionError) {
			if (deletePermissionError.code === '23503') {
				return NextResponse.json(
					{ error: 'Cannot delete permission while roles are still assigned to it.' },
					{ status: 409 },
				);
			}

			return NextResponse.json({ error: deletePermissionError.message }, { status: 400 });
		}

		return NextResponse.json({ message: 'Permission deleted successfully.' });
	} catch {
		return NextResponse.json({ error: 'Unable to process request.' }, { status: 500 });
	}
}
