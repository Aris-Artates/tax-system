import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySession } from '@/lib/auth-guard';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('tax_session');

  const user = verifySession(sessionCookie?.value);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const roleId = Number(user.role_id);

    let permissionsMap: Record<string, any> = {};

    if (roleId === 1) {
      // Super admin bypass - we can return an empty map or a "super" flag
      // Frontend will check role_id === 1 anyway, but let's be consistent
    } else {
      const { data: rolePerms, error } = await supabaseAdmin
        .from('role_permissions')
        .select('can_view, can_edit, can_delete, permissions(name, access_module, tab)')
        .eq('role_id', roleId);

      if (!error && rolePerms) {
        rolePerms.forEach((rp: any) => {
          const permData = Array.isArray(rp.permissions)
            ? rp.permissions[0]
            : rp.permissions;
            
          if (permData) {
            const permKey = permData.access_module || permData.name;
            const tabKey = permData.tab;
            
            if (!permissionsMap[permKey]) {
                permissionsMap[permKey] = {
                    can_view: false,
                    can_edit: false,
                    can_delete: false,
                    tabs: {}
                };
            }

            if (tabKey) {
                // tabKey may be a comma-separated list (multi-tab permission)
                const tabSlugs = tabKey.split(',').map((t: string) => t.trim()).filter(Boolean);
                if (!permissionsMap[permKey].tabs) permissionsMap[permKey].tabs = {};
                tabSlugs.forEach((slug: string) => {
                    permissionsMap[permKey].tabs[slug] = {
                        can_view: rp.can_view,
                        can_edit: rp.can_edit,
                        can_delete: rp.can_delete,
                    };
                });
                // If a user has access to any tab, they need to see the module parent layout
                permissionsMap[permKey].can_view = permissionsMap[permKey].can_view || rp.can_view;
            } else {
                // Global module permission
                permissionsMap[permKey].can_view = permissionsMap[permKey].can_view || rp.can_view;
                permissionsMap[permKey].can_edit = permissionsMap[permKey].can_edit || rp.can_edit;
                permissionsMap[permKey].can_delete = permissionsMap[permKey].can_delete || rp.can_delete;
            }
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