"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ChevronDown,
  PercentCircle,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
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

        <Button
          type="button"
          disabled={isSaving || isLoading}
          onClick={() => fetchRules()}
          className="font-inter h-9 cursor-pointer rounded bg-[#0F172A] px-4 text-xs font-medium text-[#8A9098] hover:bg-slate-800"
        >
          <Save className="h-4 w-4" />
          Refresh Configuration
        </Button>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <PercentCircle className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            Active Discount Rules
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            {isLoading ? "..." : activeDiscounts}
          </p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <ShieldAlert className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            Active Penalty Rules
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            {isLoading ? "..." : activePenalties}
          </p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <CalendarClock className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            Draft Rules Pending Review
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            {isLoading ? "..." : draftRules}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="font-inter text-sm font-semibold text-[#848794]">
            Rule Setup
          </h2>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Set the discount or penalty rule details.
          </p>

          <div className="mt-5 space-y-4">
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
                <SelectTrigger className="cursor-pointer font-inter mt-1 h-10 w-full rounded-md border border-gray-200 px-3 text-xs text-slate-700 flex items-center justify-between">
                  <SelectValue placeholder="Select rule type" />
                  <SelectIcon>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </SelectIcon>
                </SelectTrigger>

                <SelectContent className="z-50 min-w-(--radix-select-trigger-width) rounded-md border border-gray-200 bg-white shadow-sm">
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
                className="font-inter mt-1 h-10 border-gray-200 text-xs text-slate-700 placeholder:text-slate-400"
              />
            </div>

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
                placeholder="e.g. 10% or 2% / month"
                className="font-inter mt-1 h-10 border-gray-200 text-xs text-slate-700 placeholder:text-slate-400"
              />
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
                placeholder="e.g. Jan 1 - Jan 31"
                className="font-inter mt-1 h-10 border-gray-200 text-xs text-slate-700 placeholder:text-slate-400"
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
                placeholder="e.g. Annual RPT Due"
                className="font-inter mt-1 h-10 border-gray-200 text-xs text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddRule}
              disabled={isSaving}
              className="font-inter h-9 w-full cursor-pointer text-xs font-medium text-slate-600"
            >
              <Plus className="h-4 w-4" />
              {isSaving ? "Adding..." : "Add Rule"}
            </Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
              Current Rules
            </h2>
          </div>

          <TableContainer>
            <Table className="w-full font-inter text-xs">
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                    Type
                  </TableHead>
                  <TableHead className="px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                    Rule Name
                  </TableHead>
                  <TableHead className="px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                    Basis
                  </TableHead>
                  <TableHead className="px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                    Rate
                  </TableHead>
                  <TableHead className="px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                    Applicable Period
                  </TableHead>
                  <TableHead
                    align="center"
                    className="px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]"
                  >
                    Status
                  </TableHead>
                  <TableHead className="px-4 py-3"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                      Loading rules...
                    </TableCell>
                  </TableRow>
                ) : rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                      No rules configured yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow
                      key={rule.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            rule.type === "Discount"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {rule.type}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-[#595a5d]">
                        {rule.ruleName}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-600">
                        {rule.basis}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-600">
                        {rule.rate}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-500">
                        {rule.period}
                      </TableCell>
                      <TableCell align="center" className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(rule)}
                          className={`cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                            rule.status === "Active"
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          {rule.status}
                        </button>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <button
                          onClick={() => rule.id && handleDeleteRule(rule.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </section>
      </div>
    </div>
  );
}
