import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data: permissions, error: permissionsError } = await supabaseAdmin
      .from("permissions")
      .select("id, name, description, created_at")
      .order("name", { ascending: true });

    if (permissionsError) {
      return NextResponse.json(
        { error: permissionsError.message },
        { status: 400 },
      );
    }

    const permissionIds = (permissions ?? []).map((p) => p.id).filter(Boolean);

    if (permissionIds.length === 0) {
      return NextResponse.json({ permissions: [] });
    }

    const { data: rolePermissionRows, error: rolePermissionsError } =
      await supabaseAdmin
        .from("role_permissions")
        .select("permission_id, role_id, roles(id, name)")
        .in("permission_id", permissionIds);

    if (rolePermissionsError) {
      return NextResponse.json(
        { error: rolePermissionsError.message },
        { status: 400 },
      );
    }

    // Map roles to their respective permission ids
    const rolesByPermissionId = new Map<
      number,
      { id: number; name: string }[]
    >();

    for (const row of rolePermissionRows ?? []) {
      const permissionId = Number(row.permission_id);
      if (!Number.isInteger(permissionId)) continue;

      // Handle different Supabase relationship response formats
      const roleRecord = Array.isArray(row.roles) ? row.roles[0] : row.roles;
      if (!roleRecord) continue;

      const current = rolesByPermissionId.get(permissionId) ?? [];
      if (!current.find((r) => r.id === roleRecord.id)) {
        current.push({ id: roleRecord.id, name: roleRecord.name });
        rolesByPermissionId.set(permissionId, current);
      }
    }

    const normalizedPermissions = (permissions ?? []).map((p) => {
      const permissionId = Number(p.id);
      const roles = Number.isInteger(permissionId)
        ? (rolesByPermissionId.get(permissionId) ?? [])
        : [];

      return {
        ...p,
        roles: roles,
      };
    });

    const payloadString = JSON.stringify(normalizedPermissions);
    const obscuredPayload = Buffer.from(payloadString).toString("base64");

    return NextResponse.json({ _data: obscuredPayload });
  } catch {
    return NextResponse.json(
      { error: "Unable to load permissions." },
      { status: 500 },
    );
  }
}
