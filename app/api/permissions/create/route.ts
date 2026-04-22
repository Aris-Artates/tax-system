import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize, getCurrentUser } from '@/lib/auth-guard';
import { logActivity } from '@/lib/activity-log';

type CreatePermissionPayload = {
	name: string;
	description?: string;
	access_module?: string;
	tab?: string;
	can_view?: boolean;
	can_edit?: boolean;
	can_delete?: boolean;
};

export async function POST(request: Request) {
	try {
		// 1. Authorize the user (Server-side)
		if (!(await authorize('user', 'can_edit'))) {
			return NextResponse.json({ error: 'Unauthorized: You do not have permission to modify system settings.' }, { status: 403 });
		}
		
		const body = (await request.json()) as Partial<CreatePermissionPayload>;
		const name = body.name?.trim() ?? '';
		const description = body.description?.trim() ?? '';
		const access_module = body.access_module?.trim() ?? '';
		const tab = body.tab?.trim() ?? '';
		const can_view = Boolean(body.can_view);
		const can_edit = Boolean(body.can_edit);
		const can_delete = Boolean(body.can_delete);

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
			.insert({ 
				name, 
				description,
				access_module,
				tab,
				can_view,
				can_edit,
				can_delete
			})
			.select('id, name, description, created_at')
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const currentUser = await getCurrentUser();
		if (currentUser) {
			await logActivity(
				currentUser.id,
				'CREATE',
				'Permission Management',
				`Added new permission: ${name}`
			);
		}

		return NextResponse.json({ message: 'Permission added successfully.', permission: data });
	} catch (err: any) {
		const currentUser = await getCurrentUser();
		if (currentUser) {
			await logActivity(
				currentUser.id,
				'CREATE',
				'Permission Management',
				`Failed to add permission: ${err.message || 'Unknown error'}`,
				'Failed'
			);
		}
		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 },
		);
	}
}
