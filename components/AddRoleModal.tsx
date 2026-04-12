import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  UserRound,
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
  CirclePlus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ValidatedInput } from "@/components/ui/ValidatedInput";

interface Permission {
  id: number;
  name: string;
}

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allPermissions: Permission[];
}

const AVAILABLE_ICONS = [
  { name: "KeyRound", icon: KeyRound },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Users", icon: UsersRound },
  { name: "Shield", icon: Shield },
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

export function AddRoleModal({
  isOpen,
  onClose,
  onSuccess,
  allPermissions,
}: AddRoleModalProps) {
  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("KeyRound");
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([]);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState<Set<number>>(new Set());
  const [pickerSelectedIds, setPickerSelectedIds] = useState<Set<number>>(new Set());
  const pickerRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setName("");
      setIconName("KeyRound");
      setAssignedPermissions([]);
      setPickerOpen(false);
      setPermissionSearch("");
      setIsEditMode(false);
      setSelectedForBulk(new Set());
      setPickerSelectedIds(new Set());
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePickerSelection = (permId: number) => {
    const next = new Set(pickerSelectedIds);
    if (next.has(permId)) next.delete(permId);
    else next.add(permId);
    setPickerSelectedIds(next);
  };

  const handleBulkAddFromPicker = () => {
    if (pickerSelectedIds.size === 0) return;
    const toAdd = allPermissions.filter(
      (p) =>
        pickerSelectedIds.has(p.id) &&
        !assignedPermissions.some((ap) => ap.id === p.id)
    );
    if (toAdd.length > 0) {
      setAssignedPermissions((prev) =>
        [...prev, ...toAdd].sort((a, b) => a.name.localeCompare(b.name))
      );
    }
    toast.info(`${pickerSelectedIds.size} permission(s) added to list.`);
    setPickerSelectedIds(new Set());
    setPickerOpen(false);
    setPermissionSearch("");
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
        setAssignedPermissions((prev) =>
          prev.filter((p) => !selectedForBulk.has(p.id))
        );
        toast.warning(`${selectedForBulk.size} permission(s) removed.`);
      }
      setSelectedForBulk(new Set());
    }
    setIsEditMode((prev) => !prev);
  };

  const handleRemovePermission = (id: number) => {
    setAssignedPermissions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async () => {
    const roleName = name.trim();
    if (!roleName) return;

    setIsSubmitting(true);
    const payload = {
      name: roleName,
      icon: iconName,
      permission_ids: assignedPermissions.map((p) => p.id),
    };

    try {
      const response = await fetch("/api/roles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("New role created successfully");
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to create role");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePermissions = allPermissions
    .filter((p) => !assignedPermissions.some((ap) => ap.id === p.id))
    .filter((p) => p.name.toLowerCase().includes(permissionSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-[580px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl h-[80vh] flex flex-col bg-white focus:outline-none focus:ring-0"
      >
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="font-lexend text-xl font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              Create New Role
            </DialogTitle>
            <DialogDescription className="font-inter text-[11px] text-slate-500 mt-1">
              Define identity, icon, and system-level permissions for a new administrative role.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="px-6 py-6 space-y-8">
            {/* Section 1: Role Identity */}
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
                  onChange={(n) => setName(n.replace(/[^a-zA-Z0-9 .\_\-']/g, ""))}
                  placeholder="e.g. Finance Admin"
                  maxLength={50}
                  required
                  validator="permission-&-role-name"
                  type="text"
                />
              </div>
            </section>

            {/* Section 2: Access Permissions */}
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
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200"
                          )}
                        >
                          {isEditMode ? <Check className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                          {isEditMode ? "Finish Delete" : "Bulk Delete"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-white text-xs border border-slate-200 shadow-xl px-4 rounded-lg">
                        <p className="text-slate-600 leading-relaxed text-[10px]">{isEditMode ? "Apply removals" : "Select multiple to remove"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div ref={pickerRef} className="relative">
                    <TooltipProvider>
                      <Tooltip delayDuration={250}>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => !isEditMode && setPickerOpen(!pickerOpen)}
                            disabled={isEditMode}
                            className={cn(
                              "h-7 px-3 text-[10px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-none rounded-full flex items-center gap-1.5 transition-all duration-200 active:scale-95 focus-visible:outline-none",
                              isEditMode ? "opacity-50 cursor-not-allowed border-slate-200 text-slate-400 bg-slate-50" : "cursor-pointer"
                            )}
                          >
                            <Plus className="w-3 h-3" /> Add Permission
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-white text-xs border border-slate-200 shadow-xl px-4 rounded-lg">
                          <p className="text-slate-600 leading-relaxed text-[10px]">Add permissions to the staging list</p>
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
                              onChange={(e) => setPermissionSearch(e.target.value)}
                              placeholder="Search Permissions..."
                              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all font-inter"
                            />
                          </div>
                        </div>
                        <div className="max-h-52 overflow-y-auto py-1 custom-scrollbar bg-white">
                          {availablePermissions.length > 0 ? (
                            availablePermissions.map((p) => {
                              const isChecked = pickerSelectedIds.has(p.id);
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => togglePickerSelection(p.id)}
                                  className={cn(
                                    "w-full text-left px-3 py-2.5 text-xs flex items-center gap-3 transition-colors focus-visible:outline-none",
                                    isChecked ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-blue-50/50 hover:text-blue-600"
                                  )}
                                >
                                  <div className={cn(
                                    "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                                    isChecked ? "bg-blue-500 border-blue-600 text-white" : "bg-white border-slate-300"
                                  )}>
                                    {isChecked && <Check size={9} />}
                                  </div>
                                  <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center text-[10px] uppercase font-bold text-slate-400 shrink-0">
                                    {p.name.substring(0, 2)}
                                  </div>
                                  <span className="truncate">{p.name}</span>
                                </button>
                              );
                            })
                          ) : (
                            <p className="p-4 text-[10px] text-slate-400 italic text-center font-inter">No results found</p>
                          )}
                        </div>
                        <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 font-medium font-inter">
                            {pickerSelectedIds.size > 0 ? `${pickerSelectedIds.size} selected` : "Select permissions"}
                          </span>
                          <button
                            onClick={handleBulkAddFromPicker}
                            disabled={pickerSelectedIds.size === 0}
                            className="h-7 px-3 text-[10px] font-bold bg-blue-600 text-white rounded-lg flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 shadow-sm cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            Add {pickerSelectedIds.size > 0 ? pickerSelectedIds.size : ""} Permission{pickerSelectedIds.size !== 1 ? 's' : ''}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {assignedPermissions.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {assignedPermissions.map((p) => {
                      const isSelectedForBulk = selectedForBulk.has(p.id);
                      return (
                        <div
                          key={p.id}
                          className={cn(
                            "flex items-center justify-between p-3.5 transition-all group border-l-4",
                            isSelectedForBulk ? "bg-blue-50/50 border-l-blue-400" : "bg-white border-l-emerald-500 hover:bg-emerald-50/10"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {isEditMode && (
                              <div
                                className={cn(
                                  "w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95",
                                  isSelectedForBulk ? "bg-blue-500 border-blue-600 text-white" : "bg-white border-slate-300 text-transparent hover:border-blue-400"
                                )}
                                onClick={() => toggleBulkSelection(p.id)}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ring-1",
                              isSelectedForBulk ? "bg-blue-100 text-blue-600 ring-blue-200" : "bg-emerald-50 text-emerald-600 ring-emerald-100"
                            )}>
                              {p.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className={cn("text-xs font-bold", isSelectedForBulk ? "text-blue-700" : "text-slate-700")}>
                                  {p.name}
                                </span>
                                <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-200 shadow-sm animate-pulse">
                                  New
                                </span>
                              </div>
                              <span className={cn("text-[10px] font-medium", isSelectedForBulk ? "text-blue-500" : "text-emerald-600")}>
                                {isSelectedForBulk ? "Selected for removal" : "Staged Assignment"}
                              </span>
                            </div>
                          </div>
                          {!isEditMode && (
                            <button
                              onClick={() => handleRemovePermission(p.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-50/50">
                    <ShieldAlert className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="font-lexend text-[10px] font-bold text-slate-400">No Permissions Assigned</p>
                  </div>
                )}
              </div>
            </section>

            {/* Section 3: Icon Selection */}
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
                          className={cn(
                            "relative flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 cursor-pointer focus-visible:outline-none border-2",
                            isActive
                              ? "bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-200 scale-105 ring-2 ring-blue-300 ring-offset-1"
                              : "bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 hover:scale-105 shadow-sm active:scale-95"
                          )}
                        >
                          <IconComp size={18} className="transition-transform duration-200" />
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
        </div>

        <DialogFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
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
            className="px-8 bg-[#0F172A] hover:bg-emerald-600 text-white font-bold h-10 text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              "Building..."
            ) : (
              <>
                <CirclePlus className="w-4 h-4" />
                Create Role
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
