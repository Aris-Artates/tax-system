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
  const pickerRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setName("");
      setIconName("KeyRound");
      setAssignedPermissions([]);
      setPickerOpen(false);
      setPermissionSearch("");
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

  const handleAssignPermission = (permission: Permission) => {
    setAssignedPermissions((prev) =>
      [...prev, permission].sort((a, b) => a.name.localeCompare(b.name))
    );
    setPickerOpen(false);
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
        className="sm:max-w-[580px] p-0 overflow-hidden rounded-xl border-none shadow-2xl h-[85vh] flex flex-col bg-white"
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

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar bg-white">
          <section>
            <div className="flex items-center gap-1.5 mb-4 border-b border-slate-100">
              <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 font-lexend mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                Role Identity
              </h3>
            </div>
            <div className="space-y-5">
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
              <div className="space-y-2.5">
                <label className="font-inter text-[11px] font-semibold text-slate-600 mb-1.5 block">
                  Icon Selection
                </label>
                <div className="grid grid-cols-6 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto custom-scrollbar">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isActive = iconName === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setIconName(item.name)}
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90",
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-100 ring-offset-2"
                            : "bg-white text-slate-500 border border-slate-100 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/10 shadow-sm"
                        )}
                      >
                        <IconComp size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100">
              <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 font-lexend mb-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Access Permissions
              </h3>
              <div ref={pickerRef} className="relative mb-2">
                <Button
                  onClick={() => setPickerOpen(!pickerOpen)}
                  className="h-7 px-3 text-[10px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-none rounded-full flex items-center gap-1.5 transition-all duration-200 active:scale-95"
                >
                  <Plus className="w-3 h-3" /> Add Permission
                </Button>
                {pickerOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 ring-4 ring-slate-100">
                    <div className="p-3 bg-slate-100/50 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          autoFocus
                          type="text"
                          value={permissionSearch}
                          onChange={(e) => setPermissionSearch(e.target.value)}
                          placeholder="Search Permissions..."
                          className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
                      {availablePermissions.length > 0 ? (
                        availablePermissions.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleAssignPermission(p)}
                            className="w-full text-left px-4 py-2.5 text-xs text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                          >
                            <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center text-[10px] uppercase font-bold text-slate-400">
                              {p.name.substring(0, 2)}
                            </div>
                            {p.name}
                          </button>
                        ))
                      ) : (
                        <p className="p-4 text-[10px] text-slate-400 italic text-center">No available permissions</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {assignedPermissions.length > 0 ? (
                assignedPermissions.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-white transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 flex items-center justify-center font-bold text-[10px]">
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-700">{p.name}</span>
                        <p className="text-[10px] font-medium text-emerald-600">Staged Access</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePermission(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <ShieldAlert className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="font-lexend text-[10px] font-bold text-slate-400">No Permissions Assigned</p>
                </div>
              )}
            </div>
          </section>
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
