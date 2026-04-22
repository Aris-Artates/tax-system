import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize, getCurrentUser } from '@/lib/auth-guard';
import { logActivity } from '@/lib/activity-log';

export async function POST(request: Request) {
	try {
		if (!(await authorize('user', 'can_edit'))) {
			return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
		}
		const { roleId, permissionId } = await request.json();

		if (!roleId || !permissionId) {
			return NextResponse.json({ error: 'roleId and permissionId are required.' }, { status: 400 });
		}

		const { error } = await supabaseAdmin
			.from('role_permissions')
			.delete()
			.eq('role_id', roleId)
			.eq('permission_id', permissionId);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const currentUser = await getCurrentUser();
		if (currentUser) {
			await logActivity(
				currentUser.id,
				'DELETE',
				'Permission Management',
				`Removed permission (ID: ${permissionId}) from role (ID: ${roleId})`
			);
		}

		return NextResponse.json({ message: 'Permission removed from role successfully.' });
	} catch (error: any) {
		const currentUser = await getCurrentUser();
		if (currentUser) {
			await logActivity(
				currentUser.id,
				'DELETE',
				'Permission Management',
				`Error removing permission: ${error.message || 'Unknown error'}`,
				'Failed'
			);
		}
		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 },
		);
	}
}
