import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  UsersRound, 
  X, 
  UserMinus, 
  ArrowDownToLine, 
  UserRound,
  ShieldAlert,
  Search,
  Check,
  ChevronRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  roles?: {
    name?: string;
  } | null;
}

interface ListedRole {
  id: string | number;
  name: string;
  icon?: string;
}

interface RoleUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: ListedRole | null;
  users: ApiUser[];
  allRoles: ListedRole[];
  onSuccess: () => void;
}

export function RoleUsersModal({
  isOpen,
  onClose,
  role,
  users: allUsers,
  allRoles,
  onSuccess,
}: RoleUsersModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [demoteSelectingFor, setDemoteSelectingFor] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ empID: string } | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => data.user && setCurrentUser(data.user))
      .catch(() => null);
  }, []);

  const normalizeRoleName = (name?: string) => (name ?? "").trim().toLowerCase();

  const roleUsers = useMemo(() => {
    if (!role) return [];
    const target = normalizeRoleName(role.name);
    return allUsers.filter(u => 
      normalizeRoleName(u.roles?.name ?? u.role ?? "") === target
    ).filter(u => {
      const fullSearch = `${u.firstname} ${u.lastname} ${u.empID}`.toLowerCase();
      return fullSearch.includes(searchTerm.toLowerCase());
    });
  }, [role, allUsers, searchTerm]);

  const handleAction = async (user: ApiUser, action: 'kick' | 'demote', newRoleId?: number) => {
    if (!user.empID) return;
    
    setIsProcessing(user.empID);
    
    try {
      const listResp = await fetch("/api/user/list", { cache: "no-store" });
      const listData = await listResp.json();
      const decodedUsers = listData._data ? JSON.parse(atob(listData._data)) : (listData.users ?? []);
      const fullUser = (decodedUsers as any[]).find((u: any) => u.empID === user.empID);

      if (!fullUser) throw new Error("User record not found for update.");

      const payload = {
        originalEmpID: fullUser.empID,
        empID: fullUser.empID,
        username: fullUser.username,
        firstname: fullUser.firstname,
        middlename: fullUser.middlename || "",
        lastname: fullUser.lastname,
        suffix: fullUser.suffix || "",
        birthdate: fullUser.birthdate || "1990-01-01", // Fallback for missing validation
        age: String(fullUser.age || "30"),
        sex: !!fullUser.sex,
        email: fullUser.email,
        phone: fullUser.phone || "0000000000", // Fallback
        department: fullUser.department || "General",
        position: fullUser.position || "Staff",
        image_path: fullUser.image_path,
        status: action === 'kick' ? false : (fullUser.status ?? true),
        role_id: action === 'demote' ? newRoleId : fullUser.role_id,
      };

      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(action === 'kick' ? "User kicked and deactivated" : "User reassigned successfully");
        onSuccess();
        if (action === 'demote') setDemoteSelectingFor(null);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Update failed");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[580px] p-0 overflow-hidden rounded-xl border-none shadow-2xl h-[80vh] flex flex-col">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="font-lexend text-xl font-bold text-slate-800 flex items-center gap-2.5">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                <UsersRound className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span>Manage Assignments</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Role: {role?.name}</span>
              </div>
            </DialogTitle>
            <DialogDescription className="font-inter text-[11px] text-slate-500 mt-2">
              Review and manage users assigned to this role. You can reassign (demote) or deactivate (kick) users as needed.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 bg-white border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name or Employee ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-inter focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar bg-white">
          {roleUsers.length > 0 ? (
            <div className="space-y-3">
              {roleUsers.map((user) => (
                <div 
                  key={user.empID} 
                  className={cn(
                    "group relative flex flex-col border border-slate-100 rounded-xl p-3 transition-all duration-200",
                    isProcessing === user.empID ? "bg-slate-50 opacity-60" : "bg-white hover:border-blue-100 hover:shadow-md hover:shadow-blue-50/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <UserRound size={20} />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="text-xs font-bold text-slate-800">{user.firstname} {user.lastname}</p>
                          {user.empID === currentUser?.empID && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[8px] font-black uppercase ml-1.5 ring-1 ring-blue-200">You</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-mono">ID: {user.empID}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[10px] text-slate-500 uppercase font-medium">{user.department || "General"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => setDemoteSelectingFor(demoteSelectingFor === user.empID ? null : user.empID!)}
                              disabled={!!isProcessing}
                              className={cn(
                                "h-8 px-2.5 rounded-lg border border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all",
                                demoteSelectingFor === user.empID && "bg-amber-600 text-white border-amber-700 shadow-inner"
                              )}
                            >
                              <ArrowDownToLine size={14} className="mr-1.5" />
                              <span className="text-[10px] font-bold">Demote</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Reassign to another role</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleAction(user, 'kick')}
                              disabled={!!isProcessing}
                              className="h-8 px-2.5 rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                            >
                              <UserMinus size={14} className="mr-1.5" />
                              <span className="text-[10px] font-bold">Kick</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Deactivate and remove from role</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Demote Target Picker */}
                  {demoteSelectingFor === user.empID && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-[10px] font-bold text-slate-600 uppercase mb-2 tracking-tight">Select Target Role</p>
                      <div className="grid grid-cols-2 gap-2">
                        {allRoles.filter(r => normalizeRoleName(r.name) !== normalizeRoleName(role?.name)).map(target => (
                          <button
                            key={target.id}
                            onClick={() => handleAction(user, 'demote', Number(target.id))}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all group/btn shadow-sm"
                          >
                            <span className="truncate">{target.name}</span>
                            <ChevronRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Info className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-sm font-bold text-slate-400">No users found</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Adjust your filter or check if any users are assigned to this role.</p>
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-9 px-6 rounded-lg font-bold text-slate-500 border border-slate-200 bg-white hover:bg-slate-100 transition-all text-[11px]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
