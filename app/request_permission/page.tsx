"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldQuestion,
  Package,
  FileText,
} from "lucide-react";

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
    tabs: ["channels", "logs", "payment", "receipt", "reports", "voided"],
  },
  {
    id: "barangay",
    label: "Barangay Performance",
    tabs: ["barangay-ranking", "barangay-reports", "collection-performance", "deliquency-hotspots", "map", "tax_payer-summary"],
  },
  {
    id: "delinquencies",
    label: "Delinquencies & Notices",
    tabs: ["aging_of_delinquencies", "delinquency_reports", "delinquent_accounts", "notice_distribution", "notice_generation", "reminder_alerts"],
  },
  {
    id: "document",
    label: "Document Tracking",
    tabs: ["document_alerts", "document_register", "incoming_documents", "pending_documents", "routing_and_endorsement", "status_tracking"],
  },
  {
    id: "user",
    label: "User & Role Management",
    tabs: ["activity", "create", "manage", "profile", "settings", "view"],
  },
];

type RequestItem = {
  id: string;
  modules: { module: string; tabs: string[] }[];
  justification: string;
  status: string;
  review_note: string | null;
  created_at: string;
  updated_at: string;
};

function formatTabName(tab: string) {
  return tab
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Pending Review" },
  approved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "Approved" },
  denied: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50 border-rose-200", label: "Denied" },
};

