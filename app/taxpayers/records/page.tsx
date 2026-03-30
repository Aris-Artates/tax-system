"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import {
  ArrowLeft,
  FileBadge,
  UserRound,
  FileCheck,
  Banknote,
  Printer,
  CalendarIcon,
} from "lucide-react";

import { CertificatePDF } from "@/components/print/CertificatePDF";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// ── Reusable Section Component ────────────────────────────────────────────────
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
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-md bg-slate-100 p-2">{icon}</div>
        <h2 className="font-inter text-sm font-semibold text-[#848794]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

// ── Reusable Calendar Input ──────────────────────────────────────────────────
function CalendarInput({
  date,
  setDate,
  className,
}: {
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${
            !date ? "text-slate-400" : "text-slate-900"
          } ${className || ""}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MM/dd/yyyy") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-lg border bg-white shadow-md"
          captionLayout="dropdown"
          fromYear={2000}
          toYear={2050}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

const CERTIFICATION_TYPES: ComboboxOption[] = [
  { value: "tax-clearance", label: "Tax Clearance" },
  { value: "no-improvement", label: "Certificate of No Improvement" },
  { value: "property-holdings", label: "Certificate of Property Holdings" },
  { value: "ctc-td", label: "Certified True Copy of Tax Declaration" },
  { value: "non-delinquency", label: "Certificate of Non-Delinquency" },
];

const PURPOSE_OPTIONS: ComboboxOption[] = [
  { value: "loan", label: "For Loan / Mortgage" },
  { value: "transfer", label: "For Transfer of Ownership" },
  { value: "record", label: "For Record Purposes" },
  { value: "bir", label: "For BIR Requirements" },
  { value: "others", label: "Others" },
];

export default function CertificationsRecordsPage() {
  const router = useRouter();

  // State: Taxpayer
  const [taxpayerId, setTaxpayerId] = React.useState("");
  const [tin, setTin] = React.useState("");
  const [ownerAddress, setOwnerAddress] = React.useState("");
  const [taxpayerName, setTaxpayerName] = React.useState("");

  // State: Certification Request
  const [certType, setCertType] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [remarks, setRemarks] = React.useState("");
  const [relatedTd, setRelatedTd] = React.useState("");

  // State: Payment
  const [orNumber, setOrNumber] = React.useState("");
  const [amountPaid, setAmountPaid] = React.useState("");
  const [paymentDate, setPaymentDate] = React.useState<Date | undefined>(new Date());

  // State: PDF preview
  const [showPDF, setShowPDF] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Mock data for combobox
  const [taxpayerOptions] = React.useState<ComboboxOption[]>([
    { value: "1", label: "Juan Dela Cruz", sublabel: "TIN: 123-456-789-000" },
    { value: "2", label: "Maria Clara", sublabel: "TIN: 987-654-321-000" },
    { value: "3", label: "Acme Corporation", sublabel: "TIN: 111-222-333-000" },
  ]);

  // Simulate fetching taxpayer details
  React.useEffect(() => {
    if (taxpayerId) {
      const selected = taxpayerOptions.find((o) => o.value === taxpayerId);
      setTaxpayerName(selected?.label || "");
      if (taxpayerId === "1") {
        setTin("123-456-789-000");
        setOwnerAddress("Brgy. San Jose, Sta. Rita, Samar");
      } else if (taxpayerId === "2") {
        setTin("987-654-321-000");
        setOwnerAddress("Brgy. Poblacion, Sta. Rita, Samar");
      } else {
        setTin("111-222-333-000");
        setOwnerAddress("Manila City");
      }
    } else {
      setTaxpayerName("");
      setTin("");
      setOwnerAddress("");
    }
  }, [taxpayerId, taxpayerOptions]);

  return (
    <div className="flex">
      <main className="flex-1 w-full max-w-full">
        {/* Header */}
        <header className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Taxpayers
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-lexend text-2xl font-bold text-[#595a5d] flex items-center gap-3">
                Certifications & Records
              </h1>
              <p className="font-inter mt-1 text-xs text-slate-400">
                Issue certifications and official records for taxpayers and
                properties.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="font-inter inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-xs font-medium text-slate-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Cancel
              </button>

              {/* PDF Preview & Download */}
              {isClient && (
                <PDFDownloadLink
                  document={
                    <CertificatePDF
                      taxpayerName={taxpayerName}
                      tin={tin}
                      ownerAddress={ownerAddress}
                      certType={certType}
                      purpose={purpose}
                      relatedTd={relatedTd}
                      remarks={remarks}
                      orNumber={orNumber}
                      amountPaid={amountPaid}
                      paymentDate={paymentDate}
                    />
                  }
                  fileName={`certificate-${taxpayerName || "taxpayer"}.pdf`}
                  style={{ textDecoration: "none" }}
                >
                  {({ loading }) => (
                    <button
                      type="button"
                      className="font-inter inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0F172A] px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                    >
                      <Printer className="h-4 w-4" />
                      {loading ? "Generating PDF..." : "Preview & Issue"}
                    </button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            {/* Taxpayer Details */}
            <Section
              icon={<UserRound className="h-5 w-5 text-[#00154A]" />}
              title="Requesting Party"
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Combobox
                    label="Taxpayer Name"
                    placeholder="Search taxpayer..."
                    searchPlaceholder="Search by name or TIN"
                    options={taxpayerOptions}
                    value={taxpayerId}
                    onChange={setTaxpayerId}
                    required
                  />
                  <p className="font-inter mt-1 text-xs text-slate-400">
                    Not in the system?{" "}
                    <Link
                      href="/taxpayers/register"
                      className="text-blue-600 hover:underline"
                    >
                      Register here
                    </Link>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-inter text-xs font-medium text-slate-600 block mb-1">
                      Tax Identification Number (TIN)
                    </label>
                    <input
                      type="text"
                      value={tin}
                      readOnly
                      placeholder="Auto-filled"
                      className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 font-inter text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none cursor-not-allowed opacity-60"
                    />
                  </div>
                  <div>
                    <label className="font-inter text-xs font-medium text-slate-600 block mb-1">
                      Owner Address
                    </label>
                    <input
                      type="text"
                      value={ownerAddress}
                      readOnly
                      placeholder="Auto-filled"
                      className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 font-inter text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none cursor-not-allowed opacity-60"
                    />
                  </div>
                </div>
              </div>
            </Section>

            {/* Payment Details */}
            <Section
              icon={<Banknote className="h-5 w-5 text-[#00154A]" />}
              title="Payment Information"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-inter text-xs font-medium text-slate-600">
                    Official Receipt (O.R.) No.{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <ValidatedInput
                    type="ORnumber"
                    value={orNumber}
                    onChange={setOrNumber}
                    placeholder="OR-2026-000123"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-inter text-xs font-medium text-slate-600">
                    Amount Paid (₱) <span className="text-rose-500">*</span>
                  </label>
                  <ValidatedInput
                    type="decimal-numeric"
                    value={amountPaid}
                    onChange={setAmountPaid}
                    placeholder="0.00"
                    className="mt-1"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-inter text-xs font-medium text-slate-600">
                    Payment Date <span className="text-rose-500">*</span>
                  </label>
                  <CalendarInput
                    date={paymentDate}
                    setDate={setPaymentDate}
                    className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            {/* Certification Details */}
            <Section
              icon={<FileCheck className="h-5 w-5 text-[#00154A]" />}
              title="Certification Details"
            >
              <div className="grid grid-cols-1 gap-4">
                <Combobox
                  label="Type of Certification"
                  placeholder="Select type..."
                  searchPlaceholder="Search type..."
                  options={CERTIFICATION_TYPES}
                  value={certType}
                  onChange={setCertType}
                  required
                />

                <Combobox
                  label="Purpose of Request"
                  placeholder="Select purpose..."
                  searchPlaceholder="Search purpose..."
                  options={PURPOSE_OPTIONS}
                  value={purpose}
                  onChange={setPurpose}
                  required
                />

                <div>
                  <label className="font-inter text-xs font-medium text-slate-600">
                    Related TD / PIN (Optional)
                  </label>
                  <ValidatedInput
                    type="td-number"
                    value={relatedTd}
                    onChange={setRelatedTd}
                    placeholder="TD-2024-0001"
                    className="mt-1"
                  />
                  <p className="font-inter mt-1 text-xs text-slate-400">
                    If this certification is tied to a specific property.
                  </p>
                </div>

                <div>
                  <label className="font-inter text-xs font-medium text-slate-600 mb-1 block">
                    Additional Remarks / Notations
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Type any additional remarks here..."
                    className="font-inter w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
}