import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authorize, getCurrentUser } from '@/lib/auth-guard';
import { logActivity } from '@/lib/activity-log';

type UpdateRolePayload = {
    id: number | string;
    name: string;
    icon?: string;
    permission_id?: number;
    permission_ids?: number[];
};

export async function POST(request: Request) {
    try {
        // 1. Authorize the user (Server-side)
        if (!(await authorize('user', 'can_edit'))) {
            return NextResponse.json({ error: 'Unauthorized: You do not have permission to edit roles.' }, { status: 403 });
        }

        const body = (await request.json()) as Partial<UpdateRolePayload>;
        
        const roleId = Number(body.id);
        const name = body.name?.trim() ?? '';
        
        // Handle both single permission_id and array of permission_ids from frontend
        const rawPermissionIds = Array.isArray(body.permission_ids)
            ? body.permission_ids
            : body.permission_id !== undefined
                ? [body.permission_id]
                : [];

        const permissionIds = [...new Set(rawPermissionIds.map((value) => Number(value)))].filter(
            (value) => Number.isInteger(value) && value > 0,
        );

        if (!Number.isInteger(roleId) || roleId <= 0) {
            return NextResponse.json({ error: 'Valid role ID is required.' }, { status: 400 });
        }

        if (!name) {
            return NextResponse.json({ error: 'name is required.' }, { status: 400 });
        }

        // 1. Check if the new name is already taken by a DIFFERENT role
        const { data: existingRole, error: existingRoleError } = await supabaseAdmin
            .from('roles')
            .select('id, name')
            .ilike('name', name)
            .neq('id', roleId) // Exclude the current role we are editing
            .limit(1)
            .maybeSingle();

        if (existingRoleError) {
            return NextResponse.json({ error: existingRoleError.message }, { status: 400 });
        }

        if (existingRole) {
            return NextResponse.json({ error: 'Another role with this name already exists.' }, { status: 409 });
        }

        // 2. Validate that the submitted permissions actually exist in the DB
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

        // 3. Update the Role Name
        const icon = body.icon ?? 'KeyRound';

        const { error: updateRoleError } = await supabaseAdmin
            .from('roles')
            .update({ name, icon })
            .eq('id', roleId);

        if (updateRoleError) {
            if (updateRoleError.code === '23505') {
                return NextResponse.json({ error: 'Role already exists.' }, { status: 409 });
            }
            return NextResponse.json({ error: updateRoleError.message }, { status: 400 });
        }

        // 4. Wipe the old permissions for this role
        const { error: deletePermsError } = await supabaseAdmin
            .from('role_permissions')
            .delete()
            .eq('role_id', roleId);

        if (deletePermsError) {
            return NextResponse.json({ error: 'Failed to clear old permissions: ' + deletePermsError.message }, { status: 400 });
        }

        // 5. Insert the newly selected permissions
        const rolePermissionRows = permissionIds.map((permissionId) => ({
            role_id: roleId,
            permission_id: permissionId,
        }));

        const { error: rolePermissionsError } = await supabaseAdmin
            .from('role_permissions')
            .insert(rolePermissionRows);

        if (rolePermissionsError) {
            return NextResponse.json(
                { error: 'Failed to assign new permissions: ' + rolePermissionsError.message },
                { status: 400 },
            );
        }

        const currentUser = await getCurrentUser();
        if (currentUser) {
            await logActivity(
                currentUser.id,
                'UPDATE',
                'Role Management',
                `Updated role: ${name}`
            );
        }

        return NextResponse.json({
            message: 'Role updated successfully.',
            role_id: roleId,
            permission_ids: permissionIds,
        });
    } catch (err: any) {
        const currentUser = await getCurrentUser();
        if (currentUser) {
            await logActivity(
                currentUser.id,
                'UPDATE',
                'Role Management',
                `Error updating role: ${err.message || 'Unknown error'}`,
                'Failed'
            );
        }
        return NextResponse.json(
            { error: 'Unable to process request.' },
            { status: 500 },
        );
    }
}