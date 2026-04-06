"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Search, 
  ChevronsUpDown, 
  X, 
  ShieldCheck, 
  Plus, 
  KeyRound, 
  CirclePlus,
  Trash2,
  Check,
  RotateCcw,
  ShieldAlert,
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
  UserRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Permission {
  id: number;
  name: string;
}

interface RoleForDialog {
  id: string | number;
  name: string;
  icon?: string;
  permissionIds: string[];
  permissionNames?: string[];
}

interface AddRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: RoleForDialog | null;
  permissions: Permission[];
}

const AVAILABLE_ICONS = [
  { name: "KeyRound", icon: KeyRound },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Users", icon: Users },
  { name: "Shield", icon: Shield },
  { name: "Key", icon: Key },
  { name: "Settings2", icon: Settings2 },
  { name: "Lock", icon: Lock },
  { name: "Unlock", icon: Unlock },
  { name: "UserRound", icon: UserRound },
  { name: "Briefcase", icon: Briefcase },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Gavel", icon: Gavel },
  { name: "BadgeCheck", icon: BadgeCheck },
  { name: "Database", icon: Database },
  { name: "Eye", icon: Eye },
  { name: "Globe", icon: Globe },
  { name: "Building", icon: Building },
  { name: "CreditCard", icon: CreditCard },
  { name: "FileText", icon: FileText },
  { name: "LayoutDashboard", icon: LayoutDashboard },
  { name: "PiggyBank", icon: PiggyBank },
];

