"use client";

import { useCallback } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShieldCheck,
  UsersRound,
  KeyRound,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/table";

import { AddRoleDialog } from "@/components/AddRoleDialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

type ApiUser = {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  suffix?: string;
  role?: string;
  roles?: {
    name?: string;
  } | null;
};

type ApiPermission = {
  id: number;
  name: string;
  created_at?: string;
};

type ApiRole = {
  id?: string | number;
  name?: string;
  permission_id?: number;
  created_at?: string;
  permission_names?: string[];
  role_permissions?: Array<{
    permission_id?: number;
    permissions?: {
      id?: number;
      name?: string;
      created_at?: string;
    } | null;
  }>;
  permissions?:
    | { id?: number; name?: string; created_at?: string }
    | Array<{ id?: number; name?: string; created_at?: string }>
    | null;
};

type ListedRole = {
  key: string;
  id: string | number;
  name: string;
  permissionNames: string[];
  permissionIds: string[];
  createdAt: string;
};

// Fix 1: Cleaned up the nested normalizeRole declaration
const normalizeRole = (role?: string) => {
  const value = (role ?? "").trim().toLowerCase();

  if (value === "admin" || value === "administrator") return "administrator";
  if (value === "treasurer") return "treasurer";
  if (value === "assessor") return "assessor";
  if (value === "encoder") return "encoder";

  return value;
};

