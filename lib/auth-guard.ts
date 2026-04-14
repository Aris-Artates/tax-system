import { cookies } from 'next/headers';
import { supabaseAdmin } from './supabaseAdmin';
import { createHmac } from 'crypto';

const SESSION_SECRET = process.env.SUPABASE_SECRET_KEY || 'tax-system-fallback-secret';

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

    const sessionUser = verifySession(sessionCookie?.value);

    if (!sessionUser) {
      console.warn(`[Auth Guard] Unauthorized access attempt: Invalid or missing session.`);
      return false;
    }

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
      .select('can_view, can_edit, can_delete, permissions(name, access_module)')
      .eq('role_id', dbUser.role_id);

    if (permsError || !rolePerms) {
      console.warn(`[Auth Guard] Unauthorized: Failed to fetch permissions for role ${dbUser.role_id}.`);
      return false;
    }

    // Find the relevant permission module
    const modulePermission = rolePerms.find((rp: any) => {
      const permData = Array.isArray(rp.permissions) 
        ? rp.permissions[0] 
        : rp.permissions;
        
      if (!permData) return false;
      const permKey = permData.access_module || permData.name;
      return permKey === moduleName;
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

/**
 * Signs session data using a HMAC signature.
 */
export function signSession(data: any): string {
  const serialized = JSON.stringify(data);
  const signature = createHmac('sha256', SESSION_SECRET).update(serialized).digest('hex');
  return `${serialized}.${signature}`;
}

/**
 * Verifies and parses a signed session string.
 */
export function verifySession(signedValue?: string): any {
  if (!signedValue) return null;

  const [serialized, signature] = signedValue.split('.');
  if (!serialized || !signature) return null;

  const expectedSignature = createHmac('sha256', SESSION_SECRET).update(serialized).digest('hex');

  // Basic signature check
  if (signature !== expectedSignature) {
    console.error('[Auth Guard] Session signature mismatch!');
    return null;
  }

  try {
    return JSON.parse(serialized);
  } catch {
    return null;
  }
}
