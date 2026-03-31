import {
  ArrowLeft,
  Building2,
  Calculator,
  ClipboardCheck,
  FileSpreadsheet,
  Landmark,
  Percent,
  PhilippinePeso,
  Printer,
  Save,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function RptAssessmentPage() {
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
            RPT Assessment
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Treasurer Module - Real Property Tax Computation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-pointer font-inter inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            Print Draft
          </button>
          <button
            type="button"
            className="cursor-pointer font-inter inline-flex h-10 items-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800"
          >
            <Save className="h-4 w-4" />
            Save Assessment
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section
            icon={<Landmark className="h-5 w-5 text-[#00154A]" />}
            title="Property Snapshot"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard
                icon={<Building2 className="h-4 w-4 text-[#00154A]" />}
                label="Property Type"
                value="Commercial"
              />
              <InfoCard
                icon={<ShieldCheck className="h-4 w-4 text-[#00154A]" />}
                label="Status"
                value="Ready for Billing"
              />
              <InfoCard
                icon={<FileSpreadsheet className="h-4 w-4 text-[#00154A]" />}
                label="Tax Declaration"
                value="TD-11-00382"
              />
              <InfoCard
                icon={<ClipboardCheck className="h-4 w-4 text-[#00154A]" />}
                label="Taxpayer ID"
                value="TP-2026-0142"
              />
            </div>
          </Section>

          <Section
            icon={<Calculator className="h-5 w-5 text-[#00154A]" />}
            title="Assessment Inputs"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="Market Value"
                value="2,500,000.00"
                icon={<PhilippinePeso className="h-4 w-4 text-[#C0C7D0]" />}
              />
              <InputField
                label="Assessment Level (%)"
                value="40"
                icon={<Percent className="h-4 w-4 text-[#C0C7D0]" />}
              />
              <InputField
                label="Basic Tax Rate (%)"
                value="2.00"
                icon={<Percent className="h-4 w-4 text-[#C0C7D0]" />}
              />
              <InputField
                label="SEF Rate (%)"
                value="1.00"
                icon={<Percent className="h-4 w-4 text-[#C0C7D0]" />}
              />
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <Accordion
              type="multiple"
              className="w-full"
            >
              {/* Computation Summary */}
              <AccordionItem
                value="summary"
                className="border-b border-gray-100 last:border-0"
              >
                <AccordionTrigger className="cursor-pointer px-6 py-3 hover:no-underline">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="rounded-md bg-slate-100 p-1.5">
                      <ClipboardCheck className="h-4 w-4 text-[#00154A]" />
                    </div>
                    <div>
                      <h2 className="font-inter text-xs font-semibold text-[#595a5d]">
                        Computation Summary
                      </h2>
                      <p className="font-inter text-[10px] text-slate-400">
                        Annual tax breakdown
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <SummaryRow
                      label="Assessed Value"
                      value="PHP 1,000,000.00"
                    />
                    <SummaryRow label="Basic Tax Due" value="PHP 20,000.00" />
                    <SummaryRow label="SEF Tax Due" value="PHP 10,000.00" />
                    <div className="border-t border-gray-200 pt-2">
                      <SummaryRow
                        label="Total Annual Tax"
                        value="PHP 30,000.00"
                        bold
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cursor-pointer font-inter mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    <Calculator className="h-4 w-4" />
                    Recompute Tax
                  </button>
                </AccordionContent>
              </AccordionItem>

              {/* Validation Checklist */}
              <AccordionItem value="checklist" className="border-none">
                <AccordionTrigger className="cursor-pointer px-6 py-3 hover:no-underline">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="rounded-md bg-slate-100 p-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#00154A]" />
                    </div>
                    <div>
                      <h2 className="font-inter text-xs font-semibold text-[#595a5d]">
                        Validation Checklist
                      </h2>
                      <p className="font-inter text-[10px] text-slate-400">
                        Pre-billing verification
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <ul className="space-y-2 font-inter text-xs text-slate-500 pt-4 border-t border-slate-50">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                      Market value and assessment level are complete
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                      Tax rates follow current municipal ordinance
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                      Computation ready for billing generation
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
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-inter text-xs font-medium text-slate-600">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-slate-200">
        {icon}
        <input
          defaultValue={value}
          className="w-full bg-transparent font-inter text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="mb-2 inline-flex">{icon}</div>
      <p className="font-inter text-xs text-slate-400">{label}</p>
      <p className="font-inter mt-1 text-sm font-semibold text-[#848794]">
        {value}
      </p>
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
