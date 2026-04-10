import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  ShieldCheck,
  Plus,
  KeyRound,
  Trash2,
  Check,
  RotateCcw,
  ShieldAlert,
  Settings2,
  UsersRound,
  ArrowDownToLine,
  UserMinus,
  UserRound,
  ChevronRight,
  Lock,
  Unlock,
  Shield,
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
  SaveAll,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

interface Permission {
  id: number;
  name: string;
}

interface ApiUser {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  suffix?: string;
  role?: string;
  empID?: string;
  username?: string;
  birthdate?: string;
  age?: string;
  sex?: boolean;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  status?: boolean;
  image_path?: string;
  role_id?: number;
  roles?: {
    name?: string;
  } | null;
}

interface ListedRole {
  id: string | number;
  name: string;
  icon?: string;
  permissionIds: string[];
  permissionNames?: string[];
  createdAt: string;
}

interface RoleMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: ListedRole | null;
  allPermissions: Permission[];
  allUsers: ApiUser[];
  allRoles: ListedRole[];
}

const AVAILABLE_ICONS = [
  { name: "KeyRound", icon: KeyRound, label: "Key Round" },
  { name: "ShieldCheck", icon: ShieldCheck, label: "Shield Check" },
  { name: "Users", icon: UsersRound, label: "Users" },
  { name: "Shield", icon: Shield, label: "Shield" },
  { name: "Settings2", icon: Settings2, label: "Settings" },
  { name: "Lock", icon: Lock, label: "Lock" },
  { name: "Unlock", icon: Unlock, label: "Unlock" },
  { name: "UserRound", icon: UserRound, label: "User" },
  { name: "Briefcase", icon: Briefcase, label: "Briefcase" },
  { name: "GraduationCap", icon: GraduationCap, label: "Graduation" },
  { name: "Gavel", icon: Gavel, label: "Gavel" },
  { name: "BadgeCheck", icon: BadgeCheck, label: "Badge" },
  { name: "Database", icon: Database, label: "Database" },
  { name: "Eye", icon: Eye, label: "Eye" },
  { name: "Globe", icon: Globe, label: "Globe" },
  { name: "Building", icon: Building, label: "Building" },
  { name: "CreditCard", icon: CreditCard, label: "Card" },
  { name: "FileText", icon: FileText, label: "Document" },
  { name: "LayoutDashboard", icon: LayoutDashboard, label: "Dashboard" },
  { name: "PiggyBank", icon: PiggyBank, label: "Finance" },
];

type ModalTab = "edit" | "users" | "delete";

