"use client";

import { useState, useEffect } from "react";
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
  Plus,
  KeyRound,
  X,
  CirclePlus,
  LayoutGrid,
  ToggleLeft,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface PermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MODULE_OPTIONS = [
  {
    id: "property",
    label: "Property Registry",
    tabs: ["listing", "mapping", "new-td", "reassessment", "reports", "schedules"],
  },
  {
    id: "taxpayers",
    label: "Taxpayer Records",
    tabs: ["linked-properties", "list", "payments", "records", "register", "view-delinquencies"],
  },
  {
    id: "assessment",
    label: "Assessment & Billing",
    tabs: ["billing-generation", "discounts-penalties", "or-monitoring", "rpt-assessment", "view-schedule"],
  },
  { 
    id: "payments", 
    label: "Payments & OR Monitoring", 
    tabs: ["channels", "logs", "payment", "receipt", "reports", "voided"] 
  },
  { 
    id: "barangay", 
    label: "Barangay Performance", 
    tabs: ["barangay-ranking", "barangay-reports", "collection-performance", "deliquency-hotspots", "map", "tax_payer-summary"] 
  },
  { 
    id: "delinquencies", 
    label: "Delinquencies & Notices", 
    tabs: ["aging_of_delinquencies", "delinquency_reports", "delinquent_accounts", "notice_distribution", "notice_generation", "reminder_alerts"] 
  },
  { 
    id: "document", 
    label: "Document Tracking", 
    tabs: ["document_alerts", "document_register", "incoming_documents", "pending_documents", "routing_and_endorsement", "status_tracking"] 
  },
  {
    id: "user",
    label: "User & Role Management",
    tabs: ["activity", "create", "manage", "profile", "settings", "view"],
  },
];

export function PermissionDialog({
  isOpen,
  onClose,
  onSuccess,
}: PermissionDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // New States
  const [accessModule, setAccessModule] = useState("");
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);
  const [canView, setCanView] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setAccessModule("");
      setSelectedTabs([]);
      setCanView(false);
      setCanEdit(false);
      setCanDelete(false);
    }
  }, [isOpen]);

  const toggleTab = (tab: string) => {
    setSelectedTabs((prev) =>
      prev.includes(tab) ? prev.filter((t) => t !== tab) : [...prev, tab]
    );
  };

  const handleScrubbedChange = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9 .\_\-']/g, "");
    setName(clean);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    const endpoint = "/api/permissions/create";

    const payload = {
      name,
      description,
      access_module: accessModule,
      tab: selectedTabs.join(','),
      can_view: canView,
      can_edit: canEdit,
      can_delete: canDelete,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        toast.success("Permission created.");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create permission.");
      }
    } catch (error) {
      console.error("Failed to create permission", error);
      toast.error("An error occurred while creating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeModuleTabs =
    MODULE_OPTIONS.find((m) => m.id === accessModule)?.tabs || [];

  useEffect(() => {
    // Reset tab selection when module changes
    setSelectedTabs([]);
  }, [accessModule]);

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
  }, [
    isOpen,
    name,
    description,
    accessModule,
    selectedTabs,
    canView,
    canEdit,
    canDelete,
    handleSubmit,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 flex flex-col max-h-[85vh] overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="font-lexend text-xl font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-slate-400" />
              Add Permission
            </DialogTitle>
            <DialogDescription className="font-inter text-[11px] text-slate-500 mt-1">
              Create a new system access level and define its scope.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 px-5 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          <section>
            <div className="flex items-center gap-1.5 mb-3 border-b border-slate-100">
              <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 font-lexend mb-2">
                <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                <p>Basic Information</p>
              </h3>
            </div>
            <div className="space-y-4">
              <ValidatedInput
                label="Permission Name"
                value={name}
                onChange={handleScrubbedChange}
                placeholder="e.g. property.view"
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
            <div className="flex items-center gap-1.5 mb-3 border-b border-slate-100">
              <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 font-lexend mb-2">
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-500" />
                <p>Access Module</p>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MODULE_OPTIONS.map((mod) => (
                <label
                  key={mod.id}
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-all active:scale-[0.98]",
                    accessModule === mod.id
                      ? "bg-blue-50/50 border-blue-300 ring-1 ring-blue-100 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    className="hidden"
                    name="module"
                    value={mod.id}
                    checked={accessModule === mod.id}
                    onChange={() => setAccessModule(mod.id)}
                  />
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all",
                      accessModule === mod.id
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300 bg-white",
                    )}
                  >
                    {accessModule === mod.id && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium font-inter",
                      accessModule === mod.id
                        ? "text-blue-700"
                        : "text-slate-600",
                    )}
                  >
                    {mod.label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {accessModule && (
            <section className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-1.5 mb-3 border-b border-slate-100">
                <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 font-lexend mb-2">
                  <ToggleLeft className="w-3.5 h-3.5 text-rose-400" />
                  <p>Capabilities</p>
                </h3>
              </div>

              <div className="space-y-4 bg-slate-50/80 border border-slate-200 p-4 rounded-xl">
                {activeModuleTabs.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-600 font-inter">
                        Access which sub-pages?
                      </label>
                      {selectedTabs.length > 0 && (
                        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {selectedTabs.length} selected
                        </span>
                      )}
                    </div>
                    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                      {activeModuleTabs.map((tab) => {
                        const isChecked = selectedTabs.includes(tab);
                        return (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => toggleTab(tab)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-xs font-inter transition-colors text-left border-b border-slate-100 last:border-b-0 focus-visible:outline-none",
                              isChecked
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                            )}
                          >
                            <div
                              className={cn(
                                "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                                isChecked
                                  ? "bg-blue-500 border-blue-600"
                                  : "bg-white border-slate-300"
                              )}
                            >
                              {isChecked && (
                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <div className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-[9px] uppercase font-bold text-slate-400 shrink-0">
                              {tab.substring(0, 2)}
                            </div>
                            <span className="truncate font-medium">{tab}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-600 font-inter block">
                    Action Limits
                  </label>
                  <div className="flex gap-4 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={canView}
                        onChange={(e) => setCanView(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        View
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={canEdit}
                        onChange={(e) => setCanEdit(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        Edit
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={canDelete}
                        onChange={(e) => setCanDelete(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        Delete
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        <DialogFooter className="bg-slate-50 border-t border-slate-100 px-5 py-3 gap-2 shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-10 rounded-lg font-bold text-slate-500 border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-300 text-xs cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !name}
            className="flex-[1.5] bg-[#0F172A] hover:bg-emerald-600 text-white font-bold h-10 text-xs shadow-lg shadow-slate-200 transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              "Syncing..."
            ) : (
              <>
                <CirclePlus className="w-4 h-4" />
                Create Permission
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
