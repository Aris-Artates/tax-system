"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  ChevronDown,
  FileText,
  Calculator,
  PercentCircle,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type RuleEntry = {
  id?: string;
  type: "Discount" | "Penalty";
  ruleName: string;
  basis: string;
  rate: string;
  period: string;
  status: "Active" | "Draft";
};

export default function DiscountsPenaltiesPage() {
  const router = useRouter();
  const [rules, setRules] = useState<RuleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<RuleEntry, "id" | "status">>({
    type: "Discount",
    ruleName: "",
    basis: "",
    rate: "",
    period: "",
  });

  // Fetch rules from API
  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/assessment/rules");
      const body = await res.json();

      if (body._data) {
        // Triple atob decoding
        const decoded = JSON.parse(
          atob(atob(atob(body._data)))
        );
        
        // Map table fields to RuleEntry type if needed
        const mappedRules = decoded.rules.map((r: any) => ({
          id: r.id,
          type: r.type,
          ruleName: r.name,
          basis: r.basis,
          rate: r.rate,
          period: r.period,
          status: r.status,
        }));
        setRules(mappedRules);
      } else if (body.error) {
        toast.error(body.error);
      }
    } catch (err) {
      console.error("Failed to fetch rules:", err);
      toast.error("Failed to load rules.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAddRule = async () => {
    if (!formData.ruleName || !formData.rate) {
      toast.error("Please fill in the rule name and rate.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/assessment/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          name: formData.ruleName,
          basis: formData.basis,
          rate: formData.rate,
          period: formData.period,
          status: "Draft", // New rules start as Draft
        }),
      });

      const data = await res.json();
      if (data.rule) {
        toast.success("Rule added successfully.");
        setFormData({
          type: "Discount",
          ruleName: "",
          basis: "",
          rate: "",
          period: "",
        });
        fetchRules();
        setIsDialogOpen(false); // Close dialog on success
      } else {
        toast.error(data.error || "Failed to add rule.");
      }
    } catch (err) {
      toast.error("Connection error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      const res = await fetch(`/api/assessment/rules?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Rule deleted.");
        fetchRules();
      } else {
        toast.error(data.error || "Failed to delete.");
      }
    } catch (err) {
      toast.error("Connection error.");
    }
  };

  const handleToggleStatus = async (rule: RuleEntry) => {
    const newStatus = rule.status === "Active" ? "Draft" : "Active";
    try {
      const res = await fetch("/api/assessment/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rule.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.rule) {
        toast.success(`Rule set to ${newStatus}.`);
        fetchRules();
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  // Stats
  const activeDiscounts = rules.filter(
    (r) => r.type === "Discount" && r.status === "Active"
  ).length;
  const activePenalties = rules.filter(
    (r) => r.type === "Penalty" && r.status === "Active"
  ).length;
  const draftRules = rules.filter((r) => r.status === "Draft").length;

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => router.push("/assessment")}
        className="font-lexend mb-5 cursor-pointer px-0 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessment & Billing
      </Button>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            Discounts & Penalties
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Configure discount incentives and late-payment penalty rules for RPT
            billing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSaving || isLoading}
            onClick={() => fetchRules()}
            className="font-inter inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="font-inter inline-flex items-center gap-2 rounded-lg bg-[#0f172a] px-5 py-2.5 text-xs font-medium text-white hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add New Rule
          </button>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: "Active Discount Rules",
            value: isLoading ? "..." : activeDiscounts,
            textColor: "text-emerald-700",
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-500",
            icon: PercentCircle,
          },
          {
            label: "Active Penalty Rules",
            value: isLoading ? "..." : activePenalties,
            textColor: "text-rose-700",
            bgColor: "bg-rose-50",
            iconColor: "text-rose-500",
            icon: ShieldAlert,
          },
          {
            label: "Draft Rules Pending Review",
            value: isLoading ? "..." : draftRules,
            textColor: "text-amber-700",
            bgColor: "bg-amber-50",
            iconColor: "text-amber-500",
            icon: CalendarClock,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${s.bgColor}`}
              >
                <s.icon className={`h-5 w-5 ${s.iconColor}`} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs font-medium text-slate-500">
                  {s.label}
                </p>
                <div className="flex flex-col">
                  <p
                    className={`font-lexend mt-0.5 text-xl font-bold truncate ${s.textColor}`}
                  >
                    {s.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-lexend text-xl font-bold text-[#595a5d]">
              New Assessment Rule
            </DialogTitle>
            <DialogDescription className="font-inter text-xs text-slate-400">
              Configure a new discount or penalty rule for assessment calculation.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <label className="font-inter text-xs font-medium text-slate-600">
                Rule Type
              </label>

              <Select
                value={formData.type}
                onValueChange={(val: "Discount" | "Penalty") =>
                  setFormData((prev) => ({ ...prev, type: val }))
                }
              >
                <SelectTrigger className="cursor-pointer font-inter mt-1 h-10 w-full rounded-md border border-gray-200 px-3 text-xs text-slate-700 flex items-center justify-between shadow-sm">
                  <SelectValue placeholder="Select rule type" />
                  <SelectIcon>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </SelectIcon>
                </SelectTrigger>

                <SelectContent className="z-50 min-w-(--radix-select-trigger-width) rounded-md border border-gray-200 bg-white shadow-md">
                  <SelectViewport className="p-1">
                    <SelectItem
                      value="Discount"
                      className="font-inter cursor-pointer rounded px-3 py-2 text-xs text-slate-700 outline-none data-highlighted:bg-slate-100"
                    >
                      <SelectItemText>Discount</SelectItemText>
                    </SelectItem>

                    <SelectItem
                      value="Penalty"
                      className="font-inter cursor-pointer rounded px-3 py-2 text-xs text-slate-700 outline-none data-highlighted:bg-slate-100"
                    >
                      <SelectItemText>Penalty</SelectItemText>
                    </SelectItem>
                  </SelectViewport>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-inter text-xs font-medium text-slate-600">
                Rule Name
              </label>
              <Input
                type="text"
                value={formData.ruleName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ruleName: e.target.value }))
                }
                placeholder="e.g. Prompt Payment Incentive"
                className="font-inter mt-1 h-10 border-gray-200 text-xs text-slate-700 placeholder:text-slate-400 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Rate / Formula
                </label>
                <Input
                  type="text"
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, rate: e.target.value }))
                  }
                  placeholder="e.g. 10% or 2%"
                  className="font-inter mt-1 h-10 border-gray-200 text-xs text-slate-700 placeholder:text-slate-400 shadow-sm"
                />
              </div>
              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Basis
                </label>
                <Input
                  type="text"
                  value={formData.basis}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, basis: e.target.value }))
                  }
                  placeholder="e.g. Basic Tax"
                  className="font-inter mt-1 h-10 border-gray-200 text-xs text-slate-700 placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-inter text-xs font-medium text-slate-600">
                Applicable Period
              </label>
              <Input
                type="text"
                value={formData.period}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, period: e.target.value }))
                }
                placeholder="e.g. Jan 1 - Mar 31"
                className="font-inter mt-1 h-10 border-gray-200 text-xs text-slate-700 placeholder:text-slate-400 shadow-sm"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="font-inter rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddRule}
                disabled={isSaving}
                className="font-inter rounded-lg bg-[#0f172a] px-6 py-2 text-xs font-medium text-white hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Adding..." : "Save Rule"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="w-full">
        <section className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-slate-50/50 px-4 py-3">
            <h2 className="font-lexend text-xs font-semibold uppercase tracking-wide text-[#595a5d]">
              Current Configuration Rules
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter text-[#595a5d] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide">
              <thead className="bg-slate-50 text-[10px] border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Rule Name</th>
                  <th className="px-4 py-3">Basis</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Applicable Period</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Loading rules...
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No rules configured yet.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr
                      key={rule.id}
                      className="border-b border-gray-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            rule.type === "Discount"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {rule.type === "Discount" ? (
                            <PercentCircle className="h-3 w-3" />
                          ) : (
                            <ShieldAlert className="h-3 w-3" />
                          )}
                          {rule.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-medium text-[#595a5d]">
                          <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {rule.ruleName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calculator className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {rule.basis}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <TrendingUp className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {rule.rate}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {rule.period}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(rule)}
                          className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                            rule.status === "Active"
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          {rule.status}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => rule.id && handleDeleteRule(rule.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
