import { useAuth } from "@/context/AuthContext";

export function usePermission(module: string) {
  const { user, permissions, isLoading } = useAuth();
  
  // Super Admin (Role ID 1) always has full access
  const isSuperAdmin = Number(user?.role_id) === 1;

  if (isLoading) {
    return { canView: false, canEdit: false, canDelete: false, isSuperAdmin: false };
  }

  if (isSuperAdmin) {
    return { canView: true, canEdit: true, canDelete: true, isSuperAdmin: true };
  }

  const pm = permissions[module];
  
  return {
    canView: !!pm?.can_view,
    canEdit: !!pm?.can_edit,
    canDelete: !!pm?.can_delete,
    isSuperAdmin: false
  };
}
