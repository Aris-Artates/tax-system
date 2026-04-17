import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

import { authorize } from '@/lib/auth-guard';

export async function POST(request: Request) {
	try {
		if (!(await authorize('user', 'can_edit'))) {
			return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
		}
		const { roleId, permissionId } = await request.json();

		if (!roleId || !permissionId) {
			return NextResponse.json({ error: 'roleId and permissionId are required.' }, { status: 400 });
		}

		// Check if already assigned
		const { data: existing } = await supabaseAdmin
			.from('role_permissions')
			.select('id')
			.eq('role_id', roleId)
			.eq('permission_id', permissionId)
			.maybeSingle();

		if (existing) {
			return NextResponse.json({ message: 'Role already has this permission.' });
		}

		const { error } = await supabaseAdmin
			.from('role_permissions')
			.insert({ role_id: roleId, permission_id: permissionId });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ message: 'Permission assigned to role successfully.' });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 },
		);
	}
}