export default function RequestPermissionPage() {
  const { user, permissions } = useAuth();

  // Selection state
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedTabs, setSelectedTabs] = useState<Record<string, Set<string>>>({});
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History state
  const [myRequests, setMyRequests] = useState<RequestItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Check which tabs user already has access to
  const hasAccess = (moduleId: string, tab: string) => {
    if (Number(user?.role_id) === 1) return true;
    const pm = permissions[moduleId];
    if (!pm) return false;
    if (!pm.tabs || Object.keys(pm.tabs).length === 0) return pm.can_view;
    return pm.tabs[tab]?.can_view;
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/requests/list");
      if (res.ok) {
        const data = await res.json();
        setMyRequests(data.requests || []);
      }
    } catch {
      console.error("Failed to fetch request history.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const toggleTab = (moduleId: string, tab: string) => {
    setSelectedTabs((prev) => {
      const moduleTabs = new Set(prev[moduleId] || []);
      if (moduleTabs.has(tab)) moduleTabs.delete(tab);
      else moduleTabs.add(tab);

      const next = { ...prev };
      if (moduleTabs.size === 0) delete next[moduleId];
      else next[moduleId] = moduleTabs;
      return next;
    });
  };

  const toggleAllModuleTabs = (moduleId: string, tabs: string[]) => {
    setSelectedTabs((prev) => {
      const moduleTabs = new Set(prev[moduleId] || []);
      const lockedTabs = tabs.filter((t) => !hasAccess(moduleId, t));
      const allSelected = lockedTabs.every((t) => moduleTabs.has(t));

      const next = { ...prev };
      if (allSelected) {
        delete next[moduleId];
      } else {
        next[moduleId] = new Set(lockedTabs);
      }
      return next;
    });
  };

  const totalSelected = Object.values(selectedTabs).reduce(
    (acc, s) => acc + s.size,
    0
  );

  const handleSubmit = async () => {
    if (totalSelected === 0) {
      toast.error("Please select at least one sub-module.");
      return;
    }
    if (!justification.trim()) {
      toast.error("Please provide a justification for your request.");
      return;
    }

    setIsSubmitting(true);

    const modules = Object.entries(selectedTabs).map(([moduleId, tabs]) => ({
      module: moduleId,
      tabs: Array.from(tabs),
    }));

    try {
      const res = await fetch("/api/requests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules, justification: justification.trim() }),
      });

      if (res.ok) {
        toast.success("Permission request submitted successfully!");
        setSelectedTabs({});
        setJustification("");
        setExpandedModules(new Set());
        fetchMyRequests();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit request.");
      }
    } catch {
      toast.error("An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex">
      <main className="flex-1">
        <header className="mb-8">
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d] flex items-center gap-3">
            <ShieldQuestion className="text-blue-600" size={28} />
            Request Permissions
          </h1>
          <p className="font-inter text-xs text-slate-400 mt-1">
            Select the modules and sub-modules you need access to and submit a
            request for review.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Module Checklist */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-lexend text-sm font-bold text-slate-700 flex items-center gap-2">
                <Package size={16} className="text-slate-500" />
                System Modules
              </h2>
              {totalSelected > 0 && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {totalSelected} sub-module{totalSelected !== 1 ? "s" : ""} selected
                </span>
              )}
            </div>

            {MODULE_OPTIONS.map((mod) => {
              const isExpanded = expandedModules.has(mod.id);
              const moduleSel = selectedTabs[mod.id] || new Set();
              const lockedTabs = mod.tabs.filter((t) => !hasAccess(mod.id, t));
              const allLocked = lockedTabs.length === mod.tabs.length;
              const noneLocked = lockedTabs.length === 0;

              return (
                <div
                  key={mod.id}
                  className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Module Header */}
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-400" />
                      )}
                      <span className="font-inter text-sm font-semibold text-slate-700">
                        {mod.label}
                      </span>
                      {noneLocked && (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Full Access
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {moduleSel.size > 0 && (
                        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {moduleSel.size} selected
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {mod.tabs.length} sub-modules
                      </span>
                    </div>
                  </button>

                  {/* Sub-module Tabs */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 animate-in fade-in slide-in-from-top-1 duration-200">
                      {!noneLocked && (
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                            Restricted Sub-Modules
                          </span>
                          {lockedTabs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => toggleAllModuleTabs(mod.id, mod.tabs)}
                              className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {lockedTabs.every((t) => moduleSel.has(t))
                                ? "Deselect All"
                                : "Select All"}
                            </button>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {mod.tabs.map((tab) => {
                          const accessible = hasAccess(mod.id, tab);
                          const isSelected = moduleSel.has(tab);

                          return (
                            <button
                              key={tab}
                              type="button"
                              disabled={accessible}
                              onClick={() => toggleTab(mod.id, tab)}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-inter transition-all text-left",
                                accessible
                                  ? "bg-emerald-50/50 border-emerald-200 text-emerald-600 cursor-default opacity-60"
                                  : isSelected
                                    ? "bg-blue-50 border-blue-300 text-blue-700 ring-1 ring-blue-100 shadow-sm cursor-pointer"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
                              )}
                            >
                              {/* Checkbox */}
                              <div
                                className={cn(
                                  "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                                  accessible
                                    ? "bg-emerald-500 border-emerald-600"
                                    : isSelected
                                      ? "bg-blue-500 border-blue-600"
                                      : "bg-white border-slate-300"
                                )}
                              >
                                {(accessible || isSelected) && (
                                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                              <span className="font-medium truncate">{formatTabName(tab)}</span>
                              {accessible && (
                                <span className="ml-auto text-[9px] font-bold text-emerald-500 shrink-0">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Request Cart + History */}
          <div className="space-y-6">
            {/* Submit Card */}
            <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm sticky top-6">
              <h3 className="font-lexend text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Send size={14} className="text-blue-500" />
                Submit Request
              </h3>

              {/* Selected Summary */}
              {totalSelected > 0 ? (
                <div className="space-y-2 mb-4">
                  {Object.entries(selectedTabs).map(([moduleId, tabs]) => {
                    const mod = MODULE_OPTIONS.find((m) => m.id === moduleId);
                    return (
                      <div key={moduleId} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <p className="text-[11px] font-bold text-slate-600">{mod?.label || moduleId}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {Array.from(tabs).map((tab) => (
                            <span
                              key={tab}
                              className="text-[9px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200"
                            >
                              {formatTabName(tab)}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 border border-dashed border-slate-200 mb-4 text-center">
                  <p className="text-xs text-slate-400 font-inter">
                    Select modules from the left to build your request.
                  </p>
                </div>
              )}

              {/* Justification */}
              <div className="mb-4">
                <label className="font-inter text-[11px] font-semibold text-slate-600 mb-1.5 block">
                  Justification <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Briefly explain why you need access to these modules..."
                  className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-white p-3 text-xs font-inter focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none shadow-sm"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || totalSelected === 0}
                className={cn(
                  "w-full py-3 rounded-xl text-xs font-bold font-inter transition-all duration-300 flex items-center justify-center gap-2",
                  totalSelected > 0
                    ? "bg-[#0F172A] text-white hover:bg-slate-800 cursor-pointer shadow-lg shadow-slate-200 active:scale-[0.98]"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                )}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send size={14} />
                    Submit Request ({totalSelected} sub-module{totalSelected !== 1 ? "s" : ""})
                  </>
                )}
              </button>
            </div>

            {/* Request History */}
            <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm">
              <h3 className="font-lexend text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <FileText size={14} className="text-slate-500" />
                My Requests
              </h3>

              {isLoadingHistory ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 font-inter">Loading...</p>
                </div>
              ) : myRequests.length === 0 ? (
                <div className="bg-slate-50 rounded-lg p-4 border border-dashed border-slate-200 text-center">
                  <p className="text-xs text-slate-400 font-inter">
                    No requests yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {myRequests.map((req) => {
                    const config = statusConfig[req.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    return (
                      <div
                        key={req.id}
                        className={cn(
                          "rounded-lg p-3 border transition-colors",
                          config.bg
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon size={14} className={config.color} />
                            <span className={cn("text-[11px] font-bold", config.color)}>
                              {config.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(req.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {req.modules.map((m: { module: string; tabs: string[] }) => (
                            <span
                              key={m.module}
                              className="text-[9px] font-medium text-slate-600 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200"
                            >
                              {MODULE_OPTIONS.find((o) => o.id === m.module)?.label || m.module}{" "}
                              ({m.tabs.length})
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-500 italic line-clamp-2">
                          &ldquo;{req.justification}&rdquo;
                        </p>
                        {req.review_note && (
                          <p className="text-[10px] text-slate-600 mt-1 font-medium">
                            Admin: {req.review_note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
