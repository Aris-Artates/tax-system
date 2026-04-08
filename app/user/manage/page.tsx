"use client";

import { useCallback } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Undo2,
  ShieldCheck,
  KeyRound,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Users,
  Shield,
  Key,
  Lock,
  Unlock,
  Briefcase,
  GraduationCap,
  Gavel,
  BadgeCheck,
  Database,
  Eye,
  Globe,
  Building,
  CreditCard,
  FileText,
  LayoutDashboard,
  PiggyBank,
  UserRound,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/table";

import { RoleMasterModal } from "@/components/RoleMasterModal";
import { AddRoleModal } from "@/components/AddRoleModal";

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
  icon?: string;
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
  icon: string;
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

const RoleIcon = ({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) => {
  const icons: Record<string, any> = {
    KeyRound,
    ShieldCheck,
    Users,
    Shield,
    Key,
    Settings2,
    Lock,
    Unlock,
    UserRound,
    Briefcase,
    GraduationCap,
    Gavel,
    BadgeCheck,
    Database,
    Eye,
    Globe,
    Building,
    CreditCard,
    FileText,
    LayoutDashboard,
    PiggyBank,
  };
  const IconComp = icons[name || "KeyRound"] || KeyRound;
  return <IconComp className={className} />;
};

export default function ManageRolePage() {
  const router = useRouter();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roles, setRoles] = useState<ListedRole[]>([]);
  const [permissions, setPermissions] = useState<ApiPermission[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ListedRole | null>(null);

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
      icon: role.icon || "KeyRound",
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

  const fetchUsers = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const openMasterModal = useCallback((editRole: ListedRole) => {
    setSelectedRole(editRole);
    setIsMasterModalOpen(true);
  }, []);

  const handleMasterModalClose = useCallback(() => {
    setIsMasterModalOpen(false);
    setSelectedRole(null);
  }, []);

  const openAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleAddModalClose = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleMasterModalSuccess = async () => {
    await fetchRoles();
    await fetchUsers();
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: any) => ` #${row.original.id}`,
      },
      {
        accessorKey: "name",
        header: "Role",
        cell: ({ row }: any) => (
          <div className="inline-flex min-w-max items-center gap-2 whitespace-nowrap font-medium text-slate-700">
            <RoleIcon
              name={row.original.icon}
              className="h-4 w-4 shrink-0 text-slate-400"
            />
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "permissionNames",
        header: "Permissions",
        cell: ({ row }: any) => {
          const permissions = row.original.permissionNames || [];
          if (permissions.length === 0)
            return (
              <span className="text-slate-400 text-xs italic">Unassigned</span>
            );

          const displayPermissions = permissions.slice(0, 2);
          const hasMore = permissions.length > 2;

          return (
            <div className="flex items-center gap-1.5">
              {displayPermissions.map((name: string, index: number) => (
                <span
                  key={`${row.original.key}-${name}-${index}`}
                  className="whitespace-nowrap inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                >
                  {name}
                </span>
              ))}

              {hasMore && (
                <TooltipProvider>
                  <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                      <div className="whitespace-nowrap shrink-0 inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-300 transition-all cursor-default">
                        +{permissions.length - 2} more
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="bg-white border border-slate-200 shadow-xl p-3 rounded-lg max-w-[250px]"
                    >
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold text-slate-900 border-b border-slate-100 pb-1.5">
                          Additional Permissions
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {permissions
                            .slice(2)
                            .map((name: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[10px] font-medium border border-slate-100 shadow-sm"
                              >
                                {name}
                              </span>
                            ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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

          if (roleUsers.length === 0)
            return (
              <span className="text-slate-400 text-[10px] italic">
                No users
              </span>
            );

          return (
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-100 cursor-default hover:bg-white hover:shadow-sm transition-all select-none">
                    <UserRound className="h-3 w-3 text-blue-500" />
                    {roleUsers.length} Users
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-white border border-slate-200 shadow-xl p-3 rounded-lg max-w-[280px]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                      <p className="text-[11px] font-bold text-slate-900">
                        Assigned Users
                      </p>
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-black">
                        {roleUsers.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.25">
                      {roleUsers.map((name, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 text-[10px] font-medium border border-slate-200"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }: any) => (
          <span className="text-slate-500 font-inter">
            {row.original.createdAt}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }: any) => {
          const role = row.original;
          return (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => openMasterModal(role)}
                className="font-inter inline-flex min-w-max items-center gap-2 whitespace-nowrap rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 cursor-pointer active:scale-95"
              >
                <Settings2 className="h-3.5 w-3.5 shrink-0 text-slate-500" />{" "}
                Configure
              </button>
            </div>
          );
        },
      },
    ],
    [usersByRole, openMasterModal],
  );

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
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { globalFilter, sorting },

    initialState: {
      pagination: { pageSize: 5 },
    },
  });

  return (
    <div className="flex w-full overflow-x-hidden">
      <main className="flex-1 w-full max-w-7xl mx-auto h-auto">
        <header className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
              Manage Roles
            </h1>
            <p className="font-inter mt-1 text-xs text-slate-400">
              Create roles, assign permissions, and manage access levels
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleBack}
              className="h-9 rounded-md border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-white hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <Undo2 className="h-4 w-4" />
              Back to User Management
            </Button>
            <Button
              onClick={openAddModal}
              className="h-9 rounded-md bg-[#0F172A] px-5 text-xs font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Role
            </Button>
          </div>
        </header>

        <div className="mb-3 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <ShieldCheck className="h-4 w-4 text-[#00154A]" />
              </div>
              <h2 className="font-lexend text-sm font-semibold text-[#848794]">
                Role Directory
              </h2>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search roles or permissions..."
                className="font-inter w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-slate-100 outline-none"
              />
            </div>
          </div>
        </div>

        <TableContainer>
          <Table zebra>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-gray-50/50">
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoadingRoles ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-slate-400"
                  >
                    Loading roles...
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!isLoadingRoles && roles.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 bg-gray-50/30 font-inter">
              <p className="text-[11px] text-slate-400">
                Showing{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
                -
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length,
                )}{" "}
                of {table.getFilteredRowModel().rows.length} roles
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-2 text-xs text-slate-500 whitespace-nowrap">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount() || 1}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </TableContainer>

        <RoleMasterModal
          isOpen={isMasterModalOpen}
          onClose={handleMasterModalClose}
          onSuccess={handleMasterModalSuccess}
          role={selectedRole}
          allPermissions={permissions}
          allUsers={users}
          allRoles={roles}
        />

        <AddRoleModal
          isOpen={isAddModalOpen}
          onClose={handleAddModalClose}
          onSuccess={handleMasterModalSuccess}
          allPermissions={permissions}
        />
      </main>
    </div>
  );
}
