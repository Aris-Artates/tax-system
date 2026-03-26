"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { FileText, FileSpreadsheet, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (
    format: "pdf" | "csv",
    config: {
      dateRange: string;
      startDate?: Date;
      endDate?: Date;
      reportType: string;
    },
  ) => void;
}

const DATE_RANGE_OPTIONS = [
  { value: "ytd", label: "Year to Date" },
  { value: "last-quarter", label: "Last Quarter" },
  { value: "last-month", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];

const REPORT_TYPE_OPTIONS = [
  { value: "full", label: "Full Summary" },
  { value: "collections", label: "Collections Only" },
  { value: "delinquencies", label: "Delinquencies Only" },
];

// Helper for the custom date pickers
function DatePickerButton({
  date,
  setDate,
  placeholder,
}: {
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal h-10 px-3 ${
            !date ? "text-slate-400" : "text-slate-900"
          }`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MM/dd/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border bg-white shadow-md"
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function GenerateReportModal({
  isOpen,
  onClose,
  onExport,
}: GenerateReportModalProps) {
  const [dateRange, setDateRange] = useState("ytd");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [reportType, setReportType] = useState("full");

  if (!isOpen) return null;

  const handleExport = (format: "pdf" | "csv") => {
    onExport(format, {
      dateRange,
      startDate: dateRange === "custom" ? startDate : undefined,
      endDate: dateRange === "custom" ? endDate : undefined,
      reportType,
    });
    // Optional: Only close after export finishes, but for now we'll just close it.
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={true}
        className="p-0 overflow-hidden bg-white max-w-lg border-0 shadow-xl gap-0"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-white">
          <DialogTitle className="font-lexend text-xl font-bold text-slate-800">
            Generate Report
          </DialogTitle>
          <DialogDescription className="font-inter text-xs text-slate-500 mt-1">
            Select your parameters and export format.
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-2">
            <label className="font-inter text-sm font-semibold text-slate-700">
              Date Range
            </label>
            <Combobox
              className="mt-1"
              label=""
              options={DATE_RANGE_OPTIONS}
              value={dateRange}
              onChange={setDateRange}
              placeholder="Select date range"
              required
            />

            {/* Custom Date Pickers */}
            {dateRange === "custom" && (
              <div className="flex gap-4 items-center mt-3 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex-1">
                  <label className="font-inter text-xs text-slate-500 mb-1 block">
                    Start Date
                  </label>
                  <DatePickerButton
                    date={startDate}
                    setDate={setStartDate}
                    placeholder="Start date"
                  />
                </div>
                <div className="text-slate-300 mt-5">—</div>
                <div className="flex-1">
                  <label className="font-inter text-xs text-slate-500 mb-1 block">
                    End Date
                  </label>
                  <DatePickerButton
                    date={endDate}
                    setDate={setEndDate}
                    placeholder="End date"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Report Type Selection */}
          <div className="space-y-2">
            <label className="font-inter text-sm font-semibold text-slate-700">
              Report Type
            </label>
            <Combobox
              className="mt-1"
              label=""
              options={REPORT_TYPE_OPTIONS}
              value={reportType}
              onChange={setReportType}
              placeholder="Select report type"
              required
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-gray-100 px-6 py-5 flex flex-col gap-3">
          <label className="font-inter text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Export Format
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport("pdf")}
              className="cursor-pointer flex-1 flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white font-inter text-sm font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
            >
              <FileText className="h-4 w-4" />
              Export as PDF
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="cursor-pointer flex-1 flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-inter text-sm font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export as CSV
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
