"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  User,
  MessageSquare,
  Settings2,
} from "lucide-react";

const MODULE_LABELS: Record<string, string> = {
  property: "Property Registry",
  taxpayers: "Taxpayer Records",
  assessment: "Assessment & Billing",
  payments: "Payments & OR Monitoring",
  barangay: "Barangay Performance",
  delinquencies: "Delinquencies & Notices",
  document: "Document Tracking",
  user: "User & Role Management",
};

type RequestItem = {
  id: string;
  requester_emp_id: string;
  requester_name: string;
  requester_role: string;
  modules: { module: string; tabs: string[] }[];
  justification: string;
  status: string;
  reviewed_by: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Pending" },
  approved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "Approved" },
  denied: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50 border-rose-200", label: "Denied" },
};

function formatTabName(tab: string) {
  return tab.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AccessRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const url = filter ? `/api/requests/list?status=${filter}` : "/api/requests/list";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch {
      toast.error("Failed to load requests.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (requestId: string, action: "configure" | "denied") => {
    if (action === "configure") {
      // Send to permission settings with query param WITHOUT changing status yet
      window.location.href = `/user/settings/permission?review_request=${requestId}`;
      return;
    }

    setProcessingId(requestId);
    try {
      const res = await fetch("/api/requests/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          action,
          review_note: reviewNotes[requestId]?.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast.success(`Request ${action} successfully.`);
        setExpandedId(null);
        fetchRequests();
      } else {
        const data = await res.json();
        toast.error(data.error || `Failed to ${action} request.`);
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setProcessingId(null);
    }
  };

  // Guard: only Super Admin
  if (Number(user?.role_id) !== 1) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400 font-inter text-sm">
          Access restricted to Super Admins only.
        </p>
      </div>
    );
  }

  return (
    <div className="flex">
      <main className="flex-1">
        <header className="mb-8">
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d] flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" size={28} />
            Access Requests
          </h1>
          <p className="font-inter text-xs text-slate-400 mt-1">
            Review and manage permission requests from system users.
          </p>
        </header>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { key: "pending", label: "Pending", count: null },
            { key: "approved", label: "Approved", count: null },
            { key: "denied", label: "Denied", count: null },
            { key: "", label: "All", count: null },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold font-inter transition-all",
                filter === f.key
                  ? "bg-[#0F172A] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Request List */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-sm text-slate-400 font-inter">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
            <ShieldCheck size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-inter">
              No {filter || ""} requests found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const config = statusConfig[req.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const isExpanded = expandedId === req.id;
              const totalTabs = req.modules.reduce((a, m) => a + m.tabs.length, 0);

              return (
                <div
                  key={req.id}
                  className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-400" />
                      )}
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <span className="font-inter text-sm font-semibold text-slate-700">
                            {req.requester_name}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {req.requester_role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-inter">
                          {totalTabs} sub-module{totalTabs !== 1 ? "s" : ""} across{" "}
                          {req.modules.length} module{req.modules.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold", config.bg, config.color)}>
                        <StatusIcon size={12} />
                        {config.label}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(req.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/30 animate-in fade-in slide-in-from-top-1 duration-200">
                      {/* Justification */}
                      <div className="mb-4 p-3 bg-white rounded-lg border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                          Justification
                        </p>
                        <p className="text-xs text-slate-700 font-inter leading-relaxed">
                          &ldquo;{req.justification}&rdquo;
                        </p>
                      </div>

                      {/* Requested Modules */}
                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">
                          Requested Access
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {req.modules.map((m) => (
                            <div
                              key={m.module}
                              className="bg-white rounded-lg border border-slate-100 p-3"
                            >
                              <p className="text-[11px] font-bold text-slate-600 mb-1.5">
                                {MODULE_LABELS[m.module] || m.module}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {m.tabs.map((tab) => (
                                  <span
                                    key={tab}
                                    className="text-[9px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200"
                                  >
                                    {formatTabName(tab)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Review Actions (only for pending) */}
                      {req.status === "pending" && (
                        <div className="space-y-3 pt-3 border-t border-slate-100">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                              <MessageSquare size={10} />
                              Admin Note (optional)
                            </label>
                            <textarea
                              value={reviewNotes[req.id] || ""}
                              onChange={(e) =>
                                setReviewNotes((prev) => ({
                                  ...prev,
                                  [req.id]: e.target.value,
                                }))
                              }
                              placeholder="Add a note for the requester..."
                              className="w-full min-h-[60px] rounded-lg border border-slate-200 bg-white p-3 text-xs font-inter focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReview(req.id, "configure")}
                              disabled={processingId === req.id}
                              className="flex-1 py-2.5 rounded-lg text-xs font-bold font-inter bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <Settings2 size={14} />
                              Configure
                            </button>
                            <button
                              onClick={() => handleReview(req.id, "denied")}
                              disabled={processingId === req.id}
                              className="flex-1 py-2.5 rounded-lg text-xs font-bold font-inter bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <XCircle size={14} />
                              Deny
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Review Result (for non-pending) */}
                      {req.status !== "pending" && req.review_note && (
                        <div className="pt-3 border-t border-slate-100">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Admin Review Note
                          </p>
                          <p className="text-xs text-slate-600 font-inter">
                            {req.review_note}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
