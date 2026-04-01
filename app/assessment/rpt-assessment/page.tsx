"use client";

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
import { useState, useMemo, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";


export default function RptAssessmentPage() {
  const [mounted, setMounted] = useState(false);
  const [marketValue, setMarketValue] = useState(0);
  const [assessmentLevel, setAssessmentLevel] = useState(40);
  const [basicTaxRate, setBasicTaxRate] = useState(2.0);
  const [sefRate, setSefRate] = useState(1.0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculations = useMemo(() => {
    const av = marketValue * (assessmentLevel / 100);
    const basic = av * (basicTaxRate / 100);
    const sef = av * (sefRate / 100);
    const total = basic + sef;
    return {
      assessedValue: av,
      basicTaxDue: basic,
      sefTaxDue: sef,
      totalAnnualTax: total,
    };
  }, [marketValue, assessmentLevel, basicTaxRate, sefRate]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);
  };

  if (!mounted) return null;

  return (
    <div className="w-full">
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm 15mm; }
          body { visibility: hidden !important; background: white !important; }
          #rpt-print-root, #rpt-print-root * { visibility: visible !important; }
          #rpt-print-root {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <Link
        href="/assessment"
        className="font-lexend no-print mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessment & Billing
      </Link>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            RPT Assessment
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Treasurer Module - Real Property Tax Computation
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section
            icon={<Calculator className="h-5 w-5 text-[#00154A]" />}
            title="Assessment Inputs"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="Market Value"
                value={marketValue}
                onChange={setMarketValue}
                icon={<PhilippinePeso className="h-4 w-4 text-[#C0C7D0]" />}
              />
              <InputField
                label="Assessment Level (%)"
                value={assessmentLevel}
                onChange={setAssessmentLevel}
                icon={<Percent className="h-4 w-4 text-[#C0C7D0]" />}
                readOnly={true}
              />
              <InputField
                label="Basic Tax Rate (%)"
                value={basicTaxRate}
                onChange={setBasicTaxRate}
                icon={<Percent className="h-4 w-4 text-[#C0C7D0]" />}
                readOnly={true}
              />
              <InputField
                label="SEF Rate (%)"
                value={sefRate}
                onChange={setSefRate}
                icon={<Percent className="h-4 w-4 text-[#C0C7D0]" />}
                readOnly={true}
              />
            </div>
          </Section>

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
        </div>

        <div className="sticky top-6 space-y-6 self-start print:relative print:top-0 print:space-y-4">
          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              className="cursor-pointer font-inter inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print Draft
            </button>
            <button
              type="button"
              className="cursor-pointer font-inter inline-flex h-10 items-center justify-center gap-2 rounded bg-[#0F172A] px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              Save Assessment
            </button>
          </div>
          <section className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm print:shadow-none print:border print:border-slate-200">
            <Accordion
              type="multiple"
              className="w-full"
              defaultValue={["summary"]}
            >
              {/* Computation Summary */}
              <AccordionItem
                value="summary"
                className="border-b border-gray-100 last:border-0"
              >
                <AccordionTrigger className="cursor-pointer px-6 py-3 hover:no-underline">
                  <span className="flex items-center gap-2.5 text-left">
                    <span className="flex items-center justify-center rounded-md bg-slate-100 p-1.5">
                      <ClipboardCheck className="h-4 w-4 text-[#00154A]" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-inter text-xs font-semibold text-[#595a5d]">
                        Computation Summary
                      </span>
                      <span className="font-inter text-[10px] text-slate-400 block">
                        Annual tax breakdown
                      </span>
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <SummaryRow
                      label="Assessed Value"
                      value={formatCurrency(calculations.assessedValue)}
                    />
                    <SummaryRow
                      label="Basic Tax Due"
                      value={formatCurrency(calculations.basicTaxDue)}
                    />
                    <SummaryRow
                      label="SEF Tax Due"
                      value={formatCurrency(calculations.sefTaxDue)}
                    />
                    <div className="border-t border-gray-200 pt-2">
                      <SummaryRow
                        label="Total Annual Tax"
                        value={formatCurrency(calculations.totalAnnualTax)}
                        bold
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cursor-pointer font-inter no-print mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                    onClick={() => {
                      /* Calculation is already reactive, but we can add a refresh effect if needed */
                    }}
                  >
                    <Calculator className="h-4 w-4" />
                    Recompute Tax
                  </button>
                </AccordionContent>
              </AccordionItem>

              {/* Validation Checklist */}
              <AccordionItem value="checklist" className="border-none">
                <AccordionTrigger className="cursor-pointer px-6 py-3 hover:no-underline">
                  <span className="flex items-center gap-2.5 text-left">
                    <span className="flex items-center justify-center rounded-md bg-slate-100 p-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#00154A]" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-inter text-xs font-semibold text-[#595a5d]">
                        Validation Checklist
                      </span>
                      <span className="font-inter text-[10px] text-slate-400 block">
                        Pre-billing verification
                      </span>
                    </span>
                  </span>
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

      {/* Hidden professional print document */}
      <AssessmentDraftDocument 
        marketValue={marketValue}
        assessmentLevel={assessmentLevel}
        basicRate={basicTaxRate}
        sefRate={sefRate}
        calculations={calculations}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

function AssessmentDraftDocument({
  marketValue,
  assessmentLevel,
  basicRate,
  sefRate,
  calculations,
  formatCurrency
}: {
  marketValue: number;
  assessmentLevel: number;
  basicRate: number;
  sefRate: number;
  calculations: any;
  formatCurrency: (v: number) => string;
}) {
  const today = new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div id="rpt-print-root" className="hidden print:block font-serif text-black">
      {/* HEADER */}
      <div className="text-center border-b border-black pb-3 mb-6">
        <p className="text-[9pt] font-bold uppercase tracking-[0.2em]">Republic of the Philippines</p>
        <p className="text-[10pt]">Province of Samar — Municipality of Sta. Rita</p>
        <p className="text-[10pt] font-bold uppercase mt-1">Office of the Municipal Treasurer</p>
        <h1 className="text-[20pt] font-black uppercase mt-3 tracking-tighter">Draft Assessment Report</h1>
        <p className="text-[8pt] italic text-gray-600 mt-1">Real Property Tax Administration Unit</p>
      </div>

      {/* PROPERTY IDENTIFICATION */}
      <div className="grid grid-cols-2 gap-4 border border-black p-4 mb-6">
        <div>
          <Label value="Property Type" />
          <DataValue value="Commercial" />
        </div>
        <div>
          <Label value="Tax Declaration Number" />
          <DataValue value="TD-11-00382" />
        </div>
        <div>
          <Label value="Taxpayer PIN" />
          <DataValue value="TP-2026-0142" />
        </div>
        <div>
          <Label value="Status" />
          <DataValue value="DRAFT - Ready for Validation" />
        </div>
      </div>

      {/* VALUATION BREAKDOWN */}
      <h2 className="text-[10pt] font-bold uppercase bg-gray-100 p-1 border-x border-t border-black px-3">I. Valuation Breakdown</h2>
      <table className="w-full border-collapse border border-black mb-4 text-[9.5pt]">
        <tbody>
          <tr>
            <td className="border border-black px-3 py-1.5 w-1/2">Market Value (MV)</td>
            <td className="border border-black px-3 py-1.5 text-right font-bold">{formatCurrency(marketValue)}</td>
          </tr>
          <tr>
            <td className="border border-black px-3 py-1.5">Assessment Level (%)</td>
            <td className="border border-black px-3 py-1.5 text-right">{assessmentLevel.toFixed(2)}%</td>
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-black px-3 py-2 font-bold">Assessed Value (AV)</td>
            <td className="border border-black px-3 py-2 text-right font-bold text-[10.5pt]">{formatCurrency(calculations.assessedValue)}</td>
          </tr>
        </tbody>
      </table>

      {/* TAX COMPUTATION */}
      <h2 className="text-[10pt] font-bold uppercase bg-gray-100 p-1 border-x border-t border-black px-3">II. Tax Computation</h2>
      <table className="w-full border-collapse border border-black mb-4 text-[9.5pt]">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-black px-3 py-1 text-left">Tax Component</th>
            <th className="border border-black px-3 py-1 text-center">Rate (%)</th>
            <th className="border border-black px-3 py-1 text-right">Computed Due</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black px-3 py-1.5">Basic Real Property Tax</td>
            <td className="border border-black px-3 py-1.5 text-center">{basicRate.toFixed(2)}%</td>
            <td className="border border-black px-3 py-1.5 text-right">{formatCurrency(calculations.basicTaxDue)}</td>
          </tr>
          <tr>
            <td className="border border-black px-3 py-1.5">Special Education Fund (SEF)</td>
            <td className="border border-black px-3 py-1.5 text-center">{sefRate.toFixed(2)}%</td>
            <td className="border border-black px-3 py-1.5 text-right">{formatCurrency(calculations.sefTaxDue)}</td>
          </tr>
          <tr className="bg-gray-100 italic">
            <td colSpan={2} className="border border-black px-3 py-2 text-right font-bold uppercase">Total Annual Tax Due</td>
            <td className="border border-black px-3 py-2 text-right font-bold text-[11pt]">{formatCurrency(calculations.totalAnnualTax)}</td>
          </tr>
        </tbody>
      </table>

      {/* CERTIFICATION AND SIGNATORIES */}
      <div className="mt-8 border border-black p-3 text-[8.5pt] italic mb-8 leading-relaxed">
        I hereby certify that the computations provided in this draft assessment report are based on the latest 
        approved Schedule of Market Values and current municipal tax ordinances. This document is intended 
        solely for internal review and preliminary assessment discussion with the taxpayer.
      </div>

      <div className="grid grid-cols-2 gap-20 mt-8">
        <div className="text-center pt-6 border-t border-black">
          <p className="font-bold text-[9pt]">Assessment Staff</p>
          <p className="text-[7.5pt] text-gray-500 uppercase tracking-tight">Prepared By</p>
        </div>
        <div className="text-center pt-6 border-t border-black">
          <p className="font-bold text-[9pt]">Municipal Treasurer</p>
          <p className="text-[7.5pt] text-gray-500 uppercase tracking-tight">Authorized Official</p>
        </div>
      </div>

      <div className="mt-8 pt-3 border-t border-dotted border-gray-300 text-center text-[7pt] text-gray-500">
        Municipality of Sta. Rita · Province of Samar · Generated on {today} · Ref: {Math.random().toString(36).substring(7).toUpperCase()}
      </div>
    </div>
  );
}

function Label({ value }: { value: string }) {
  return <p className="text-[7pt] font-extrabold text-gray-500 uppercase tracking-wider mb-1">{value}</p>;
}

function DataValue({ value }: { value: string | number }) {
  return <p className="text-[10pt] font-semibold leading-none">{value}</p>;
}

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
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
  icon,
  readOnly = false,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon: ReactNode;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="font-inter text-xs font-medium text-slate-600">
        {label}
      </label>
      <div 
        className={cn(
          "mt-1 flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 transition-all",
          readOnly ? "bg-slate-50 opacity-80 cursor-not-allowed" : "bg-white focus-within:ring-2 focus-within:ring-slate-200"
        )}
      >
        {icon}
        <input
          type="number"
          value={value === 0 ? "" : value}
          onChange={(e) => !readOnly && onChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          readOnly={readOnly}
          onFocus={(e) => !readOnly && e.target.select()}
          className={cn(
            "w-full bg-transparent font-inter text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            readOnly ? "text-slate-500 cursor-not-allowed" : "text-slate-900 placeholder:text-slate-400"
          )}
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
  icon: ReactNode;
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
