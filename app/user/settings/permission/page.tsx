"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  KeyRound,
  Pencil,
  Plus,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PermissionDialog } from "@/components/PermissionDialog";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/table";

type Permission = {
  id: number;
  name: string;
  created_at?: string;
};

export default function PermissionSettingsPage() {
  const router = useRouter();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null,
  );
  const [deletingPermissionId, setDeletingPermissionId] = useState<
    number | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [permissionToDelete, setPermissionToDelete] =
    useState<Permission | null>(null);

  const fetchPermissions = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/permissions/list", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        setLoadError(data.error ?? "Failed to load permissions.");
        setPermissions([]);
        return;
      }
      setPermissions(data.permissions ?? []);
    } catch {
      setLoadError("Unable to connect to server.");
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleAddPermission = () => {
    setEditingPermission(null);
    setIsDialogOpen(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = useCallback(async () => {
    await fetchPermissions();
    toast.success(
      editingPermission ? "Permission Updated" : "Permission Added",
    );
    setIsDialogOpen(false);
    setEditingPermission(null);
  }, [editingPermission]);

  const handleConfirmDelete = async () => {
    if (!permissionToDelete) return;
    setDeletingPermissionId(permissionToDelete.id);

    try {
      const response = await fetch("/api/permissions/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: permissionToDelete.id }),
      });

      if (!response.ok) throw new Error();

      await fetchPermissions();
      toast.success("Permission Deleted");
    } catch {
      toast.error("Failed to delete permission.");
    } finally {
      setDeletingPermissionId(null);
      setShowDeleteConfirm(false);
      setPermissionToDelete(null);
    }
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
        header: "Permission",
        cell: ({ row }: any) => (
          <div className="inline-flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-slate-400" />
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }: any) => {
          const date = row.original.created_at;
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }: any) => {
          const p = row.original;
          const isDeleting = deletingPermissionId === p.id;
          return (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleEditPermission(p)}
                className="font-inter inline-flex items-center gap-2 rounded border border-gray-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-gray-50 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={() => {
                  setPermissionToDelete(p);
                  setShowDeleteConfirm(true);
                }}
                disabled={isDeleting}
                className="font-inter inline-flex items-center gap-2 rounded border border-gray-200 px-3 py-1.5 text-xs text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          );
        },
      },
    ],
    [deletingPermissionId],
  );

  const table = useReactTable({
    data: permissions,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div className="flex w-full overflow-x-hidden">
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <header className="mb-8">
          <button
            onClick={() => router.push("/user")}
            className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to User Management
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
                Permission Settings
              </h1>
              <p className="font-inter mt-1 text-xs text-slate-400">
                Configure feature-level access across system modules.
              </p>
            </div>
            <Button
              onClick={handleAddPermission}
              className="font-lexend h-10 rounded bg-[#0F172A] px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Permission
            </Button>
          </div>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <KeyRound className="h-5 w-5 text-[#00154A]" />
              </div>
              <h2 className="font-lexend text-sm font-semibold text-[#848794]">
                Role Permission Matrix
              </h2>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search permissions..."
                className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-slate-100 outline-none"
              />
            </div>
          </div>

          {loadError && (
            <div className="mb-4 rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {loadError}
            </div>
          )}

          <TableContainer>
            <Table className="min-w-full">
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-10 text-center text-slate-400"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50">
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
          </TableContainer>

          {!isLoading && permissions.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-slate-500">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="inline-flex h-8 items-center rounded border border-gray-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft className="mr-1 h-3 w-3" /> Previous
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="inline-flex h-8 items-center rounded border border-gray-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Next <ChevronRight className="ml-1 h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <PermissionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleDialogSuccess}
        permission={editingPermission}
      />

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permission?</DialogTitle>
            <DialogDescription>
              Confirm deletion of{" "}
              <span className="font-bold">{permissionToDelete?.name}</span>.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deletingPermissionId ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
