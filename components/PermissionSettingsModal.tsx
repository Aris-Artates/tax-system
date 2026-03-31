"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import {
  KeyRound,
  Trash2,
  X,
  ShieldAlert,
  Settings2,
  Plus,
  Search,
  ChevronsUpDown,
  RotateCcw,
  Check,
  SaveAll,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { cn } from "@/lib/utils";

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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Staging state for roles
  const [assignedRoles, setAssignedRoles] = useState<Role[]>(
    permission.roles || [],
  );
  const [rolesToRemove, setRolesToRemove] = useState<Set<number>>(new Set());

  // UI State
  const [isEditMode, setIsEditMode] = useState(false);
  const [roleIdPendingRemoveConfirm, setRoleIdPendingRemoveConfirm] = useState<
    number | null
  >(null);
  const [selectedForBulk, setSelectedForBulk] = useState<Set<number>>(
    new Set(),
  );
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

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
      setRolesToRemove(new Set());
      setSelectedForBulk(new Set());
      setIsEditMode(false);
      setRoleIdPendingRemoveConfirm(null);
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
      // Filter out roles marked for removal
      const finalRoleIds = assignedRoles
        .filter((r) => !rolesToRemove.has(r.id))
        .map((r) => r.id);

      const response = await fetch("/api/permissions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: permission.id,
          name,
          description,
          roleIds: finalRoleIds,
        }),
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

  // Handle Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && (e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, name, description, isSubmitting, assignedRoles, rolesToRemove]);

  const handleAssignToRole = (role: Role) => {
    // If it was marked for removal, just unmark it
    if (rolesToRemove.has(role.id)) {
      const next = new Set(rolesToRemove);
      next.delete(role.id);
      setRolesToRemove(next);
      toast.info(`Restored ${role.name} to assignment list.`);
    } else {
      // Otherwise add to list
      setAssignedRoles((prev) =>
        [...prev, role].sort((a, b) => a.name.localeCompare(b.name)),
      );
      toast.info(`${role.name} added to staging list.`);
    }
    setPickerOpen(false);
  };

  const handleMarkForRemoval = (roleId: number) => {
    if (roleIdPendingRemoveConfirm === roleId) {
      const role = assignedRoles.find((r) => r.id === roleId);
      if (role) confirmRemovalById(role);
      setRoleIdPendingRemoveConfirm(null);
    } else {
      setRoleIdPendingRemoveConfirm(roleId);
    }
  };

  const handleCancelPending = () => {
    setRoleIdPendingRemoveConfirm(null);
  };

  const toggleBulkSelection = (roleId: number) => {
    const next = new Set(selectedForBulk);
    if (next.has(roleId)) {
      next.delete(roleId);
    } else {
      next.add(roleId);
    }
    setSelectedForBulk(next);
  };

  const handleToggleEditMode = () => {
    if (isEditMode) {
      // Exiting "Bulk Delete" mode (Finish Delete)
      if (selectedForBulk.size > 0) {
        setRolesToRemove((prev) => {
          const next = new Set(prev);
          selectedForBulk.forEach((id) => next.add(id));
          return next;
        });
        toast.warning(
          `${selectedForBulk.size} roles marked for pending removal.`,
        );
      }
      setSelectedForBulk(new Set());
    }
    setIsEditMode(!isEditMode);
  };

  const confirmRemoval = () => {
    // This is now handled by double-tap logic
  };

  const confirmRemovalById = (role: Role) => {
    const isNew = !permission.roles?.some((r) => r.id === role.id);

    if (isNew) {
      setAssignedRoles((prev) => prev.filter((r) => r.id !== role.id));
      toast.warning(`${role.name} removed from assignment list.`);
    } else {
      const next = new Set(rolesToRemove);
      next.add(role.id);
      setRolesToRemove(next);
      toast.warning(`${role.name} marked for removal.`);
    }
  };

  const handleUndoRemove = (roleId: number) => {
    const next = new Set(rolesToRemove);
    next.delete(roleId);
    setRolesToRemove(next);
  };

  const handleStageRemovalNew = (roleId: number) => {
    if (roleIdPendingRemoveConfirm === roleId) {
      setAssignedRoles((prev) => prev.filter((r) => r.id !== roleId));
      setRoleIdPendingRemoveConfirm(null);
      toast.warning("Staged assignment removed.");
    } else {
      setRoleIdPendingRemoveConfirm(roleId);
    }
  };

  const handleRequestClose = () => {
    if (hasChanges) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleDeletePermissionClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDeletePermission = async () => {
    setShowConfirmDelete(false);
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
        toast.success("Permission deleted successfully");
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

  const availableRoles = allRoles
    .filter((role) => {
      const isAssigned = assignedRoles.some((ar) => ar.id === role.id);
      const isMarkedForRemoval = rolesToRemove.has(role.id);
      return !isAssigned || isMarkedForRemoval;
    })
    .filter((role) =>
      role.name.toLowerCase().includes(roleSearch.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const hasChanges = useMemo(() => {
    const nameChanged = name !== permission.name;
    const descChanged = description !== (permission.description || "");
    const initialIds = new Set(permission.roles?.map((r) => r.id) || []);
    const currentIds = assignedRoles
      .filter((r) => !rolesToRemove.has(r.id))
      .map((r) => r.id);

    const rolesChanged =
      initialIds.size !== currentIds.length ||
      currentIds.some((id) => !initialIds.has(id));

    return nameChanged || descChanged || rolesChanged;
  }, [name, description, assignedRoles, rolesToRemove, permission]);

  return (
    <Dialog open={isOpen} onOpenChange={handleRequestClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        id="permission-settings-modal-content"
        className="sm:max-w-[480px] h-[80vh] flex flex-col p-0 overflow-hidden"
      >
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="font-lexend text-xl font-bold text-slate-800 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-slate-400" />
              Configure Permission
            </DialogTitle>
            <DialogDescription className="font-inter text-[11px] text-slate-500 mt-1">
              Refine access control parameters for{" "}
              <span className="font-semibold text-slate-700">
                {permission.name}
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 px-5 py-4 space-y-6.5 overflow-y-auto custom-scrollbar">
          <section>
            <div className="flex items-center gap-1.5 mb-3 border-b border-slate-100 mt-2">
              <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 font-lexend mb-2">
                <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                <p>Configuration</p>
              </h3>
            </div>
            <div className="space-y-4">
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
              <div>
                <label className="font-inter text-[11px] font-semibold text-slate-600 mb-1.5 block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what this permission controls..."
                  className="w-full min-h-[85px] rounded-xl border border-slate-200 bg-white p-3 text-xs font-inter focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none shadow-sm"
                />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100">
              <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 font-lexend mb-2">
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                <p>Assigned to Roles</p>
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <Button
                  onClick={handleToggleEditMode}
                  className={cn(
                    "h-7 px-4 text-[10px] tracking-wider transition-all duration-200 rounded-full flex items-center gap-1.5 cursor-pointer border-2 select-none active:scale-95",

                    isEditMode
                      ? "bg-rose-600 text-white border-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:bg-rose-700 hover:shadow-rose-300 ring-2 ring-rose-100 ring-offset-1"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200",
                  )}
                >
                  {isEditMode ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  {isEditMode ? "Finish Delete" : "Bulk Delete"}
                </Button>

                <div ref={pickerRef} className="relative">
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() =>
                            !isEditMode && setPickerOpen(!pickerOpen)
                          }
                          disabled={isAllRolesLoading || isEditMode}
                          className={cn(
                            "h-7 px-3 text-[10px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-none rounded-full flex items-center gap-1.5 transition-all duration-200 active:scale-95",
                            isEditMode
                              ? "opacity-50 cursor-not-allowed border-slate-200 text-slate-400 bg-slate-50"
                              : "cursor-pointer",
                          )}
                        >
                          <Plus className="w-3 h-3" />
                          Add Role
                          <ChevronsUpDown className="w-3 h-3 ml-1 opacity-50" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-white text-xs border border-slate-200 shadow-xl px-4 rounded-lg max-w-[320px] whitespace-normal wrap-break-words"
                      >
                        <p className="text-slate-600 leading-relaxed">
                          Assign new role to this permission
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

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
                              No additional roles
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {assignedRoles.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {assignedRoles.map((role) => {
                    const isMarkedForRemoval = rolesToRemove.has(role.id);
                    const isSelectedForBulk = selectedForBulk.has(role.id);
                    const isNew = !permission.roles?.some(
                      (r) => r.id === role.id,
                    );

                    return (
                      <div
                        key={role.id}
                        className={cn(
                          "flex items-center justify-between p-3.5 transition-all group border-l-4",
                          isMarkedForRemoval
                            ? "bg-rose-50 border-l-rose-500 opacity-80"
                            : isSelectedForBulk
                              ? "bg-blue-50/50 border-l-blue-400"
                              : isNew
                                ? "bg-emerald-50/50 border-l-emerald-500 hover:bg-emerald-50"
                                : "hover:bg-slate-50 border-l-transparent",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {isEditMode && !isNew && (
                            <TooltipProvider>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded border flex items-center justify-center transition-all duration-200",
                                      isMarkedForRemoval
                                        ? "bg-rose-500 border-rose-600 text-white opacity-80 cursor-not-allowed"
                                        : isSelectedForBulk
                                          ? "bg-blue-500 border-blue-600 text-white cursor-pointer active:scale-95"
                                          : "bg-white border-slate-300 text-transparent hover:border-blue-400 cursor-pointer active:scale-95",
                                    )}
                                    onClick={() => !isMarkedForRemoval && toggleBulkSelection(role.id)}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="bg-white text-xs border border-slate-200 shadow-xl px-4 rounded-lg max-w-[320px] whitespace-normal wrap-break-words"
                                >
                                  <p className="text-slate-600 leading-relaxed">
                                    {isMarkedForRemoval 
                                      ? "Role is already pending removal" 
                                      : isSelectedForBulk
                                        ? "Deselect"
                                        : "Select for bulk removal"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ring-1 transition-all duration-300",
                              isMarkedForRemoval
                                ? "bg-rose-100 text-rose-600 ring-rose-200"
                                : isSelectedForBulk
                                  ? "bg-blue-100 text-blue-600 ring-blue-200"
                                  : isNew
                                    ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
                                    : "bg-blue-50 text-blue-600 ring-blue-100",
                              isEditMode && isNew && "opacity-40",
                            )}
                          >
                            {role.name.charAt(0).toUpperCase()}
                          </div>
                          <div
                            className={cn(
                              "transition-all duration-300",
                              isEditMode && isNew && "opacity-40",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-sm font-bold block transition-all duration-300",
                                  isMarkedForRemoval
                                    ? "text-rose-700 line-through"
                                    : "text-slate-700",
                                )}
                              >
                                {role.name}
                              </span>
                              {isNew && !isMarkedForRemoval && (
                                <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-200 shadow-sm animate-pulse">
                                  New
                                </span>
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-[10px] font-medium transition-all duration-300",
                                isMarkedForRemoval
                                  ? "text-rose-400"
                                  : isSelectedForBulk
                                    ? "text-blue-500"
                                    : isNew
                                      ? "text-emerald-600"
                                      : "text-slate-400",
                              )}
                            >
                              {isMarkedForRemoval
                                ? "Pending Removal"
                                : isSelectedForBulk
                                  ? "Selected for removal"
                                  : isNew
                                    ? "Staged Assignment"
                                    : "Assigned Permission"}
                            </span>
                          </div>
                        </div>

                        {isMarkedForRemoval && !isEditMode && (
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleUndoRemove(role.id)}
                                  className="bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50 transition-all duration-200 p-2 rounded-lg flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="bg-white text-xs border border-slate-200 shadow-xl px-4 rounded-lg max-w-[320px] whitespace-normal wrap-break-words"
                              >
                                <p className="text-slate-600 leading-relaxed">
                                  Restore Role
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {!isEditMode && !isMarkedForRemoval && !pickerOpen && (
                          <div className="flex items-center gap-2">
                            {roleIdPendingRemoveConfirm === role.id ? (
                              <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
                                <TooltipProvider>
                                  <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={handleCancelPending}
                                        className="h-8 w-8 bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="bg-white text-xs border border-slate-200 shadow-xl px-4 rounded-lg max-w-[320px] whitespace-normal wrap-break-words"
                                    >
                                      <p className="text-slate-600 leading-relaxed">
                                        Cancel
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() =>
                                          handleMarkForRemoval(role.id)
                                        }
                                        className="h-8 w-8 bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="bg-white text-xs border border-slate-200 shadow-xl px-4 rounded-lg max-w-[320px] whitespace-normal wrap-break-words"
                                    >
                                      <p className="text-slate-600 leading-relaxed">
                                        Confirm Removal
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            ) : (
                              <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() =>
                                        handleMarkForRemoval(role.id)
                                      }
                                      className={cn(
                                        "transition-all duration-200 p-2 rounded-lg flex items-center justify-center cursor-pointer shadow-sm border active:scale-95",
                                        isNew
                                          ? "bg-slate-50 text-slate-400 border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100"
                                          : "bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100",
                                      )}
                                    >
                                      {isNew ? (
                                        <X className="w-4 h-4" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="bg-white text-xs border border-slate-200 shadow-xl px-4 rounded-lg max-w-[320px] whitespace-normal wrap-break-words"
                                  >
                                    <p className="text-slate-600 leading-relaxed">
                                      {isNew
                                        ? "Remove Staged Role"
                                        : "Mark for Removal"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

          <section className="bg-rose-50/50 border border-rose-100/50 rounded-xl p-3.5 mt-2 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-1.5 rounded-lg shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-bold text-rose-900 leading-none">
                  Danger Zone
                </h4>
                <p className="text-[10px] text-rose-700/70 mt-0.5 leading-tight truncate">
                  Permanently delete this entire permission.
                </p>
              </div>
              <Button
                onClick={handleDeletePermissionClick}
                variant="ghost"
                disabled={isDeleting}
                className="h-8 px-3 text-[10px] font-bold text-rose-600 bg-white hover:bg-rose-600 hover:text-white transition-all border border-rose-200 shadow-sm rounded-lg active:scale-95 cursor-pointer whitespace-nowrap"
              >
                {isDeleting ? "Deleting..." : "Delete Permission"}
              </Button>
            </div>
          </section>
        </div>

        <DialogFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex-1">
            {hasChanges && (
              <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 w-fit">
                <RotateCcw className="w-3 h-3" />
                Unsaved Changes
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={handleRequestClose}
            className="h-10 px-6 rounded-lg font-bold text-slate-500 border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-300 text-xs cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={() => setShowSaveConfirm(true)}
            disabled={isSubmitting || !name || !hasChanges}
            className="px-8 bg-[#0F172A] hover:bg-emerald-600 text-white font-bold h-10 text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              "Syncing..."
            ) : (
              <>
                <SaveAll className="w-4 h-4" />
                Update Permission
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmationDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDeletePermission}
        title="Delete Permission"
        description="You are about to permanently remove this system entry. This may affect linked modules."
        entityName={permission.name}
        confirmText="Confirm Delete"
      />

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => {
          setShowSaveConfirm(false);
          handleSubmit();
        }}
        title="Confirm Updates"
        description="Are you sure you want to sync these changes to the system? This action will update all role assignments for this permission."
        confirmText="Update Now"
        variant="success"
      />

      <ConfirmationDialog
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={() => {
          setShowCloseConfirm(false);
          onClose();
        }}
        title="Unsaved Changes"
        description="You have pending changes that haven't been synced. Are you sure you want to discard them?"
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        variant="warning"
      />
    </Dialog>
  );
}
