"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import {
  ArrowLeft,
  CalendarDays,
  CalendarIcon,
  FileText,
  Printer,
  Save,
  Search,
  Send,
  ShieldCheck,
  User,
  Wallet,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type Taxpayer = {
  id: string | number;
  owner_name: string;
  tin: string | null;
  address: string | null;
};

type LinkedDeclaration = {
  id: string | number;
  td_number: string;
  properties: {
    pin: string;
  };
};

type BillingDraft = {
  id: string;
  taxpayer_id: string;
  taxpayer_name: string;
  td_no: string;
  pin: string;
  billing_year: string;
  quarter: string;
  reference_no: string;
  basic_tax: string;
  sef_tax: string;
  discount: string;
  penalty: string;
  total_due: number;
  created_at: string;
};

type BillingFormData = {
  taxpayer_id: string;
  taxpayer_name: string;
  td_no: string;
  pin: string;
  billing_year: string;
  quarter: string;
  reference_no: string;
  basic_tax: string;
  sef_tax: string;
  discount: string;
  penalty: string;
};

export default function BillingGenerationPage() {
  const [dueDate, setDueDate] = useState<Date | undefined>(
    new Date("2026-03-31"),
  );
  const [taxpayers, setTaxpayers] = useState<Taxpayer[]>([]);
  const [drafts, setDrafts] = useState<BillingDraft[]>([]);
  const [isLoadingTaxpayers, setIsLoadingTaxpayers] = useState(false);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [linkedDeclarations, setLinkedDeclarations] = useState<
    LinkedDeclaration[]
  >([]);
  const [formData, setFormData] = useState<BillingFormData>({
    taxpayer_id: "",
    taxpayer_name: "",
    td_no: "",
    pin: "",
    billing_year: "2026",
    quarter: "1st",
    reference_no: `BILL-2026-000124`,
    basic_tax: "",
    sef_tax: "",
    discount: "",
    penalty: "",
  });

  // Fetch all taxpayers and drafts on mount
  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingTaxpayers(true);
      setIsLoadingDrafts(true);
      try {
        const [tpRes, draftRes] = await Promise.all([
          fetch("/api/taxpayers/list"),
          fetch("/api/assessment/billing/drafts"),
        ]);

        const tpData = await tpRes.json();
        const draftData = await draftRes.json();

        if (tpData.taxpayers) setTaxpayers(tpData.taxpayers);
        if (draftData.drafts) setDrafts(draftData.drafts);
      } catch (err) {
        console.error("Failed to load initial data:", err);
      } finally {
        setIsLoadingTaxpayers(false);
        setIsLoadingDrafts(false);
      }
    }
    loadInitialData();
  }, []);

  // Handle Taxpayer Selection and Auto-fill
  const handleTaxpayerChange = async (id: string) => {
    if (!id) {
      setFormData((prev) => ({
        ...prev,
        taxpayer_id: "",
        taxpayer_name: "",
        td_no: "",
        pin: "",
      }));
      setLinkedDeclarations([]);
      return;
    }

    const selectedTaxpayer = taxpayers.find((t) => t.id.toString() === id);
    if (!selectedTaxpayer) return;

    // Set initial taxpayer info
    setFormData((prev) => ({
      ...prev,
      taxpayer_id: id,
      taxpayer_name: selectedTaxpayer.owner_name,
    }));

    // Fetch linked data (TDs and Properties)
    try {
      const res = await fetch(`/api/taxpayers/linked?id=${id}`);
      const data = await res.json();

      const declarations = data.declarations || [];
      setLinkedDeclarations(declarations);

      // Auto-fill from the first tax declaration found
      if (declarations.length > 0) {
        const firstDecl = declarations[0];
        setFormData((prev) => ({
          ...prev,
          td_no: firstDecl.td_number || "",
          pin: firstDecl.properties?.pin || "",
        }));
      } else {
        // Clear if no linked properties found
        setFormData((prev) => ({
          ...prev,
          td_no: "",
          pin: "",
        }));
      }
    } catch (err) {
      console.error("Failed to load linked property data:", err);
    }
  };

  const fetchLinkedProperties = async (taxpayerId: string) => {
    try {
      const res = await fetch(`/api/taxpayers/linked?id=${taxpayerId}`);
      const data = await res.json();

      const declarations = data.declarations || [];
      setLinkedDeclarations(declarations);
      return declarations;
    } catch (err) {
      console.error("Failed to load linked property data:", err);
      return [];
    }
  };

  // Handle PIN Selection and sync corresponding TD Number
  const handlePinChange = (pin: string) => {
    if (!pin) {
      setFormData((prev) => ({ ...prev, pin: "", td_no: "" }));
      return;
    }

    const matchedDecl = linkedDeclarations.find(
      (d) => d.properties.pin === pin,
    );
    setFormData((prev) => ({
      ...prev,
      pin,
      td_no: matchedDecl?.td_number || "",
    }));
  };

  // Handle Load Draft
  const handleLoadDraft = async (draftId: string) => {
    if (!draftId) return;
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;

    setCurrentDraftId(draft.id);
    
    // 1. Populate form data
    setFormData({
      taxpayer_id: draft.taxpayer_id,
      taxpayer_name: draft.taxpayer_name,
      td_no: draft.td_no,
      pin: draft.pin,
      billing_year: draft.billing_year,
      quarter: draft.quarter,
      reference_no: draft.reference_no,
      basic_tax: draft.basic_tax,
      sef_tax: draft.sef_tax,
      discount: draft.discount,
      penalty: draft.penalty,
    });

    // 2. Fetch PIN options for the taxpayer
    await fetchLinkedProperties(draft.taxpayer_id);
    
    toast.success('Draft loaded successfully');
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/assessment/billing/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentDraftId,
          ...formData,
          total_due: totalDue,
        }),
      });
      
      const data = await res.json();
      if (data.draft) {
        setCurrentDraftId(data.draft.id);
        // Refresh local drafts list
        const listRes = await fetch('/api/assessment/billing/drafts');
        const listData = await listRes.json();
        if (listData.drafts) setDrafts(listData.drafts);
        toast.success(currentDraftId ? 'Draft updated' : 'Initial draft saved');
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsSaving(false);
    }
  };

  // Live Total Calculation
  const subtotal =
    (parseFloat(formData.basic_tax.replace(/,/g, "")) || 0) +
    (parseFloat(formData.sef_tax.replace(/,/g, "")) || 0);
  const totalDue =
    subtotal +
    (parseFloat(formData.penalty.replace(/,/g, "")) || 0) -
    (parseFloat(formData.discount.replace(/,/g, "")) || 0);

  const isFormValid =
    formData.taxpayer_id &&
    formData.pin &&
    formData.billing_year.length === 4 &&
    totalDue >= 0;

  return (
    <div className="w-full">
      <Link
        href="/assessment"
        className="font-lexend mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessment & Billing
      </Link>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            Billing Generation
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Treasurer Module - Generate billing statements and notices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-pointer font-inter inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            Print Preview
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving || !formData.taxpayer_id}
            className="cursor-pointer font-inter inline-flex h-10 items-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 text-[#8A9098]" />
            {isSaving
              ? "Saving..."
              : currentDraftId
                ? "Update Draft"
                : "Save Draft Bill"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section
            icon={<Search className="h-5 w-5 text-[#00154A]" />}
            title="Bill Lookup"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Combobox
                label="Load Recent Draft"
                placeholder="Find a draft..."
                options={drafts.map((d: BillingDraft) => ({
                  value: d.id,
                  label: d.taxpayer_name,
                  sublabel: `${d.reference_no} • ${d.pin}`,
                }))}
                value={currentDraftId || ""}
                onChange={handleLoadDraft}
                disabled={isLoadingDrafts}
                className="col-span-full mb-2"
                triggerClassName="bg-blue-50/30 border-blue-100 hover:border-blue-200"
              />
              <Combobox
                label="Taxpayer Name"
                placeholder="Search taxpayer..."
                options={taxpayers.map((t) => ({
                  value: t.id.toString(),
                  label: t.owner_name,
                  sublabel: t.tin ? `TIN: ${t.tin}` : undefined,
                }))}
                value={formData.taxpayer_id}
                onChange={handleTaxpayerChange}
                disabled={isLoadingTaxpayers}
              />
              <InputField
                label="Tax Declaration No."
                value={formData.td_no}
                readOnly
              />
              <InputField
                label="Taxpayer ID"
                value={formData.taxpayer_id}
                readOnly
              />
              <Combobox
                label="Property PIN"
                placeholder="Select PIN..."
                options={linkedDeclarations.map((d) => ({
                  value: d.properties.pin,
                  label: d.properties.pin,
                  sublabel: `TD No: ${d.td_number}`,
                }))}
                value={formData.pin}
                onChange={handlePinChange}
                disabled={!formData.taxpayer_id}
              />
            </div>
          </Section>

          <Section
            icon={<CalendarDays className="h-5 w-5 text-[#00154A]" />}
            title="Billing Details"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ValidatedInput
                label="Billing Year"
                type="year"
                value={formData.billing_year}
                onChange={(val) => {
                  setFormData((prev) => ({
                    ...prev,
                    billing_year: val,
                    reference_no:
                      val.length === 4
                        ? prev.reference_no.replace(
                            /BILL-\d{4}-/,
                            `BILL-${val}-`,
                          )
                        : prev.reference_no,
                  }));
                }}
                required
              />
              <Combobox
                label="Quarter"
                options={[
                  { value: "1st", label: "1st Quarter" },
                  { value: "2nd", label: "2nd Quarter" },
                  { value: "3rd", label: "3rd Quarter" },
                  { value: "4th", label: "4th Quarter" },
                ]}
                value={formData.quarter}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, quarter: val }))
                }
                hideSearch
              />
              <DueDateField value={dueDate} onChange={setDueDate} />
              <ValidatedInput
                label="Billing Reference No."
                type="text"
                value={formData.reference_no}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, reference_no: val }))
                }
              />
            </div>
          </Section>

          <Section
            icon={<Wallet className="h-5 w-5 text-[#00154A]" />}
            title="Amount Breakdown"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ValidatedInput
                label="Basic Tax"
                type="decimal-numeric"
                placeholder="0.00"
                value={formData.basic_tax}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, basic_tax: val }))
                }
                required
              />
              <ValidatedInput
                label="SEF Tax"
                type="decimal-numeric"
                placeholder="0.00"
                value={formData.sef_tax}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, sef_tax: val }))
                }
                required
              />
              <ValidatedInput
                label="Discount"
                type="decimal-numeric"
                placeholder="0.00"
                value={formData.discount}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, discount: val }))
                }
              />
              <ValidatedInput
                label="Penalty"
                type="decimal-numeric"
                placeholder="0.00"
                value={formData.penalty}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, penalty: val }))
                }
              />
            </div>
            <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-inter mb-3 text-xs font-semibold uppercase tracking-wide text-[#595a5d]">
                Computed Billing Total
              </h3>
              <div className="space-y-2">
                <SummaryRow
                  label="Subtotal"
                  value={`PHP ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <SummaryRow
                  label="Adjustments (Discount/Penalty)"
                  value={`PHP ${(parseFloat(formData.penalty.replace(/,/g, "")) - parseFloat(formData.discount.replace(/,/g, ""))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <div className="border-t border-gray-200 pt-2">
                  <SummaryRow
                    label="Amount Due"
                    value={`PHP ${totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    bold
                  />
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm text-[#00154A]">
            <Accordion type="multiple" className="w-full">
              {/* Billing Summary */}
              <AccordionItem
                value="summary"
                className="border-b border-gray-100"
              >
                <AccordionTrigger className="cursor-pointer px-6 py-3 hover:no-underline">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="rounded-md bg-slate-100 p-1.5">
                      <FileText className="h-4 w-4 text-[#00154A]" />
                    </div>
                    <div>
                      <h2 className="font-inter text-xs font-semibold text-[#595a5d]">
                        Billing Summary
                      </h2>
                      <p className="font-inter text-[10px] text-slate-400">
                        Review statement details
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <SummaryRow
                      label="Taxpayer"
                      value={formData.taxpayer_name || "—"}
                    />
                    <SummaryRow
                      label="Property PIN"
                      value={formData.pin || "—"}
                    />
                    <SummaryRow
                      label="Tax Year"
                      value={formData.billing_year || "—"}
                    />
                    <SummaryRow
                      label="Quarter"
                      value={formData.quarter || "—"}
                    />
                    <SummaryRow
                      label="Reference No."
                      value={formData.reference_no}
                    />
                    <SummaryRow label="Status" value="Draft" />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Generation Actions */}
              <AccordionItem
                value="actions"
                className="border-b border-gray-100"
              >
                <AccordionTrigger className="cursor-pointer px-6 py-3 hover:no-underline">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="rounded-md bg-slate-100 p-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#00154A]" />
                    </div>
                    <div>
                      <h2 className="font-inter text-xs font-semibold text-[#595a5d]">
                        Generation Actions
                      </h2>
                      <p className="font-inter text-[10px] text-slate-400">
                        Output and delivery
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <div className="space-y-2 pt-4 border-t border-slate-50">
                    <button
                      type="button"
                      disabled={!isFormValid}
                      className="cursor-pointer font-inter inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="h-4 w-4" />
                      Generate Statement
                    </button>
                    <button
                      type="button"
                      disabled={!isFormValid}
                      className="cursor-pointer font-inter inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                      Send to Taxpayer
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Required Checks */}
              <AccordionItem value="checks" className="border-none">
                <AccordionTrigger className="cursor-pointer px-6 py-3 hover:no-underline">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="rounded-md bg-slate-100 p-1.5">
                      <User className="h-4 w-4 text-[#00154A]" />
                    </div>
                    <div>
                      <h2 className="font-inter text-xs font-semibold text-[#595a5d]">
                        Required Checks
                      </h2>
                      <p className="font-inter text-[10px] text-slate-400">
                        Pre-release verification
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <ul className="space-y-2 font-inter text-xs text-slate-500 pt-4 border-t border-slate-50">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                      Assessment values are finalized
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                      Due date follows approved schedule
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                      Billing notice ready for release
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md bg-slate-100 p-2">{icon}</div>
        <h2 className="font-inter text-sm font-semibold text-[#848794]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="font-inter text-xs font-medium text-slate-600">
        {label}
      </label>
      <div
        className={cn(
          "mt-1 flex items-center rounded-md border border-gray-200 px-3 py-2 transition-all",
          readOnly
            ? "bg-slate-50 cursor-not-allowed opacity-80"
            : "bg-white focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-300",
        )}
      >
        <input
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "w-full bg-transparent font-inter text-sm outline-none placeholder:text-slate-400",
            readOnly ? "text-slate-500 cursor-not-allowed" : "text-slate-900",
          )}
        />
      </div>
    </div>
  );
}

function DueDateField({
  value,
  onChange,
}: {
  value?: Date;
  onChange: (date?: Date) => void;
}) {
  return (
    <div>
      <label className="font-inter text-xs font-medium text-slate-600">
        Due Date
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="font-inter mt-1 h-10.5 w-full justify-start rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm font-normal text-slate-900 shadow-none hover:bg-gray-50 cursor-pointer"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
            {value ? (
              format(value, "PPP")
            ) : (
              <span className="text-slate-400">Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            captionLayout="dropdown"
            fromYear={2020}
            toYear={2035}
            initialFocus
            className="rounded-lg border bg-white"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-inter text-xs text-slate-500">{label}</span>
      <span
        className={`font-inter text-xs ${bold ? "font-bold text-[#595a5d]" : "font-medium text-slate-900"}`}
      >
        {value}
      </span>
    </div>
  );
}
