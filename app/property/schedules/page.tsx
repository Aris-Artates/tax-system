"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ListChecks, Pencil, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SmvEntry = {
  id?: string;
  use_type: string;
  unit_value: number;
  effectivity_year: number;
};
type AssessmentLevel = {
  id?: string;
  classification: string;
  actual_use: string;
  mv_range: string;
  assessment_level: number;
};
type DepreciationEntry = {
  id?: string;
  building_type: string;
  rate: string;
  max_depreciation: string;
};

const classificationColors: Record<string, string> = {
  Residential: "bg-blue-50 text-blue-700",
  Commercial: "bg-amber-50 text-amber-700",
  Agricultural: "bg-green-50 text-green-700",
  Industrial: "bg-purple-50 text-purple-700",
  Timberland: "bg-teal-50 text-teal-700",
  Mineral: "bg-stone-100 text-stone-700",
  Special: "bg-orange-50 text-orange-700",
};

export default function AssessmentSchedulesPage() {
  const router = useRouter();
  const [smvData, setSmvData] = useState<SmvEntry[]>([]);
  const [levelData, setLevelData] = useState<AssessmentLevel[]>([]);
  const [depData, setDepData] = useState<DepreciationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [scheduleType, setScheduleType] = useState<string>("smv");
  const [formData, setFormData] = useState<any>({});

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/property/schedules");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSmvData(data.smv || []);
      setLevelData(data.levels || []);
      setDepData(data.depreciation || []);
    } catch (error: any) {
      toast.error("Failed to load schedules: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/property/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: scheduleType, data: formData }),
      });

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      toast.success("Schedule entry added successfully");
      setIsDialogOpen(false);
      setFormData({});
      fetchData();
    } catch (error: any) {
      toast.error("Failed to save entry: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => router.push("/property")}
        className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Property Registry
      </button>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            Assessment Schedules
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Schedule of Market Values and Assessment Levels – Municipality of
            Sta. Rita, Samar
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="font-inter inline-flex cursor-pointer items-center gap-2 rounded bg-[#0f1729] px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Schedule Entry
            </button>
          </DialogTrigger>
          <DialogContent className="bg-white px-8 py-6 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-lexend text-xl text-[#00154A]">
                Add Schedule Entry
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="font-inter text-xs font-medium text-slate-600">
                  Schedule Type
                </label>
                <Select
                  value={scheduleType}
                  onOpenChange={() => {}}
                  onValueChange={(v) => {
                    setScheduleType(v);
                    setFormData({});
                  }}
                >
                  <SelectTrigger className="w-full font-inter text-sm border-gray-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="smv">SMV Land Schedule</SelectItem>
                    <SelectItem value="level">Assessment Level</SelectItem>
                    <SelectItem value="depreciation">
                      Building Depreciation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scheduleType === "smv" && (
                <>
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Classification / Actual Use
                    </label>
                    <Input
                      required
                      className="border-gray-200"
                      placeholder="e.g. Residential"
                      onChange={(e) =>
                        setFormData({ ...formData, use_type: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Base Unit Market Value (₱/sqm)
                    </label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      className="border-gray-200"
                      placeholder="0.00"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unit_value: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Effectivity Year
                    </label>
                    <Input
                      required
                      type="number"
                      className="border-gray-200"
                      placeholder="2024"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          effectivity_year: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </>
              )}

              {scheduleType === "level" && (
                <>
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Classification
                    </label>
                    <Input
                      required
                      className="border-gray-200"
                      placeholder="e.g. Residential"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          classification: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Actual Use
                    </label>
                    <Input
                      required
                      className="border-gray-200"
                      placeholder="e.g. Agricultural"
                      onChange={(e) =>
                        setFormData({ ...formData, actual_use: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Market Value Range
                    </label>
                    <Input
                      required
                      className="border-gray-200"
                      placeholder="e.g. Below ₱500,000"
                      onChange={(e) =>
                        setFormData({ ...formData, mv_range: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Assessment Level (%)
                    </label>
                    <Input
                      required
                      type="number"
                      className="border-gray-200"
                      placeholder="20"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assessment_level: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </>
              )}

              {scheduleType === "depreciation" && (
                <>
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Building Type
                    </label>
                    <Input
                      required
                      className="border-gray-200"
                      placeholder="e.g. Concrete"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          building_type: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Depreciation Rate
                    </label>
                    <Input
                      required
                      className="border-gray-200"
                      placeholder="e.g. 2% per year"
                      onChange={(e) =>
                        setFormData({ ...formData, rate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Max Depreciation
                    </label>
                    <Input
                      required
                      className="border-gray-200"
                      placeholder="e.g. 50%"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_depreciation: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              <DialogFooter className="mt-8">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0f1729] hover:bg-slate-800 text-white font-inter text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Schedule Entry"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Ordinance Info Banner */}
      <div className="mb-6 rounded-sm border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <ListChecks className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-inter text-sm font-semibold text-blue-800">
              Municipal Ordinance No. 2023-14
            </p>
            <p className="font-inter mt-1 text-xs text-blue-600">
              An Ordinance Providing the Schedule of Market Values for Real
              Properties and Prescribing the Assessment Levels in the
              Municipality of Sta. Rita, Samar. Effectivity: January 1, 2024.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-sm border border-gray-100 shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <p className="font-inter mt-2 text-xs text-slate-400">
              Loading schedules...
            </p>
          </div>
        ) : (
          <>
            {/* Schedule of Market Values */}
            <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-[#00154A]" />
                  <h2 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
                    Schedule of Market Values (SMV) – Land
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full font-inter text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-[#595a5d] font-semibold uppercase tracking-wide w-8">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-[#595a5d] font-semibold uppercase tracking-wide">
                        Classification / Actual Use
                      </th>
                      <th className="px-4 py-3 text-right text-[#595a5d] font-semibold uppercase tracking-wide whitespace-nowrap">
                        Base Unit Market Value (₱/sqm)
                      </th>
                      <th className="px-4 py-3 text-center text-[#595a5d] font-semibold uppercase tracking-wide">
                        Effectivity Year
                      </th>
                      <th className="px-4 py-3 text-center text-[#595a5d] font-semibold uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {smvData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-slate-400 italic"
                        >
                          No land schedules available.
                        </td>
                      </tr>
                    ) : (
                      smvData.map((row, i) => (
                        <tr
                          key={row.id || i}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-[#595a5d]">
                            {row.use_type}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            ₱
                            {row.unit_value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-500">
                            {row.effectivity_year}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              title="Edit"
                              className="text-slate-400 hover:text-amber-600 cursor-pointer transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assessment Level Schedule */}
            <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-[#00154A]" />
                  <h2 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
                    Assessment Level Schedule
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full font-inter text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-[#595a5d] font-semibold uppercase tracking-wide">
                        Classification
                      </th>
                      <th className="px-4 py-3 text-left text-[#595a5d] font-semibold uppercase tracking-wide">
                        Actual Use
                      </th>
                      <th className="px-4 py-3 text-left text-[#595a5d] font-semibold uppercase tracking-wide whitespace-nowrap">
                        Market Value Range
                      </th>
                      <th className="px-4 py-3 text-center text-[#595a5d] font-semibold uppercase tracking-wide whitespace-nowrap">
                        Assessment Level
                      </th>
                      <th className="px-4 py-3 text-center text-[#595a5d] font-semibold uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-slate-400 italic"
                        >
                          No assessment levels available.
                        </td>
                      </tr>
                    ) : (
                      levelData.map((row, i) => (
                        <tr
                          key={row.id || i}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${classificationColors[row.classification] ?? "bg-gray-100 text-gray-600"}`}
                            >
                              {row.classification}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.actual_use}
                          </td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                            {row.mv_range}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-[#595a5d]">
                              {row.assessment_level}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              title="Edit"
                              className="text-slate-400 hover:text-amber-600 cursor-pointer transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Depreciation Schedule Note */}
            <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks className="h-4 w-4 text-[#00154A]" />
                <h2 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
                  Building Depreciation Schedule (Reference)
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {depData.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-400 italic">
                    No depreciation rules available.
                  </div>
                ) : (
                  depData.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-md border border-gray-100 bg-gray-50 p-3"
                    >
                      <p className="font-inter text-xs font-semibold text-[#595a5d]">
                        {item.building_type}
                      </p>
                      <p className="font-inter mt-1 text-xs text-slate-500">
                        Rate:{" "}
                        <span className="font-medium text-slate-700">
                          {item.rate}
                        </span>
                      </p>
                      <p className="font-inter text-xs text-slate-500">
                        Max Depreciation:{" "}
                        <span className="font-medium text-slate-700">
                          {item.max_depreciation}
                        </span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