export default function ManageRolePage() {
  const router = useRouter();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roles, setRoles] = useState<ListedRole[]>([]);
  const [permissions, setPermissions] = useState<ApiPermission[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");

  // Clean dialog states
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<ListedRole | null>(null);

  const [isDeletingRole, setIsDeletingRole] = useState(false);
  const [selectedRoleUsers, setSelectedRoleUsers] = useState<{
    roleName: string;
    names: string[];
  } | null>(null);
  const [rolePendingDelete, setRolePendingDelete] = useState<string | null>(null);

  const mapRole = (role: ApiRole, index: number): ListedRole => {
    const rawName = role.name ?? "";
    const name =
      typeof rawName === "string" && rawName.trim().length > 0
        ? rawName.trim()
        : `Role ${index + 1}`;

    let extractedNames: string[] = [];
    let extractedIds: string[] = [];

    if (Array.isArray(role.permission_names)) {
      extractedNames.push(...role.permission_names);
    }

    if (Array.isArray(role.role_permissions)) {
      role.role_permissions.forEach((mapping) => {
        if (mapping.permission_id)
          extractedIds.push(String(mapping.permission_id));
        if (mapping.permissions?.id)
          extractedIds.push(String(mapping.permissions.id));
        if (mapping.permissions?.name)
          extractedNames.push(mapping.permissions.name);
      });
    }

    if (Array.isArray(role.permissions)) {
      role.permissions.forEach((p) => {
        if (p.id) extractedIds.push(String(p.id));
        if (p.name) extractedNames.push(p.name);
      });
    } else if (role.permissions && typeof role.permissions === "object") {
      if (role.permissions.id) extractedIds.push(String(role.permissions.id));
      if (role.permissions.name) extractedNames.push(role.permissions.name);
    }

    if (role.permission_id) {
      extractedIds.push(String(role.permission_id));
    }

    const permissionNames = [
      ...new Set(extractedNames.map((n) => n.trim()).filter(Boolean)),
    ];
    const permissionIds = [
      ...new Set(
        extractedIds.filter((id) => id && id !== "undefined" && id !== "null"),
      ),
    ];

    const createdAt = role.created_at
      ? new Date(role.created_at).toLocaleDateString()
      : "-";
    const roleIdentifier = role.id ?? name;

    return {
      key: String(roleIdentifier),
      id: roleIdentifier,
      name,
      permissionNames,
      permissionIds,
      createdAt,
    };
  };

  const fetchRoles = async () => {
    setIsLoadingRoles(true);

    try {
      const response = await fetch("/api/roles/list", { cache: "no-store" });
      const data = (await response.json()) as {
        error?: string;
        roles?: ApiRole[];
      };

      if (!response.ok) {
        setRoles([]);
        return;
      }

      const mapped = (data.roles ?? []).map((role, index) =>
        mapRole(role, index),
      );
      setRoles(mapped);
    } catch {
      setRoles([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/permissions/list", {
        cache: "no-store",
      });
      const data = (await response.json()) as { permissions?: ApiPermission[] };

      if (!response.ok) {
        setPermissions([]);
        return;
      }

      setPermissions(data.permissions ?? []);
    } catch {
      setPermissions([]);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);

      try {
        const response = await fetch("/api/user/list", { cache: "no-store" });
        const data = (await response.json()) as {
          error?: string;
          users?: ApiUser[];
        };

        if (!response.ok) {
          setUsers([]);
          return;
        }

        setUsers(data.users ?? []);
      } catch {
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const usersByRole = useMemo(() => {
    const grouped = new Map<string, string[]>();

    for (const user of users) {
      const roleKey = normalizeRole(user.roles?.name ?? user.role ?? "");
      if (!roleKey) continue;

      const fullname = [
        user.firstname?.trim() ?? "",
        user.middlename?.trim() ?? "",
        user.lastname?.trim() ?? "",
        user.suffix?.trim() ?? "",
      ]
        .filter(Boolean)
        .join(" ");

      const names = grouped.get(roleKey) ?? [];
      names.push(fullname || "Unnamed User");
      grouped.set(roleKey, names);
    }

    return grouped;
  }, [users]);

  const handleBack = () => router.push("/user");

  const openRoleDialog = useCallback((editRole: ListedRole | null = null) => {
    setSelectedRoleForEdit(editRole);
    setIsAddRoleDialogOpen(true);
  }, []);

  // Fix 3: Updated handleDialogClose to actually close the dialog modal correctly
  const handleDialogClose = useCallback(() => {
    setIsAddRoleDialogOpen(false);
    setSelectedRoleForEdit(null);
  }, []);

  const handleDialogSuccess = async () => {
    await fetchRoles();
    toast.success("Role saved successfully");
    handleDialogClose();
  };

  const handleViewRoleUsers = (roleName: string) => {
    const roleKey = normalizeRole(roleName);
    const names = usersByRole.get(roleKey) ?? [];

    setSelectedRoleUsers({ roleName, names });
  };

  const handleDeleteRole = (roleName: string) => {
    setRolePendingDelete(roleName);
  };

  const confirmDeleteRole = async () => {
    if (!rolePendingDelete) return;

    setIsDeletingRole(true);

    try {
      const response = await fetch("/api/roles/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: rolePendingDelete }),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };
      
      if (!response.ok) {
        toast.error(data.error ?? "Failed to delete role.");
        return;
      }

      setRolePendingDelete(null);
      await fetchRoles();
      toast.success("Role deleted successfully");
    } catch {
      toast.error("Unable to connect to server.");
    } finally {
      setIsDeletingRole(false);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Role",
      cell: ({ row }: any) => (
        <div className="inline-flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-slate-400" />
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "permissionNames",
      header: "Permissions",
      cell: ({ row }: any) => {
        const role = row.original;
        return (
          <div className="flex flex-wrap gap-2">
            {role.permissionNames.length === 0 ? (
              <span className="rounded bg-slate-50 px-2 py-1 text-xs text-slate-400">
                Unassigned
              </span>
            ) : (
              // Fix 2: Added index parameter to the map function
              role.permissionNames.map((permissionName: string, index: number) => (
                <span
                  key={`${role.key}-${permissionName}-${index}`}
                  className="rounded bg-slate-50 px-2 py-1 text-xs text-slate-600 border border-gray-200"
                >
                  {permissionName}
                </span>
              ))
            )}
          </div>
        );
      },
    },
    {
      id: "users",
      header: "Users",
      cell: ({ row }: any) => {
        const role = row.original;
        const roleKey = normalizeRole(role.name);
        const roleUsers = usersByRole.get(roleKey) ?? [];
        const roleUsersCount = roleUsers.length;

        return (
          <button
            type="button"
            onClick={() => handleViewRoleUsers(role.name)}
            className="inline-flex items-center gap-2 rounded border border-gray-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-gray-50 cursor-pointer"
            title="View users with this role"
            disabled={isLoadingUsers}
          >
            <UsersRound className="h-3.5 w-3.5" />
            {isLoadingUsers ? "..." : roleUsersCount}
          </button>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }: any) => (
        <span className="text-xs text-slate-600">
          {row.original.createdAt}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: any) => {
        const role = row.original;
        return (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => openRoleDialog(row.original)}
              className="font-inter inline-flex items-center gap-2 rounded border border-gray-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-gray-50 cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>

            <button
              type="button"
              onClick={() => handleDeleteRole(role.name)}
              className="font-inter inline-flex items-center gap-2 rounded border border-gray-200 px-3 py-1.5 text-xs text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        );
      },
    },
  ], [usersByRole, isLoadingUsers, openRoleDialog]);

  const table = useReactTable({
    data: roles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    globalFilterFn: (row, _, filterValue) => {
      const search = String(filterValue).toLowerCase();
      const roleName = row.original.name.toLowerCase();
      const permissions = row.original.permissionNames.join(" ").toLowerCase();
      return roleName.includes(search) || permissions.includes(search);
    },

    onGlobalFilterChange: setGlobalFilter,
    state: { globalFilter },

    initialState: {
      pagination: { pageSize: 5 },
    },
  });

  return (
    <div className="flex w-full overflow-x-hidden">
      <main className="flex-1 w-full">
        <header className="mb-8">
          <button
            type="button"
            onClick={handleBack}
            className={`font-lexend mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700 cursor-pointer`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to User Management
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className={`font-lexend text-2xl font-bold text-[#595a5d]`}>
                Manage Roles
              </h1>
              <p className={`font-inter mt-1 text-xs text-slate-400`}>
                Create roles, assign permissions, and manage access levels
              </p>
            </div>

            <button
              type="button"
              onClick={() => openRoleDialog()}
              className={`font-lexend h-10 rounded bg-[#0F172A] px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800 cursor-pointer`}
            >
              Add New Role
            </button>
          </div>
        </header>

        <section className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <ShieldCheck className="h-5 w-5 text-[#00154A]" />
              </div>
              <h2 className={`font-lexend text-sm font-semibold text-[#848794]`}>
                Role Directory
              </h2>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search roles or permissions..."
                className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-sm font-inter outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          <TableContainer>
            <Table zebra className="min-w-155">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {isLoadingRoles && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-slate-400"
                    >
                      Loading roles...
                    </TableCell>
                  </TableRow>
                )}

                {!isLoadingRoles && roles.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-slate-400"
                    >
                      No roles found.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoadingRoles && table.getRowModel().rows.length === 0 && roles.length > 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-slate-400">
                            No roles match your search.
                        </TableCell>
                    </TableRow>
                )}

                {!isLoadingRoles &&
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="text-slate-700"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {!isLoadingRoles && roles.length > 0 && (
              <div className="flex items-center justify-between px-2 mt-4">
                  <div className="font-inter text-xs text-slate-500">
                      Page <span className="font-medium text-slate-900">{table.getPageCount() === 0 ? 0 : table.getState().pagination.pageIndex + 1}</span> of{" "}
                      <span className="font-medium text-slate-900">{table.getPageCount()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                      <button
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className="inline-flex h-8 items-center rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      >
                          <ChevronLeft className="mr-1 h-3 w-3" />
                          Previous
                      </button>
                      <button
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          className="inline-flex h-8 items-center rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      >
                          Next
                          <ChevronRight className="ml-1 h-3 w-3" />
                      </button>
                  </div>
              </div>
          )}
        </section>

        {/* View Role Users Modal */}
        {selectedRoleUsers && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setSelectedRoleUsers(null)}
          >
            <div
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-lexend mb-1 text-lg font-semibold text-[#0F172A]">
                {selectedRoleUsers.roleName} Users
              </h2>
              <p className="font-inter mb-3 text-xs text-slate-500">
                Total assigned users: <span className="font-semibold text-[#0F172A]">
                  {selectedRoleUsers.names.length}
                </span>
              </p>

              {selectedRoleUsers.names.length === 0 ? (
                <p className="font-inter text-sm text-slate-500">
                  No users assigned to this role.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto rounded-md border border-gray-100">
                  <ul className="divide-y divide-gray-100">
                    {selectedRoleUsers.names.map((name, index) => (
                      <li
                        key={index}
                        className="px-3 py-2 font-inter text-sm text-slate-700"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedRoleUsers(null)}
                  className="bg-[#0F172A] text-white text-xs font-inter px-4 py-2 rounded-md hover:bg-slate-800 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmationDialog
          isOpen={!!rolePendingDelete}
          onClose={() => setRolePendingDelete(null)}
          onConfirm={confirmDeleteRole}
          title="Delete Role"
          description="Are you sure you want to remove this role? This will affect users currently assigned to it."
          entityName={rolePendingDelete || ""}
          confirmText={isDeletingRole ? "Deleting..." : "Delete Role"}
        />
        <AddRoleDialog 
          isOpen={isAddRoleDialogOpen}
          onClose={handleDialogClose}
          onSuccess={handleDialogSuccess}
          role={selectedRoleForEdit || undefined}
          permissions={permissions}
        />
      </main>
    </div>
  );
}