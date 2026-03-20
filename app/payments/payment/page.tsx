"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {  
  ArrowLeft,
  Save,
  UserRound,
  Banknote,
  CalendarIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Combobox } from "@/components/ui/combobox";
import type { ComboboxOption } from "@/components/ui/combobox";
import { ValidatedInput } from "@/components/ui/ValidatedInput";

export function CalendarInput({ className }: { className?: string }) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          // We merge the default button styling with any custom classes you pass in
          className={`w-full justify-start text-left font-normal ${
            !date ? "text-slate-400" : "text-slate-900"
          } ${className || ""}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {/* This formats the date as MM/dd/yyyy. Example: 03/15/2026 */}
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
          fromYear={1950} // Optional: limits how far back they can scroll
          toYear={2050} // Optional: limits how far forward they can scroll
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

const paymentOptions: ComboboxOption[] = [
  { value: 'gcash', label: 'GCash' },
  { value: 'managers-check', label: "Manager's Check" },
  { value: 'landbank', label: 'Online Transfer (Landbank)' }
];

export default function RecordPaymentPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = React.useState('');
  const [tdn, setTdn] = React.useState('');
  const [taxpayerName, setTaxpayerName] = React.useState('');
  const [ORnumber, setOrNumber] = React.useState('');

  return (
    <div className="flex">
      <main className="flex-1">
        {/* Header Section */}
        <header className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payments Monitoring
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
                Record New Payment
              </h1>
              <p className="font-inter mt-1 text-xs text-slate-400">
                Post Real Property Tax (RPT) payments and generate Official
                Receipts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/payments"
                className="font-inter inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="button"
                className="font-inter inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800"
              >
                <Save className="h-4 w-4" />
                Save Payment
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
          {/* Section 1: Taxpayer & Property Details */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <UserRound className="h-5 w-5 text-[#00154A]" />
              </div>
              <h2 className="font-inter text-sm font-semibold text-[#848794]">
                Taxpayer Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Tax Declaration No. (TDN){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <ValidatedInput
                  validator="td-number"
                  value={tdn}
                  placeholder="TD-2024-0001"
                  onChange={setTdn}
                  className="font-inter mt-1"
                  prefix="TD-"
                />
              </div>
              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Taxpayer Name <span className="text-rose-500">*</span>
                </label>
                <ValidatedInput
                  validator="name"
                  value={taxpayerName}
                  onChange={setTaxpayerName}
                  placeholder="Juan Dela Cruz"
                  className="font-inter mt-1"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Payment Details */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <Banknote className="h-5 w-5 text-[#00154A]" />
              </div>
              <h2 className="font-inter text-sm font-semibold text-[#848794]">
                Payment Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Amount Paid (₱) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="font-inter mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 placeholder:text-slate-400 text-slate-900"
                />
              </div>
              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Select Payment Method <span className="text-rose-500">*</span>
                </label>
                <Combobox
                  label=""
                  options={paymentOptions}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Official Receipt (O.R.) Number{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <ValidatedInput
                  validator="ORnumber"
                  value={ORnumber}
                  onChange={setOrNumber}
                  placeholder="OR-2026-000123"
                  className="font-inter mt-1"
                  maxLength={14}
                />
              </div>
              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Payment Date <span className="text-rose-500">*</span>
                </label>
                <CalendarInput className="font-inter mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-200" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
