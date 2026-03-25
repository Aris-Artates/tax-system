"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import {
  Trash2,
  X,
  ShieldAlert,
  Settings2,
  Plus,
  Search,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  confirmDelete,
  showDeleteSuccess,
} from "@/components/DeleteUserAction";

interface Role {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
  description?: string;
  roles?: Role[];
}

interface PermissionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  permission: Permission;
}

export function PermissionSettingsModal({
  isOpen,
  onClose,
  onSuccess,
  permission,
}: PermissionSettingsModalProps) {
  const [name, setName] = useState(permission.name);
  const [description, setDescription] = useState(permission.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Roles assigned to this permission
  const [assignedRoles, setAssignedRoles] = useState<Role[]>(
    permission.roles || [],
  );

  // All roles for the picker
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [isAllRolesLoading, setIsAllRolesLoading] = useState(false);

  // Role picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(permission.name);
      setDescription(permission.description || "");
      setAssignedRoles(permission.roles || []);
      fetchAllRoles();
      setPickerOpen(false);
      setRoleSearch("");
    }
  }, [permission, isOpen]);

  // Outside click handler for role picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAllRoles = async () => {
    setIsAllRolesLoading(true);
    try {
      const response = await fetch("/api/roles/list");
      const data = await response.json();
      if (response.ok) {
        setAllRoles(data.roles || []);
      } else {
        toast.error("Failed to fetch available roles.");
      }
    } catch (error) {
      console.error("Failed to fetch all roles", error);
      toast.error("Connection error while fetching roles.");
    } finally {
      setIsAllRolesLoading(false);
    }
  };

  const handleScrubbedChange = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9 .\_\-']/g, "");
    setName(clean);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/permissions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: permission.id, name, description }),
      });

      if (response.ok) {
        toast.success("Permission updated successfully.");
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update permission.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the permission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignToRole = async (role: Role) => {
    try {
      const response = await fetch("/api/permissions/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: role.id, permissionId: permission.id }),
      });

      if (response.ok) {
        setAssignedRoles(
          [...assignedRoles, role].sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast.success(`Permission assigned to and added to ${role.name}.`);
        onSuccess();
        setPickerOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to assign role.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    }
  };

  const handleRemoveRole = async (roleId: number) => {
    try {
      const response = await fetch("/api/permissions/unassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId, permissionId: permission.id }),
      });

      if (response.ok) {
        setAssignedRoles(assignedRoles.filter((r) => r.id !== roleId));
        toast.success("Permission removed from role.");
        onSuccess();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to remove role.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmDelete(
      permission.name,
      "Permission",
      "#permission-settings-modal-content",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/permissions/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: permission.id }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        await showDeleteSuccess(
          permission.name,
          "#permission-settings-modal-content",
        );
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete permission.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter out roles already assigned
  const availableRoles = allRoles
    .filter((role) => !assignedRoles.some((ar) => ar.id === role.id))
    .filter((role) =>
      role.name.toLowerCase().includes(roleSearch.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        id="permission-settings-modal-content"
        className="sm:max-w-[500px] rounded-xl overflow-hidden border-none shadow-2xl p-0 transition-all duration-300 h-[80vh]"
      >
        <div className="bg-slate-50 border-b border-slate-100 p-6">
          <DialogHeader>
            <DialogTitle className="font-lexend text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-slate-400" />
              Permission Settings
            </DialogTitle>
            <DialogDescription className="font-inter text-slate-500">
              Manage system permissions and Role assignments for{" "}
              <span className="font-semibold text-slate-700">
                {permission.name}
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 pt-2 space-y-6.5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Change Name Section */}
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">
              General Configuration
            </h3>
            <ValidatedInput
              label="Permission Name"
              value={name}
              onChange={handleScrubbedChange}
              placeholder="e.g. system.manage"
              maxLength={50}
              required
              validator="permission-&-role-name"
              type="text"
            />
            <div className="mt-4">
              <label className="font-inter text-xs font-medium text-slate-600">
                Description
              </label>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this permission controls..."
                className="w-full min-h-[80px] rounded-xl border border-slate-200 bg-white p-3 text-xs font-inter focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
              />
            </div>
          </section>

          {/* Role Assignments Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Assigned to
              </h3>

              <div ref={pickerRef} className="relative">
                <Button
                  onClick={() => setPickerOpen(!pickerOpen)}
                  disabled={isAllRolesLoading}
                  className="h-7 px-3 text-[10px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-none rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Assign New Role
                  <ChevronsUpDown className="w-3 h-3 ml-1 opacity-50" />
                </Button>

                {pickerOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl z-60 overflow-hidden flex flex-col ring-4 ring-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 bg-slate-50 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={roleSearch}
                          onChange={(e) => setRoleSearch(e.target.value)}
                          placeholder="Search roles..."
                          className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs font-inter focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto py-1">
                      {availableRoles.length > 0 ? (
                        availableRoles.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => handleAssignToRole(role)}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <div className="w-5 h-5 bg-slate-100 rounded-md flex items-center justify-center text-[10px] text-slate-500">
                              {role.name.charAt(0)}
                            </div>
                            {role.name}
                          </button>
                        ))
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-[10px] text-slate-400 italic">
                            No roles available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {assignedRoles.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {assignedRoles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs ring-1 ring-blue-100">
                          {role.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-700 block">
                            {role.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Assigned Permission
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveRole(role.id)}
                        className="text-rose-500 transition-all p-2 rounded-lg bg-rose-50 group-hover:opacity-100 flex items-center justify-center cursor-pointer"
                        title="Remove permission from this role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center bg-slate-50/30">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldAlert className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-xs text-slate-400 italic font-medium">
                    No roles assigned to this permission.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Assign roles to grant dynamic access system-wide.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Danger Zone Section */}
          <section className="bg-rose-50/30 border border-rose-100/50 rounded-xl p-5 group hover:bg-rose-50/50 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-rose-100 p-2.5 rounded-xl shadow-sm ring-4 ring-rose-50">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-rose-900 tracking-tight">
                  Danger Zone
                </h4>
                <p className="text-xs text-rose-700/70 mt-1 leading-relaxed font-medium">
                  Deleting this permission will remove it from all roles and may
                  impact system functionality.
                </p>
                <Button
                  onClick={handleDelete}
                  variant="ghost"
                  disabled={isDeleting}
                  className="mt-4 h-9 px-4 text-xs font-bold text-rose-600 bg-white hover:bg-rose-600 hover:text-white transition-all border border-rose-200 shadow-sm rounded-lg cursor-pointer"
                >
                  {isDeleting
                    ? "Deleting System Resource..."
                    : "Delete Permission Permanently"}
                </Button>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="bg-slate-50 border-t border-slate-100 p-4 gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="font-bold text-slate-500 hover:bg-slate-200 px-6 h-10 text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !name ||
              (name === permission.name &&
                description === (permission.description || ""))
            }
            className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-8 h-10 text-xs shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] cursor-pointer"
          >
            {isSubmitting ? "Syncing..." : "Update Permission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