export function RoleMasterModal({
  isOpen,
  onClose,
  onSuccess,
  role,
  allPermissions,
  allUsers,
  allRoles,
}: RoleMasterModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("edit");
  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("KeyRound");

  // Staging for Edit Tab
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>(
    [],
  );
  const [permissionsToRemove, setPermissionsToRemove] = useState<Set<number>>(
    new Set(),
  );
  const [permissionSearch, setPermissionSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingRemoveConfirm, setPendingRemoveConfirm] = useState<
    number | null
  >(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState<Set<number>>(
    new Set(),
  );
  const [pickerSelectedIds, setPickerSelectedIds] = useState<Set<number>>(
    new Set(),
  );
  const pickerRef = useRef<HTMLDivElement>(null);

  // Users Tab State
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isProcessingUser, setIsProcessingUser] = useState<string | null>(null);
  const [demoteSelectingFor, setDemoteSelectingFor] = useState<string | null>(
    null,
  );
  const [currentUser, setCurrentUser] = useState<{ empID: string } | null>(
    null,
  );

  // Global Submitting State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync logic state (mirroring PermissionSettingsModal)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const wasOpen = useRef(false);
  // Sync safety: preventing "New" badge flashes on open
  const [isInitializing, setIsInitializing] = useState(true);

  const normalizeRoleName = (n?: string) => (n ?? "").trim().toLowerCase();

  // Reset and Local Storage Sync
  useEffect(() => {
    if (isOpen) {
      if (!wasOpen.current) {
        // Just opened - reset states
        setIsInitializing(true);
        if (role) {
          setName(role.name || "");
          setIconName(role.icon || "KeyRound");

          const normalizedNames = (role.permissionNames || []).map((n) =>
            n.trim().toLowerCase(),
          );
          const initialPermissions = allPermissions.filter(
            (p) =>
              normalizedNames.includes(p.name.trim().toLowerCase()) ||
              role.permissionIds.map(String).includes(String(p.id)),
          );
          setAssignedPermissions(initialPermissions);
          setActiveTab("edit");
        } else {
          setName("");
          setIconName("KeyRound");
          setAssignedPermissions([]);
          setActiveTab("edit");
        }
        setPermissionsToRemove(new Set());
        setPickerOpen(false);
        setPermissionSearch("");
        setUserSearchTerm("");
        setDemoteSelectingFor(null);
        setPendingRemoveConfirm(null);
        setIsEditMode(false);
        setSelectedForBulk(new Set());
        setPickerSelectedIds(new Set());
        setShowSaveConfirm(false);
        setShowCloseConfirm(false);

        // Wait for one tick to ensure states are settled before showing dynamic updates
        setTimeout(() => setIsInitializing(false), 50);
      }
      wasOpen.current = true;
    } else {
      // Closing - do NOT reset states yet to allow smooth transition
      wasOpen.current = false;
    }
  }, [isOpen, role, allPermissions]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => data.user && setCurrentUser(data.user))
      .catch(() => null);
  }, []);

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

  // Derived calculation: Which permissions were originally assigned to the role?
  // We match against allPermissions using both IDs and names to ensure consistency
  const initialIds = useMemo(() => {
    if (!role || !allPermissions.length) return new Set<string>();

    const normalizedNames = (role.permissionNames || []).map((n) =>
      n.trim().toLowerCase(),
    );
    const roleIds = (role.permissionIds || []).map(String);

    return new Set(
      allPermissions
        .filter(
          (p) =>
            normalizedNames.includes(p.name.trim().toLowerCase()) ||
            roleIds.includes(String(p.id)),
        )
        .map((p) => String(p.id)),
    );
  }, [role, allPermissions]);

  // Detect unsaved changes (mirrors PermissionSettingsModal hasChanges logic)
  const hasChanges = useMemo(() => {
    if (isInitializing) return false;
    if (!role) return name.trim().length > 0 || assignedPermissions.length > 0;

    const nameChanged = name !== role.name;
    const iconChanged = iconName !== (role.icon || "KeyRound");

    const currentIds = assignedPermissions
      .filter((p) => !permissionsToRemove.has(p.id))
      .map((p) => String(p.id));

    const permsChanged =
      initialIds.size !== currentIds.length ||
      currentIds.some((id) => !initialIds.has(id));

    return nameChanged || iconChanged || permsChanged;
  }, [
    name,
    iconName,
    assignedPermissions,
    permissionsToRemove,
    role,
    initialIds,
  ]);

  // Handlers for Edit Tab
  const handleMarkForRemoval = (p: Permission) => {
    const isNew = !initialIds.has(String(p.id));
    if (isNew) {
      setAssignedPermissions((prev) => prev.filter((perm) => perm.id !== p.id));
      toast.warning("Staged assignment removed.");
      return;
    }

    setPermissionsToRemove((prev) => {
      const next = new Set(prev);
      next.add(p.id);
      return next;
    });
    toast.warning(`${p.name} marked for removal.`);
  };

  const handleUndoRemove = (permId: number) => {
    setPermissionsToRemove((prev) => {
      const n = new Set(prev);
      n.delete(permId);
      return n;
    });
    const p = assignedPermissions.find((perm) => perm.id === permId);
    if (p) toast.success(`Restored ${p.name}`);
  };

  const toggleBulkSelection = (permId: number) => {
    const next = new Set(selectedForBulk);
    if (next.has(permId)) next.delete(permId);
    else next.add(permId);
    setSelectedForBulk(next);
  };

  const handleToggleEditMode = () => {
    if (isEditMode) {
      if (selectedForBulk.size > 0) {
        setPermissionsToRemove((prev) => {
          const next = new Set(prev);
          selectedForBulk.forEach((id) => next.add(id));
          return next;
        });
        toast.warning(
          `${selectedForBulk.size} permission(s) marked for removal.`,
        );
      }
      setSelectedForBulk(new Set());
    }
    setIsEditMode((prev) => !prev);
  };

  const togglePickerSelection = (permId: number) => {
    const next = new Set(pickerSelectedIds);
    if (next.has(permId)) next.delete(permId);
    else next.add(permId);
    setPickerSelectedIds(next);
  };

  const handleBulkAddFromPicker = () => {
    if (pickerSelectedIds.size === 0) return;
    // Restore any previously marked for removal
    const toRestore = [...pickerSelectedIds].filter((id) =>
      permissionsToRemove.has(id),
    );
    if (toRestore.length > 0) {
      setPermissionsToRemove((prev) => {
        const n = new Set(prev);
        toRestore.forEach((id) => n.delete(id));
        return n;
      });
    }
    // Add new ones not already in assigned
    const toAdd = allPermissions.filter(
      (p) =>
        pickerSelectedIds.has(p.id) &&
        !assignedPermissions.some((ap) => ap.id === p.id),
    );
    if (toAdd.length > 0) {
      setAssignedPermissions((prev) =>
        [...prev, ...toAdd].sort((a, b) => a.name.localeCompare(b.name)),
      );
    }
    toast.info(
      `${pickerSelectedIds.size} permission(s) added to staging list.`,
    );
    setPickerSelectedIds(new Set());
    setPickerOpen(false);
    setPermissionSearch("");
  };

  const handleRequestClose = () => {
    if (hasChanges) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSubmitEdit = async () => {
    const roleName = name.trim();
    if (!roleName) return;

    const finalPermissionIds = assignedPermissions
      .filter((p) => !permissionsToRemove.has(p.id))
      .map((p) => p.id);

    setIsSubmitting(true);
    const endpoint = role ? "/api/roles/update" : "/api/roles/create";
    const payload = role
      ? {
          id: role.id,
          name: roleName,
          icon: iconName,
          permission_ids: finalPermissionIds,
        }
      : { name: roleName, icon: iconName, permission_ids: finalPermissionIds };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Settings saved");
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Users Tab
  const totalRoleUsers = useMemo(() => {
    if (!role) return [];
    const target = normalizeRoleName(role.name);
    return allUsers.filter(
      (u) => normalizeRoleName(u.roles?.name ?? u.role ?? "") === target,
    );
  }, [role, allUsers]);

  const roleUsers = useMemo(() => {
    return totalRoleUsers.filter((u) => {
      const fullSearch =
        `${u.firstname} ${u.lastname} ${u.empID}`.toLowerCase();
      return fullSearch.includes(userSearchTerm.toLowerCase());
    });
  }, [totalRoleUsers, userSearchTerm]);

  const handleUserAction = async (
    user: ApiUser,
    action: "kick" | "demote",
    newRoleId?: number,
  ) => {
    if (!user.empID) return;
    setIsProcessingUser(user.empID);

    try {
      const listResp = await fetch("/api/user/list", { cache: "no-store" });
      const listData = await listResp.json();
      const decodedUsers = listData._data
        ? JSON.parse(atob(atob(atob(listData._data))))
        : (listData.users ?? []);
      const fullUser = (decodedUsers as any[]).find(
        (u) => u.empID === user.empID,
      );
      if (!fullUser) throw new Error("User data source unavailable.");

      const payload = {
        originalEmpID: fullUser.empID,
        empID: fullUser.empID,
        username: fullUser.username,
        firstname: fullUser.firstname,
        middlename: fullUser.middlename || "",
        lastname: fullUser.lastname,
        suffix: fullUser.suffix || "",
        birthdate: fullUser.birthdate || "1990-01-01",
        age: String(fullUser.age || "30"),
        sex: !!fullUser.sex,
        email: fullUser.email,
        phone: fullUser.phone || "0000000000",
        department: fullUser.department || "General",
        position: fullUser.position || "Staff",
        image_path: fullUser.image_path,
        status: fullUser.status ?? true,
        role_id:
          action === "kick"
            ? 19
            : action === "demote"
              ? newRoleId
              : fullUser.role_id,
      };

      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          action === "kick" ? "User deactivated" : "User reassigned",
        );
        onSuccess();
        if (action === "demote") setDemoteSelectingFor(null);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Update failed");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessingUser(null);
    }
  };

  // Handlers for Delete Tab
  const handleDeleteRole = async () => {
    if (!role) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/roles/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: role.name }),
      });
      if (response.ok) {
        toast.success("Role permanently deleted");
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Deletion failed");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePermissions = allPermissions
    .filter(
      (p) =>
        !assignedPermissions.some((ap) => ap.id === p.id) ||
        permissionsToRemove.has(p.id),
    )
    .filter((p) =>
      p.name.toLowerCase().includes(permissionSearch.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleRequestClose}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="sm:max-w-[580px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl h-[80vh] flex flex-col bg-white focus:outline-none focus:ring-0"
        >
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-5">
            <DialogHeader>
              <DialogTitle className="font-lexend text-xl font-bold text-slate-800 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-slate-400" />
                {activeTab === "edit"
                  ? "Edit Role Settings"
                  : activeTab === "users"
                    ? "Manage Assigned Users"
                    : "Manage Danger Zone"}
              </DialogTitle>
              <DialogDescription className="font-inter text-[11px] text-slate-500 mt-1">
                {activeTab === "edit" &&
                  (role
                    ? `Modify settings and access permissions for ${role.name}.`
                    : wasOpen.current
                      ? "Configuration settings persistent state."
                      : "Preparing role configuration details...")}
                {activeTab === "users" &&
                  `Review personnel currently bound to the ${role?.name} role.`}
                {activeTab === "delete" &&
                  "Sensitive operations requiring administrative authorization."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ModalTab)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="border-b border-slate-100 bg-white px-6">
              <TabsList className="h-12 w-full bg-transparent p-0 rounded-none border-none flex gap-8">
                <TabsTrigger
                  value="edit"
                  className={cn(
                    "h-12 rounded-none border-b-2 bg-transparent px-1 pb-3 pt-3 text-xs font-bold transition-all focus-visible:ring-0 focus-visible:outline-none shadow-none data-[state=active]:shadow-none -mb-px",
                    activeTab === "edit"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700",
                  )}
                >
                  Configuration
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  disabled={!role}
                  className={cn(
                    "h-12 rounded-none border-b-2 bg-transparent px-1 pb-3 pt-3 text-xs font-bold transition-all focus-visible:ring-0 focus-visible:outline-none disabled:opacity-30 shadow-none data-[state=active]:shadow-none -mb-px",
                    activeTab === "users"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700",
                  )}
                >
                  Personnel
                </TabsTrigger>
                <TabsTrigger
                  value="delete"
                  disabled={!role}
                  className={cn(
                    "h-12 rounded-none border-b-2 bg-transparent px-1 pb-3 pt-3 text-xs font-bold transition-all focus-visible:ring-0 focus-visible:outline-none disabled:opacity-30 shadow-none data-[state=active]:shadow-none -mb-px",
                    activeTab === "delete"
                      ? "border-rose-600 text-rose-600"
                      : "border-transparent text-slate-500 hover:text-slate-700",
                  )}
                >
                  Danger Zone
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              <TabsContent
                value="edit"
                className="px-6 py-6 space-y-8 outline-none animate-in fade-in slide-in-from-left-4 duration-300 m-0 focus-visible:outline-none"
              >
                <div>
                  <section>
                    <div className="flex items-center gap-1.5 mb-4 border-b border-slate-100">
                      <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 font-lexend mb-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        Role Identity
                      </h3>
                    </div>
                    <div className="space-y-5 mb-4">
                      <ValidatedInput
                        label="Role Name"
                        value={name}
                        onChange={(n) =>
                          setName(n.replace(/[^a-zA-Z0-9 .\\_\-']/g, ""))
                        }
                        placeholder="e.g. Finance Admin"
                        maxLength={50}
                        required
                        validator="permission-&-role-name"
                        type="text"
                      />
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100">
                      <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 font-lexend mb-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Access Permissions
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <TooltipProvider>
                          <Tooltip delayDuration={250}>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={handleToggleEditMode}
                                className={cn(
                                  "h-7 px-4 text-[10px] tracking-wider transition-all duration-200 rounded-full flex items-center gap-1.5 cursor-pointer border-2 select-none active:scale-95 focus-visible:outline-none shadow-none",
                                  isEditMode
                                    ? "bg-rose-600 text-white border-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:bg-rose-700 ring-2 ring-rose-100 ring-offset-1"
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
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="bg-white text-xs border border-slate-200 shadow-xl px-4 rounded-lg"
                            >
                              <p className="text-slate-600 leading-relaxed">
                                {isEditMode
                                  ? "Apply selected items as pending removal"
                                  : "Select multiple permissions to remove"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div ref={pickerRef} className="relative">
                          <TooltipProvider>
                            <Tooltip delayDuration={250}>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() =>
                                    !isEditMode && setPickerOpen(!pickerOpen)
                                  }
                                  disabled={isEditMode}
                                  className={cn(
                                    "h-7 px-3 text-[10px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-none rounded-full flex items-center gap-1.5 transition-all duration-200 active:scale-95 focus-visible:outline-none",
                                    isEditMode
                                      ? "opacity-50 cursor-not-allowed border-slate-200 text-slate-400 bg-slate-50"
                                      : "cursor-pointer",
                                  )}
                                >
                                  <Plus className="w-3 h-3" /> Add Permission
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="bg-white text-xs border border-slate-200 shadow-xl px-4 rounded-lg"
                              >
                                <p className="text-slate-600 leading-relaxed">
                                  Add permissions to the staging list
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {pickerOpen && (
                            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 ring-4 ring-slate-100">
                              <div className="p-3 bg-slate-100/50 border-b border-slate-100">
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                  <input
                                    autoFocus
                                    type="text"
                                    value={permissionSearch}
                                    onChange={(e) =>
                                      setPermissionSearch(e.target.value)
                                    }
                                    placeholder="Search Permissions..."
                                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all font-inter"
                                  />
                                </div>
                              </div>
                              <div className="max-h-52 overflow-y-auto py-1 custom-scrollbar bg-white">
                                {availablePermissions.length > 0 ? (
                                  availablePermissions.map((p) => {
                                    const isChecked = pickerSelectedIds.has(
                                      p.id,
                                    );
                                    return (
                                      <button
                                        key={p.id}
                                        onClick={() =>
                                          togglePickerSelection(p.id)
                                        }
                                        className={cn(
                                          "w-full text-left px-3 py-2.5 text-xs flex items-center gap-3 transition-colors focus-visible:outline-none",
                                          isChecked
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-slate-600 hover:bg-blue-50/50 hover:text-blue-600",
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                                            isChecked
                                              ? "bg-blue-500 border-blue-600 text-white"
                                              : "bg-white border-slate-300",
                                          )}
                                        >
                                          {isChecked && <Check size={9} />}
                                        </div>
                                        <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center text-[10px] uppercase font-bold text-slate-400 shrink-0">
                                          {p.name.substring(0, 2)}
                                        </div>
                                        <span className="truncate">
                                          {p.name}
                                        </span>
                                      </button>
                                    );
                                  })
                                ) : (
                                  <p className="p-4 text-[10px] text-slate-400 italic text-center font-inter">
                                    No results found
                                  </p>
                                )}
                              </div>
                              <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
                                <span className="text-[10px] text-slate-400 font-medium font-inter">
                                  {pickerSelectedIds.size > 0
                                    ? `${pickerSelectedIds.size} selected`
                                    : "Select permissions"}
                                </span>
                                <button
                                  onClick={handleBulkAddFromPicker}
                                  disabled={pickerSelectedIds.size === 0}
                                  className="h-7 px-3 text-[10px] font-bold bg-blue-600 text-white rounded-lg flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 shadow-sm cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add
                                  {pickerSelectedIds.size > 0
                                    ? ` ${pickerSelectedIds.size}`
                                    : ""}{" "}
                                  Permission
                                  {pickerSelectedIds.size !== 1 ? "s" : ""}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4">
                      {assignedPermissions.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {assignedPermissions.map((p) => {
                            const isMarkedForRemoval = permissionsToRemove.has(
                              p.id,
                            );
                            const isNew = !initialIds.has(String(p.id));
                            const isSelectedForBulk = selectedForBulk.has(p.id);
                            const isPendingConfirm =
                              pendingRemoveConfirm === p.id;

                            return (
                              <div
                                key={p.id}
                                className={cn(
                                  "flex items-center justify-between p-3.5 transition-all group border-l-4",
                                  isMarkedForRemoval
                                    ? "bg-rose-50 border-l-rose-500 opacity-80"
                                    : isSelectedForBulk
                                      ? "bg-blue-50/50 border-l-blue-400"
                                      : isPendingConfirm
                                        ? "bg-amber-50/40 border-l-amber-400"
                                        : isNew
                                          ? "bg-emerald-50/50 border-l-emerald-500 hover:bg-emerald-50"
                                          : "hover:bg-slate-50 border-l-transparent",
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  {isEditMode && !isNew && (
                                    <div
                                      className={cn(
                                        "w-5 h-5 rounded border flex items-center justify-center transition-all duration-200",
                                        isMarkedForRemoval
                                          ? "bg-rose-500 border-rose-600 text-white opacity-80 cursor-not-allowed"
                                          : isSelectedForBulk
                                            ? "bg-blue-500 border-blue-600 text-white cursor-pointer active:scale-95"
                                            : "bg-white border-slate-300 text-transparent hover:border-blue-400 cursor-pointer active:scale-95",
                                      )}
                                      onClick={() =>
                                        !isMarkedForRemoval &&
                                        toggleBulkSelection(p.id)
                                      }
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                  <div
                                    className={cn(
                                      "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ring-1 transition-all duration-300",
                                      isMarkedForRemoval
                                        ? "bg-rose-100 text-rose-600 ring-rose-200"
                                        : isSelectedForBulk
                                          ? "bg-blue-100 text-blue-600 ring-blue-200"
                                          : isPendingConfirm
                                            ? "bg-amber-100 text-amber-700 ring-amber-200"
                                            : isNew
                                              ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
                                              : "bg-blue-50 text-blue-600 ring-blue-100",
                                      isEditMode && isNew && "opacity-40",
                                    )}
                                  >
                                    {p.name.substring(0, 2).toUpperCase()}
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
                                            : isPendingConfirm
                                              ? "text-amber-800"
                                              : "text-slate-700",
                                        )}
                                      >
                                        {p.name}
                                      </span>
                                      {isNew && !isMarkedForRemoval && !isInitializing && role && (
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
                                            : isPendingConfirm
                                              ? "text-amber-600"
                                              : isNew
                                                ? "text-emerald-600"
                                                : "text-slate-400",
                                      )}
                                    >
                                      {isMarkedForRemoval
                                        ? "Pending Removal"
                                        : isSelectedForBulk
                                          ? "Selected for removal"
                                          : isPendingConfirm
                                            ? "Confirm removal?"
                                            : isNew
                                              ? "Staged Assignment"
                                              : "Assigned Permission"}
                                    </span>
                                  </div>
                                </div>

                                {isMarkedForRemoval && !isEditMode && (
                                  <button
                                    onClick={() => handleUndoRemove(p.id)}
                                    className="bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50 transition-all duration-200 p-2 rounded-lg flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                                    title="Restore permission"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </button>
                                )}

                                {!isEditMode && !isMarkedForRemoval && (
                                  <div className="flex items-center gap-1.5">
                                    {isPendingConfirm ? (
                                      <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
                                        <TooltipProvider>
                                          <Tooltip delayDuration={200}>
                                            <TooltipTrigger asChild>
                                              <button
                                                onClick={() =>
                                                  setPendingRemoveConfirm(null)
                                                }
                                                className="h-8 w-8 bg-white text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
                                              >
                                                <X className="w-4 h-4" />
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent
                                              side="top"
                                              className="bg-white text-xs border border-slate-200 shadow-xl px-3 py-1.5 rounded-lg"
                                            >
                                              <p className="text-slate-600">
                                                Cancel
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                          <Tooltip delayDuration={200}>
                                            <TooltipTrigger asChild>
                                              <button
                                                onClick={() => {
                                                  handleMarkForRemoval(p);
                                                  setPendingRemoveConfirm(null);
                                                }}
                                                className="h-8 w-8 bg-white text-slate-400 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
                                              >
                                                <Check className="w-4 h-4" />
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent
                                              side="top"
                                              className="bg-white text-xs border border-slate-200 shadow-xl px-3 py-1.5 rounded-lg"
                                            >
                                              <p className="text-slate-600">
                                                Confirm removal
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    ) : (
                                      <TooltipProvider>
                                        <Tooltip delayDuration={200}>
                                          <TooltipTrigger asChild>
                                            <button
                                              onClick={() =>
                                                setPendingRemoveConfirm(p.id)
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
                                            className="bg-white text-xs border border-slate-200 shadow-xl px-3 py-1.5 rounded-lg"
                                          >
                                            <p className="text-slate-600">
                                              {isNew
                                                ? "Remove staged permission"
                                                : "Mark for removal"}
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
                            No permissions assigned to this role.
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Add permissions to define what this role can access.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-1.5 mb-4 border-b border-slate-100">
                      <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 font-lexend mb-2">
                        <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                        Icon Selection
                      </h3>
                    </div>
                    <div className="space-y-5">
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-5 gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                          {AVAILABLE_ICONS.map((item) => {
                            const IconComp = item.icon;
                            const isActive = iconName === item.name;
                            return (
                              <button
                                key={item.name}
                                onClick={() => setIconName(item.name)}
                                aria-label={item.label}
                                className={cn(
                                  "relative flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 cursor-pointer focus-visible:outline-none border-2",
                                  isActive
                                    ? "bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-200 scale-105 ring-2 ring-blue-300 ring-offset-1"
                                    : "bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 hover:scale-105 shadow-sm active:scale-95",
                                )}
                              >
                                <IconComp
                                  size={18}
                                  className="transition-transform duration-200"
                                />
                                {isActive && (
                                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-200">
                                    <Check size={9} className="text-blue-600" />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </TabsContent>

              <TabsContent
                value="users"
                className="px-6 py-6 space-y-4 outline-none animate-in fade-in slide-in-from-left-4 duration-300 m-0 focus-visible:outline-none"
              >
                <div>
                  {totalRoleUsers.length > 0 && (
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        placeholder="Search personnel..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-inter focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                      />
                    </div>
                  )}
                  <div className="space-y-3 pb-4">
                    {roleUsers.length > 0 ? (
                      roleUsers.map((user) => (
                        <div
                          key={user.empID}
                          className={cn(
                            "flex flex-col border border-slate-100 rounded-xl p-4 transition-all bg-white relative overflow-hidden",
                            isProcessingUser === user.empID
                              ? "opacity-50 grayscale"
                              : "hover:shadow-lg hover:shadow-slate-100 hover:border-slate-200 shadow-sm",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner">
                                <UserRound size={20} />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <p className="text-xs font-bold text-slate-800 font-lexend">
                                    {user.firstname} {user.lastname}
                                  </p>
                                  {user.empID === currentUser?.empID && (
                                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[8px] font-black uppercase ml-1.5 ring-1 ring-blue-200">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-medium tracking-tight font-inter">
                                  <span>ID: {user.empID}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  <span>{user.position || "Staff"}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                onClick={() =>
                                  setDemoteSelectingFor(
                                    demoteSelectingFor === user.empID
                                      ? null
                                      : user.empID!,
                                  )
                                }
                                className={cn(
                                  "h-7 px-2.5 text-[10px] font-bold transition-all focus-visible:ring-0 focus-visible:outline-none shadow-sm",
                                  demoteSelectingFor === user.empID
                                    ? "bg-amber-600 text-white"
                                    : "bg-amber-50 text-amber-600 hover:bg-amber-100",
                                )}
                              >
                                <ArrowDownToLine size={12} className="mr-1.5" />{" "}
                                Demote
                              </Button>
                              <Button
                                disabled={user.empID === currentUser?.empID}
                                onClick={() => handleUserAction(user, "kick")}
                                className="h-7 px-2.5 text-[10px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 focus-visible:ring-0 focus-visible:outline-none shadow-sm border border-rose-100 disabled:opacity-30 disabled:grayscale"
                              >
                                <UserMinus size={12} className="mr-1.5" /> Kick
                              </Button>
                            </div>
                          </div>
                          {demoteSelectingFor === user.empID && (
                            <div className="mt-4 p-3 bg-amber-50/50 border border-amber-100 rounded-lg animate-in slide-in-from-top-2 duration-300 shadow-inner">
                              <p className="font-lexend text-[10px] font-bold text-amber-800 mb-2">
                                Reassign to Role
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {allRoles
                                  .filter(
                                    (r) =>
                                      normalizeRoleName(r.name) !==
                                      normalizeRoleName(role?.name),
                                  )
                                  .map((target) => (
                                    <button
                                      key={target.id}
                                      onClick={() =>
                                        handleUserAction(
                                          user,
                                          "demote",
                                          Number(target.id),
                                        )
                                      }
                                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-[10px] font-bold text-slate-700 hover:border-amber-600 hover:text-amber-700 transition-all shadow-sm focus-visible:border-amber-600 focus-visible:outline-none"
                                    >
                                      <span className="truncate">
                                        {target.name}
                                      </span>
                                      <ChevronRight size={10} />
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center opacity-40">
                        <UsersRound size={48} className="mx-auto mb-4" />
                        <p className="font-lexend text-xs font-bold italic">
                          No Personnel Assigned
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="delete"
                className="px-6 py-6 space-y-6 outline-none animate-in fade-in slide-in-from-left-4 duration-300 m-0 focus-visible:outline-none"
              >
                <div className="pt-2">
                  <section className="bg-rose-50/50 border border-rose-100/50 rounded-xl p-5 transition-all shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
                        <Trash2 size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-lexend text-sm font-bold text-rose-900 mb-1">
                          Permanently Delete Role
                        </h5>
                        <p className="font-inter text-[11px] text-rose-700/70 leading-relaxed overflow-hidden wrap-break-word">
                          You are about to erase the{" "}
                          <span className="font-bold">"{role?.name}"</span>{" "}
                          role. This will leave{" "}
                          <span className="font-bold underline text-rose-800">
                            {roleUsers.length} users
                          </span>{" "}
                          without a primary security mapping.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-rose-100/50">
                      <div className="flex items-center gap-2 bg-rose-100/50 p-3 rounded-lg border border-rose-100">
                        <ShieldAlert
                          size={16}
                          className="text-rose-600 shrink-0"
                        />
                        <p className="text-[10px] font-semibold text-rose-800 leading-tight">
                          This action is irreversible. Ensure all users are
                          migrated before deletion.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button
                        onClick={handleDeleteRole}
                        disabled={isSubmitting}
                        className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 rounded-lg focus-visible:ring-0 focus-visible:outline-none border-b-4 border-rose-800"
                      >
                        {isSubmitting
                          ? "Wiping Data..."
                          : "Confirm Role Deletion"}
                      </Button>
                    </div>
                  </section>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3 sm:justify-end">
            <div className="flex-1">
              {isOpen && hasChanges && activeTab === "edit" && (
                <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 w-fit">
                  <RotateCcw className="w-3 h-3" />
                  Unsaved Changes
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              onClick={handleRequestClose}
              className="h-10 px-6 rounded-lg font-bold text-slate-500 border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-300 text-xs cursor-pointer active:scale-95 flex items-center gap-2 focus-visible:ring-0 focus-visible:outline-none"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            {(activeTab === "edit" || activeTab === "users") && (
              <Button
                onClick={() => setShowSaveConfirm(true)}
                disabled={isSubmitting || !name.trim() || !hasChanges}
                className="px-8 bg-[#0F172A] hover:bg-emerald-600 text-white font-bold h-10 text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-0 focus-visible:outline-none shadow-lg shadow-slate-200"
              >
                {isSubmitting ? (
                  "Syncing..."
                ) : (
                  <>
                    <SaveAll className="w-4 h-4" />
                    Update Role
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => {
          setShowSaveConfirm(false);
          handleSubmitEdit();
        }}
        title="Confirm Updates"
        description="Are you sure you want to sync these changes to the system? This action will update all permission assignments for this role."
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
    </>
  );
}
