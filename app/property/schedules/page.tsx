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
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

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

const LAND_CLASSIFICATIONS = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Industrial", label: "Industrial" },
  { value: "Agricultural", label: "Agricultural" },
  { value: "Special", label: "Special" },
  { value: "Timberland", label: "Timberland" },
  { value: "Mineral", label: "Mineral" },
];

const COMMON_ACTUAL_USES = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Industrial", label: "Industrial" },
  { value: "Agricultural", label: "Agricultural" },
  { value: "Corn Land", label: "Corn Land" },
  { value: "Cocoland", label: "Cocoland" },
  { value: "Riceland", label: "Riceland" },
  { value: "Warehouse", label: "Warehouse" },
  { value: "Gas Station", label: "Gas Station" },
  { value: "Hospital", label: "Hospital" },
  { value: "School", label: "School" },
  { value: "Church / Religious", label: "Church / Religious" },
];

const BUILDING_TYPE_OPTIONS = [
  { value: "One-Family Dwelling", label: "One-Family Dwelling" },
  { value: "Two-Family Dwelling", label: "Two-Family Dwelling" },
  { value: "Multi-Family Dwelling", label: "Multi-Family Dwelling" },
  { value: "Commercial Building", label: "Commercial Building" },
  { value: "Industrial Building", label: "Industrial Building" },
  { value: "Warehouse", label: "Warehouse" },
  { value: "Hospital", label: "Hospital" },
  { value: "School", label: "School" },
  { value: "Special Purpose", label: "Special Purpose" },
];

