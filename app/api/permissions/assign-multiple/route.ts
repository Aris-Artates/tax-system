import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize } from '@/lib/auth-guard';

export async function POST(request: Request) {
	try {
		if (!(await authorize('user', 'can_edit'))) {
			return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
		}
		const { roleId, permissionIds } = await request.json();

		if (!roleId || !Array.isArray(permissionIds) || permissionIds.length === 0) {
			return NextResponse.json({ error: 'roleId and an array of permissionIds are required.' }, { status: 400 });
		}

		// Find existing ones
		const { data: existing } = await supabaseAdmin
			.from('role_permissions')
			.select('permission_id')
			.eq('role_id', roleId)
			.in('permission_id', permissionIds);

		const existingSet = new Set(existing?.map(row => row.permission_id) || []);
		
		const toInsert = permissionIds
			.filter(id => !existingSet.has(id))
			.map(id => ({
				role_id: roleId,
				permission_id: id
			}));

		if (toInsert.length > 0) {
			const { error } = await supabaseAdmin
				.from('role_permissions')
				.insert(toInsert);

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		}

		return NextResponse.json({ message: 'Permissions assigned successfully.' });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 },
		);
	}
}
