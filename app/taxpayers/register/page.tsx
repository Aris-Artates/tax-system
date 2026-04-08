"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  ArrowLeft,
  Save,
  UserRound,
  MapPin,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const OWNER_TYPE_OPTIONS = ["Individual", "Corporation", "Government"] as const;
const SUFFIX_OPTIONS = ["", "Jr.", "Sr.", "II", "III", "IV", "V"] as const;
type OwnerType = (typeof OWNER_TYPE_OPTIONS)[number];

type BarangayOption = {
  id: number;
  name: string;
};

type FormState = {
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  tin: string;
  owner_type: OwnerType | "";
  barangay_id: string;
  address_details: string;
  phone: string;
  email: string;
};

const initialForm: FormState = {
  first_name: "",
  middle_name: "",
  last_name: "",
  suffix: "",
  tin: "",
  owner_type: "",
  barangay_id: "",
  address_details: "",
  phone: "",
  email: "",
};

export default function RegisterTaxpayerPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [barangays, setBarangays] = useState<BarangayOption[]>([]);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let isMounted = true;

    const fetchBarangays = async () => {
      setIsLoadingBarangays(true);
      try {
        const response = await fetch("/api/barangays/list", {
          cache: "no-store",
        });
        const data = await response.json();
        const decodedBarangays = data._data ? JSON.parse(atob(atob(atob(data._data)))) : (data.barangays ?? []);
        
        if (isMounted) {
          setBarangays(decodedBarangays);
        }
      } catch {
        if (isMounted) {
          setBarangays([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingBarangays(false);
        }
      }
    };

    fetchBarangays();
    return () => {
      isMounted = false;
    };
  }, []);

  const missingRequired = useMemo(
    () =>
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.owner_type ||
      !form.barangay_id.trim() ||
      !form.address_details.trim(),
    [form],
  );

  const selectedBarangayName = useMemo(
    () =>
      barangays.find((barangay) => String(barangay.id) === form.barangay_id)
        ?.name || "",
    [barangays, form.barangay_id],
  );

  const composedAddress = useMemo(
    () =>
      [form.address_details.trim(), selectedBarangayName]
        .filter(Boolean)
        .join(", "),
    [form.address_details, selectedBarangayName],
  );

  const barangayOptions = useMemo<ComboboxOption[]>(
    () =>
      barangays.map((barangay) => ({
        value: String(barangay.id),
        label: barangay.name,
      })),
    [barangays],
  );

  let previewName =
    [form.first_name, form.middle_name, form.last_name, form.suffix]
      .map((v) => v.trim())
      .filter(Boolean)
      .join(" ") || "(Required)";

  if (previewName.length > 25) {
    previewName = previewName.slice(0, 22) + "...";
  }

  async function handleSave() {
    if (missingRequired) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        middle_name: form.middle_name.trim(),
        last_name: form.last_name.trim(),
        suffix: form.suffix.trim(),
        tin: form.tin.trim(),
        owner_type: form.owner_type,
        barangay_id: Number(form.barangay_id),
        address_details: form.address_details.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      };

      const res = await fetch("/api/taxpayers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to register taxpayer.");
        return;
      }

      toast.success(data.message ?? "Taxpayer registered successfully.");
      setForm(initialForm);
      router.push("/taxpayers/list");
    } catch {
      toast.error("Unable to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <header>
        <button
          type="button"
          onClick={() => router.push("/taxpayers")}
          className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Taxpayer Records
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex mb-8 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
                Register New Taxpayer
              </h1>
              <p className="font-inter mt-1 text-xs text-slate-400">
                Add required taxpayer information and address details.
              </p>
            </div>
          </div>

          {/* Taxpayer Information */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-md bg-slate-100 p-2">
                <UserRound className="h-5 w-5 text-[#00154A]" />
              </div>
              <h2 className="font-inter text-sm font-semibold text-[#848794]">
                Taxpayer Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ValidatedInput
                label="First Name"
                required
                validator="name"
                value={form.first_name}
                onChange={(v) => updateField("first_name", v)}
              />
              <ValidatedInput
                label="Middle Name"
                validator="name"
                value={form.middle_name}
                onChange={(v) => updateField("middle_name", v)}
              />
              <ValidatedInput
                label="Last Name"
                required
                validator="name"
                value={form.last_name}
                onChange={(v) => updateField("last_name", v)}
              />

              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Suffix
                </label>
                <Combobox
                  options={SUFFIX_OPTIONS.map((s) => ({
                    value: s,
                    label: s || "None",
                  }))}
                  value={form.suffix}
                  onChange={(val) => updateField("suffix", val)}
                  placeholder="Select suffix"
                  searchPlaceholder="Search suffix..."
                  className="mt-1"
                />
              </div>
              <ValidatedInput
                label="TIN"
                type="tin"
                placeholder="000-000-000-000"
                value={form.tin}
                onChange={(v) => updateField("tin", v)}
              />
              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Owner Type
                  <span className="ml-1 text-rose-500">*</span>
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {OWNER_TYPE_OPTIONS.map((type) => (
                    <BooleanChip
                      key={type}
                      label={type}
                      checked={form.owner_type === type}
                      onClick={() => updateField("owner_type" as any, type)}
                      className="cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Contact & Address */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-md bg-slate-100 p-2">
                <MapPin className="h-5 w-5 text-[#00154A]" />
              </div>
              <h2 className="font-inter text-sm font-semibold text-[#848794]">
                Contact & Address
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="font-inter text-xs font-medium text-slate-600 mb-1 block">
                  Barangay <span className="text-rose-500">*</span>
                </label>
                <Combobox
                  options={barangayOptions}
                  value={form.barangay_id}
                  onChange={(value) => updateField("barangay_id", value)}
                  placeholder={
                    isLoadingBarangays
                      ? "Loading barangays..."
                      : "Select barangay"
                  }
                  searchPlaceholder="Search barangay..."
                  emptyLabel="No barangay found."
                  className="w-full"
                />
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Other Address Details"
                  required
                  placeholder="Street, Purok, Sitio, Landmark"
                  value={form.address_details}
                  onChange={(v) => updateField("address_details", v)}
                />
              </div>
              <ValidatedInput
                label="Phone"
                type="phone"
                placeholder="912 345 6789"
                value={form.phone}
                leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
                onChange={(v) => updateField("phone", v)}
              />
              <ValidatedInput
                label="Email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                onChange={(v) => updateField("email", v)}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8 lg:self-start flex flex-col-reverse lg:flex-col">
          <div className="sticky top-0 z-40 mb-6 flex justify-end py-1.5 w-full px-4 md:px-0">
            <div className="flex w-full items-center gap-2 mb-2 mt-4 md:mt-0 md:w-auto">
              <button
                type="button"
                onClick={() => router.push("/taxpayers")}
                className="flex-1 justify-center md:flex-none font-inter inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting || missingRequired}
                className="flex-1 justify-center md:flex-none font-inter h-10 inline-flex cursor-pointer items-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? "Saving..." : "Save Taxpayer"}</span>
              </button>
            </div>
          </div>

          <section className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <Accordion
              type="single"
              collapsible
              className="w-full"
            >
              <AccordionItem value="summary" className="border-none">
                <AccordionTrigger className="cursor-pointer px-6 py-3 hover:no-underline">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="rounded-md bg-slate-100 p-1.5">
                      <FileText className="h-4 w-4 text-[#00154A]" />
                    </div>
                    <div>
                      <h2 className="font-inter text-xs font-semibold text-[#595a5d]">
                        Registration Summary
                      </h2>
                      <p className="font-inter text-[10px] text-slate-400">
                        Review details before saving
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <div className="space-y-3 text-sm border-t border-slate-50 pt-4">
                    <SummaryRow label="Full Name" value={previewName} />
                    <SummaryRow label="TIN" value={form.tin.trim() || "—"} />
                    <SummaryRow
                      label="Type"
                      value={form.owner_type || "(Required)"}
                    />
                    <SummaryRow
                      label="Barangay"
                      value={selectedBarangayName || "(Required)"}
                    />
                    <SummaryRow
                      label="Address"
                      value={composedAddress || "(Required)"}
                    />
                  </div>
                  {missingRequired && (
                    <p className="mt-4 font-inter text-[10px] uppercase font-bold tracking-wider text-rose-600">
                      ⚠ Complete all required fields before saving.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </div>
    </div>
  );
}

// Helper Components (Copied/Adapted from user/create)
function Field({
  label,
  placeholder,
  leftIcon,
  value,
  onChange,
  required = false,
}: {
  label: string;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="font-inter text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-slate-200">
        {leftIcon}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

function BooleanChip({
  label,
  checked,
  onClick,
  className,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-inter rounded-md border px-3 py-2 text-xs transition-all ${
        checked
          ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
          : "border-gray-200 bg-white text-slate-600 hover:bg-gray-50 hover:border-gray-300"
      } ${className || ""}`}
    >
      {label}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-inter text-xs text-slate-500">{label}</span>
      <span className="font-inter font-medium text-slate-900 truncate max-w-150px">
        {value}
      </span>
    </div>
  );
}