export default function AssessmentSchedulesPage() {
  const router = useRouter();
  const [smvData, setSmvData] = useState<SmvEntry[]>([]);
  const [levelData, setLevelData] = useState<AssessmentLevel[]>([]);
  const [depData, setDepData] = useState<DepreciationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [scheduleType, setScheduleType] = useState<string>("smv");
  const [formData, setFormData] = useState<any>({});
  const [formValidity, setFormValidity] = useState<Record<string, boolean>>({});

  const updateField = (name: string, value: string, isValid: boolean) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setFormValidity((prev) => ({ ...prev, [name]: isValid }));
  };

  const isFormValid = () => {
    if (scheduleType === "smv") {
      return (
        formValidity.use_type &&
        formValidity.unit_value &&
        formValidity.effectivity_year
      );
    }
    if (scheduleType === "level") {
      return (
        formValidity.classification &&
        formValidity.actual_use &&
        formValidity.mv_range &&
        formValidity.assessment_level
      );
    }
    if (scheduleType === "depreciation") {
      return (
        formValidity.building_type &&
        formValidity.rate &&
        formValidity.max_depreciation
      );
    }
    return false;
  };

  const handleEdit = (type: string, item: any) => {
    setIsEditing(true);
    setEditId(item.id);
    setScheduleType(type);

    // Populate form with item data, formatting numeric values where needed
    const initialFormData: any = { ...item };
    const initialValidity: Record<string, boolean> = {};

    if (type === "smv") {
      initialFormData.unit_value = item.unit_value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      initialFormData.effectivity_year = item.effectivity_year.toString();
      initialValidity.use_type = true;
      initialValidity.unit_value = true;
      initialValidity.effectivity_year = true;
    } else if (type === "level") {
      initialFormData.assessment_level = item.assessment_level.toString();
      initialValidity.classification = true;
      initialValidity.actual_use = true;
      initialValidity.mv_range = true;
      initialValidity.assessment_level = true;
    } else if (type === "depreciation") {
      initialValidity.building_type = true;
      initialValidity.rate = true;
      initialValidity.max_depreciation = true;
    }

    setFormData(initialFormData);
    setFormValidity(initialValidity);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!editId || !window.confirm("Are you sure you want to delete this entry?"))
      return;

    try {
      setIsSubmitting(true);
      const res = await fetch(
        `/api/property/schedules?type=${scheduleType}&id=${editId}`,
        {
          method: "DELETE",
        },
      );

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      toast.success("Schedule entry deleted successfully");
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete entry: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      // Prepare data for API (parse numbers)
      const dataToSubmit = { ...formData };
      if (scheduleType === "smv") {
        dataToSubmit.unit_value = parseFloat(
          formData.unit_value.replace(/,/g, ""),
        );
        dataToSubmit.effectivity_year = parseInt(formData.effectivity_year, 10);
      } else if (scheduleType === "level") {
        dataToSubmit.assessment_level = parseInt(formData.assessment_level, 10);
      }

      const res = await fetch("/api/property/schedules", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: scheduleType,
          id: editId,
          data: dataToSubmit,
        }),
      });

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      toast.success(
        `Schedule entry ${isEditing ? "updated" : "added"} successfully`,
      );
      setIsDialogOpen(false);
      setFormData({});
      setIsEditing(false);
      setEditId(null);
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
          <DialogContent className="bg-white px-8 py-6 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-lexend text-xl text-[#00154A]">
                {isEditing ? "Edit " : "Add "}
                {scheduleType === "smv" && "Land Market Value"}
                {scheduleType === "level" && "Assessment Level"}
                {scheduleType === "depreciation" && "Depreciation Rule"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              {scheduleType === "smv" && (
                <>
                  <Combobox
                    label="Classification / Actual Use"
                    required
                    options={COMMON_ACTUAL_USES}
                    value={formData.use_type || ""}
                    placeholder="Select or search use..."
                    onChange={(val) => updateField("use_type", val, !!val)}
                  />
                  <ValidatedInput
                    label="Base Unit Market Value (₱/sqm)"
                    required
                    validator="decimal-numeric"
                    value={formData.unit_value || ""}
                    placeholder="0.00"
                    onChange={(val, valid) =>
                      updateField("unit_value", val, valid)
                    }
                  />
                  <ValidatedInput
                    label="Effectivity Year"
                    required
                    validator="year"
                    value={formData.effectivity_year || ""}
                    placeholder="2024"
                    onChange={(val, valid) =>
                      updateField("effectivity_year", val, valid)
                    }
                  />
                </>
              )}

              {scheduleType === "level" && (
                <>
                  <Combobox
                    label="Classification"
                    required
                    options={LAND_CLASSIFICATIONS}
                    value={formData.classification || ""}
                    placeholder="Select classification..."
                    onChange={(val) =>
                      updateField("classification", val, !!val)
                    }
                  />
                  <Combobox
                    label="Actual Use"
                    required
                    options={COMMON_ACTUAL_USES}
                    value={formData.actual_use || ""}
                    placeholder="Select actual use..."
                    onChange={(val) => updateField("actual_use", val, !!val)}
                  />
                  <ValidatedInput
                    label="Market Value Range"
                    required
                    validator="text"
                    value={formData.mv_range || ""}
                    placeholder="e.g. Below ₱500,000"
                    onChange={(val, valid) =>
                      updateField("mv_range", val, valid)
                    }
                  />
                  <ValidatedInput
                    label="Assessment Level (%)"
                    required
                    validator="percentage"
                    value={formData.assessment_level || ""}
                    placeholder="20"
                    onChange={(val, valid) =>
                      updateField("assessment_level", val, valid)
                    }
                  />
                </>
              )}

              {scheduleType === "depreciation" && (
                <>
                  <Combobox
                    label="Building Type"
                    required
                    options={BUILDING_TYPE_OPTIONS}
                    value={formData.building_type || ""}
                    placeholder="Select building type..."
                    onChange={(val) => updateField("building_type", val, !!val)}
                  />
                  <ValidatedInput
                    label="Depreciation Rate"
                    required
                    validator="text"
                    value={formData.rate || ""}
                    placeholder="e.g. 2% per year"
                    onChange={(val, valid) => updateField("rate", val, valid)}
                  />
                  <ValidatedInput
                    label="Max Depreciation"
                    required
                    validator="text"
                    value={formData.max_depreciation || ""}
                    placeholder="e.g. 50%"
                    onChange={(val, valid) =>
                      updateField("max_depreciation", val, valid)
                    }
                  />
                </>
              )}

              <DialogFooter className="mt-8 flex items-center gap-2">
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-inter text-xs"
                  >
                    Delete Entry
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting || !isFormValid()}
                  className={cn(
                    "bg-[#0f1729] hover:bg-slate-800 text-white font-inter text-xs disabled:opacity-50",
                    isEditing ? "flex-1" : "w-full",
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    "Update Schedule Entry"
                  ) : (
                    "Save Schedule Entry"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

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
                <button
                  type="button"
                  onClick={() => {
                    setScheduleType("smv");
                    setFormData({});
                    setFormValidity({});
                    setIsEditing(false);
                    setEditId(null);
                    setIsDialogOpen(true);
                  }}
                  className="font-inter inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#0f1729] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add Land MV
                </button>
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
                              onClick={() => handleEdit("smv", row)}
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
                <button
                  type="button"
                  onClick={() => {
                    setScheduleType("level");
                    setFormData({});
                    setFormValidity({});
                    setIsEditing(false);
                    setEditId(null);
                    setIsDialogOpen(true);
                  }}
                  className="font-inter inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#0f1729] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add Level
                </button>
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
                              onClick={() => handleEdit("level", row)}
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-[#00154A]" />
                  <h2 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
                    Building Depreciation Schedule (Reference)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setScheduleType("depreciation");
                    setFormData({});
                    setFormValidity({});
                    setIsEditing(false);
                    setEditId(null);
                    setIsDialogOpen(true);
                  }}
                  className="font-inter inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#0f1729] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add Rule
                </button>
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
                      className="group relative rounded-md border border-gray-100 bg-gray-50 p-3"
                    >
                      <button
                        type="button"
                        onClick={() => handleEdit("depreciation", item)}
                        className="absolute right-2 top-2 p-1.5 text-slate-300 hover:text-amber-600 transition-colors cursor-pointer"
                        title="Edit Rule"
                      >
                        <Pencil size={12} />
                      </button>
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
