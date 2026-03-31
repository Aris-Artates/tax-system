import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
	try {
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

		return NextResponse.json({ message: 'Permission removed from role successfully.' });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Unable to process request.' },
			{ status: 500 },
		);
	}
}