export function AddRoleDialog({
  isOpen,
  onClose,
  onSuccess,
  role,
  permissions: allPermissions,
}: AddRoleDialogProps) {
  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("KeyRound");
  
  // Staging state for permissions
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([]);
  const [permissionsToRemove, setPermissionsToRemove] = useState<Set<number>>(new Set());
  
  // UI State
  const [isEditMode, setIsEditMode] = useState(false);
  const [permissionIdPendingRemoveConfirm, setPermissionIdPendingRemoveConfirm] = useState<number | null>(null);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Prepopulate on open/edit
  useEffect(() => {
    if (isOpen) {
      if (role) {
        setName(role.name || "");
        setIconName(role.icon || "KeyRound");
        
        const normalizedNames = (role.permissionNames || []).map(n => n.trim().toLowerCase());
        const initialPermissions = allPermissions.filter(p => 
          normalizedNames.includes(p.name.trim().toLowerCase()) || 
          role.permissionIds.map(String).includes(String(p.id))
        );
        setAssignedPermissions(initialPermissions);
      } else {
        setName("");
        setIconName("KeyRound");
        setAssignedPermissions([]);
      }
      setPermissionsToRemove(new Set());
      setPickerOpen(false);
      setIsEditMode(false);
      setPermissionSearch("");
    }
  }, [isOpen, role, allPermissions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScrubbedChange = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9 .\_\-']/g, "");
    setName(clean);
  };

  const handleAssignPermission = (permission: Permission) => {
    if (permissionsToRemove.has(permission.id)) {
      const next = new Set(permissionsToRemove);
      next.delete(permission.id);
      setPermissionsToRemove(next);
    } else {
      setAssignedPermissions(prev => [...prev, permission].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setPickerOpen(false);
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleMarkForRemoval = (id: number) => {
    if (permissionIdPendingRemoveConfirm === id) {
      const isNew = !role?.permissionIds.map(String).includes(String(id));
      if (isNew) {
        setAssignedPermissions(prev => prev.filter(p => p.id !== id));
      } else {
        const next = new Set(permissionsToRemove);
        next.add(id);
        setPermissionsToRemove(next);
      }
      setPermissionIdPendingRemoveConfirm(null);
    } else {
      setPermissionIdPendingRemoveConfirm(id);
    }
  };

  const handleUndoRemove = (id: number) => {
    const next = new Set(permissionsToRemove);
    next.delete(id);
    setPermissionsToRemove(next);
  };

  const handleSubmit = async () => {
    const roleName = name.trim();
    if (!roleName) return;

    const finalPermissionIds = assignedPermissions
      .filter(p => !permissionsToRemove.has(p.id))
      .map(p => p.id);

    setIsSubmitting(true);
    const endpoint = role ? "/api/roles/update" : "/api/roles/create";
    const payload = role
      ? { id: role.id, name: roleName, icon: iconName, permission_ids: finalPermissionIds }
      : { name: roleName, icon: iconName, permission_ids: finalPermissionIds };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to save role");
      }
    } catch (error) {
      console.error("Failed to save role", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePermissions = allPermissions
    .filter(p => !assignedPermissions.some(ap => ap.id === p.id) || permissionsToRemove.has(p.id))
    .filter(p => p.name.toLowerCase().includes(permissionSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-[520px] p-0 overflow-hidden rounded-xl border-none shadow-2xl h-[85vh] flex flex-col"
      >
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="font-lexend text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-400" />
              {role ? "Edit Role" : "Add New Role"}
            </DialogTitle>
            <DialogDescription className="font-inter text-[11px] text-slate-500 mt-1">
              {role ? "Update role name, icon and defined access levels." : "Create a new role with a custom icon and permissions."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 px-6 py-5 overflow-y-auto space-y-7 custom-scrollbar">
          <section>
            <div className="flex items-center gap-1.5 mb-4 border-b border-slate-100">
              <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 font-lexend mb-2 uppercase tracking-tight">
                <Settings2 className="w-3.5 h-3.5 text-blue-500" />
                Identity & Icon
              </h3>
            </div>
            
            <div className="space-y-4">
              <ValidatedInput
                label="Role Name"
                value={name}
                onChange={handleScrubbedChange}
                placeholder="e.g. Finance Officer, Assessor"
                maxLength={50}
                required
                validator="permission-&-role-name"
                type="text"
              />

              <div className="space-y-2.5">
                <label className="font-inter text-[11px] font-bold text-slate-600 uppercase tracking-tighter">
                  Role Icon
                </label>
                <div className="grid grid-cols-7 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto custom-scrollbar">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isActive = iconName === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setIconName(item.name)}
                        className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90",
                          isActive 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200 ring-2 ring-blue-100 ring-offset-1" 
                            : "bg-white text-slate-500 border border-slate-100 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/30 shadow-sm"
                        )}
                      >
                        <IconComp size={16} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100">
              <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 font-lexend mb-2 uppercase tracking-tight">
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                Permissions Mapping
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <Button
                  onClick={handleToggleEditMode}
                  className={cn(
                    "h-7 px-3 text-[10px] tracking-wider transition-all duration-200 rounded-full flex items-center gap-1.5 cursor-pointer border-2 select-none active:scale-95",
                    isEditMode
                      ? "bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-100 ring-offset-1"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-rose-600"
                  )}
                >
                  {isEditMode ? <Check className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                  {isEditMode ? "Finish" : "Bulk"}
                </Button>

                <div ref={pickerRef} className="relative">
                  <Button
                    onClick={() => !isEditMode && setPickerOpen(!pickerOpen)}
                    disabled={isEditMode}
                    className={cn(
                      "h-7 px-3 text-[10px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-none rounded-full flex items-center gap-1.5 transition-all duration-200 active:scale-95",
                      isEditMode ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    )}
                  >
                    <Plus className="w-3 h-3" />
                    Add Permission
                    <ChevronsUpDown className="w-3 h-3 ml-1 opacity-50" />
                  </Button>

                  {pickerOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 ring-4 ring-slate-100">
                      <div className="p-3 bg-slate-50 border-b border-slate-100">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            autoFocus
                            type="text"
                            value={permissionSearch}
                            onChange={(e) => setPermissionSearch(e.target.value)}
                            placeholder="Search permissions..."
                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs font-inter outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </div>
                      <div className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
                        {availablePermissions.length > 0 ? (
                          availablePermissions.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleAssignPermission(p)}
                              className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors cursor-pointer group"
                            >
                              <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                {p.name.substring(0, 2).toUpperCase()}
                              </div>
                              {p.name}
                            </button>
                          ))
                        ) : (
                          <div className="p-8 text-center bg-slate-50/50">
                            <p className="text-[10px] text-slate-400 italic font-medium">No results found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {assignedPermissions.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto custom-scrollbar">
                  {assignedPermissions.map((p) => {
                    const isMarkedForRemoval = permissionsToRemove.has(p.id);
                    const isNew = !role?.permissionIds.map(String).includes(String(p.id));

                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "flex items-center justify-between p-3 transition-all border-l-4",
                          isMarkedForRemoval 
                            ? "bg-rose-50 border-l-rose-500 opacity-80" 
                            : isNew 
                              ? "bg-emerald-50/50 border-l-emerald-500" 
                              : "hover:bg-slate-50 border-l-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ring-1 transition-all",
                            isMarkedForRemoval 
                              ? "bg-rose-100 text-rose-600 ring-rose-200" 
                              : isNew 
                                ? "bg-emerald-100 text-emerald-700 ring-emerald-200" 
                                : "bg-blue-50 text-blue-600 ring-blue-100"
                          )}>
                            {p.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-xs font-bold transition-all",
                                isMarkedForRemoval ? "text-rose-700 line-through" : "text-slate-700"
                              )}>
                                {p.name}
                              </span>
                              {isNew && !isMarkedForRemoval && (
                                <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-200">New</span>
                              )}
                            </div>
                            <p className={cn(
                              "text-[10px] font-medium opacity-60",
                              isMarkedForRemoval ? "text-rose-500" : isNew ? "text-emerald-600" : "text-slate-500"
                            )}>
                              {isMarkedForRemoval ? "Pending Removal" : isNew ? "Staged Access" : "Assigned Scope"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isMarkedForRemoval ? (
                            <button
                              onClick={() => handleUndoRemove(p.id)}
                              className="h-7 w-7 bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                              <RotateCcw size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkForRemoval(p.id)}
                              className={cn(
                                "h-7 w-7 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95 border",
                                isNew 
                                  ? "bg-slate-50 text-slate-400 border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200" 
                                  : "bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100"
                              )}
                            >
                              {isNew ? <X size={14} /> : <Trash2 size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center bg-slate-50/20">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldAlert className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium italic">No permissions mapped</p>
                  <p className="text-[9px] text-slate-400 mt-1">Assign access scopes to define role behavior.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <DialogFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-10 px-6 rounded-lg font-bold text-slate-500 border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-300 text-xs cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="px-8 bg-[#0F172A] hover:bg-emerald-600 text-white font-bold h-10 text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                {role ? <Plus className="w-4 h-4" /> : <CirclePlus className="w-4 h-4" />}
                {role ? "Update Role" : "Create Role"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
