import { cookies } from 'next/headers';
import { supabaseAdmin } from './supabaseAdmin';

export type PermissionAction = 'can_view' | 'can_edit' | 'can_delete';

/**
 * validates if the current session user is authorized to perform an action on a module.
 * @param moduleName The name of the module (e.g., 'User & Role Management')
 * @param action The required permission level
 * @returns boolean indicating if the user is authorized.
 */
export async function authorize(moduleName: string, action: PermissionAction): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('tax_session');

    if (!sessionCookie?.value) {
      console.warn(`[Auth Guard] Unauthorized access attempt: No session cookie found.`);
      return false;
    }

    const sessionUser = JSON.parse(sessionCookie.value);
    const roleId = Number(sessionUser.role_id);
    const empID = sessionUser.empID;

    if (!roleId || !empID) return false;

    // 1. Super Admin (Role ID 1) Always Authorized
    if (roleId === 1) return true;

    // 2. Verify User Status & Permissions in DB
    // We check if the user is still active and what their permissions are for the module
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('status, role_id')
      .eq('empID', empID)
      .single();

    if (userError || !dbUser || !dbUser.status) {
      console.warn(`[Auth Guard] Unauthorized: User ${empID} is inactive or does not exist.`);
      return false;
    }

    // 3. Check for specific module permission
    const { data: rolePerms, error: permsError } = await supabaseAdmin
      .from('role_permissions')
      .select('can_view, can_edit, can_delete, permissions(name)')
      .eq('role_id', dbUser.role_id);

    if (permsError || !rolePerms) {
      console.warn(`[Auth Guard] Unauthorized: Failed to fetch permissions for role ${dbUser.role_id}.`);
      return false;
    }

    // Find the relevant permission module
    const modulePermission = rolePerms.find((rp: any) => {
      const permName = Array.isArray(rp.permissions) 
        ? rp.permissions[0]?.name 
        : rp.permissions?.name;
      return permName === moduleName;
    });

    if (!modulePermission) {
      console.warn(`[Auth Guard] Unauthorized: Role ${dbUser.role_id} has no entry for module ${moduleName}.`);
      return false;
    }

    const isAuthorized = !!modulePermission[action];
    
    if (!isAuthorized) {
      console.warn(`[Auth Guard] Unauthorized: Role ${dbUser.role_id} lacks '${action}' on '${moduleName}'.`);
    }

    return isAuthorized;
  } catch (err) {
    console.error(`[Auth Guard] Error during authorization check:`, err);
    return false;
  }
}
