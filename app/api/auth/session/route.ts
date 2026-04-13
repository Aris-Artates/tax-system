import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('tax_session');

  if (!sessionCookie?.value) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const user = JSON.parse(sessionCookie.value);
    const roleId = Number(user.role_id);

    let permissionsMap: Record<string, any> = {};

    if (roleId === 1) {
      // Super admin bypass - we can return an empty map or a "super" flag
      // Frontend will check role_id === 1 anyway, but let's be consistent
    } else {
      const { data: rolePerms, error } = await supabaseAdmin
        .from('role_permissions')
        .select('can_view, can_edit, can_delete, permissions(name, access_module)')
        .eq('role_id', roleId);

      if (!error && rolePerms) {
        rolePerms.forEach((rp: any) => {
          const permData = Array.isArray(rp.permissions)
            ? rp.permissions[0]
            : rp.permissions;
            
          if (permData) {
            // We map the key by either access_module (if present) or name
            const permKey = permData.access_module || permData.name;
            
            // In case there are multiple permissions mapping to the same module, 
            // we should technically merge their capabilities. 
            // For now, we take an optimistic true assignment.
            permissionsMap[permKey] = {
              can_view: permissionsMap[permKey]?.can_view || rp.can_view,
              can_edit: permissionsMap[permKey]?.can_edit || rp.can_edit,
              can_delete: permissionsMap[permKey]?.can_delete || rp.can_delete,
            };
          }
        });
      }
    }

    return NextResponse.json({ user, permissions: permissionsMap }, { status: 200 });
  } catch {
    cookieStore.delete('tax_session');
    return NextResponse.json({ user: null }, { status: 200 });
  }
}