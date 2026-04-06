"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";

const reportQueue = [
  {
    reportId: "DR-2026-0313-01",
    reportType: "Barangay Delinquency Summary",
    coverage: "Mar 2026",
    requestedBy: "Treasury - Collections",
    generatedAt: "Mar 13, 2026 08:40 AM",
    status: "Completed",
  },
  {
    reportId: "DR-2026-0313-02",
    reportType: "Aging Analysis (1,2,5+)",
    coverage: "Q1 2026",
    requestedBy: "Assessor - Compliance",
    generatedAt: "Mar 13, 2026 08:55 AM",
    status: "Completed",
  },
  {
    reportId: "DR-2026-0313-03",
    reportType: "Notice Service Performance",
    coverage: "Mar 2026",
    requestedBy: "Admin - Enforcement",
    generatedAt: "Mar 13, 2026 09:10 AM",
    status: "Processing",
  },
  {
    reportId: "DR-2026-0313-04",
    reportType: "Top Delinquent Accounts",
    coverage: "YTD 2026",
    requestedBy: "Municipal Treasurer",
    generatedAt: "Mar 13, 2026 09:22 AM",
    status: "Queued",
  },
  {
    reportId: "DR-2026-0313-05",
    reportType: "Collection Gap Report",
    coverage: "YTD 2026",
    requestedBy: "Budget Office",
    generatedAt: "Mar 13, 2026 09:28 AM",
    status: "Failed",
  },
] as const;

const statusClasses: Record<(typeof reportQueue)[number]["status"], string> = {
  Completed: "bg-emerald-50 text-emerald-700",
  Processing: "bg-blue-50 text-blue-700",
  Queued: "bg-amber-50 text-amber-700",
  Failed: "bg-red-50 text-red-600",
};

export default function DeliquencyReportsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredReports = useMemo(() => {
    const query = search.toLowerCase();

    return reportQueue.filter((report) => {
      if (!query) {
        return true;
      }

      return (
        report.reportId.toLowerCase().includes(query) ||
        report.reportType.toLowerCase().includes(query) ||
        report.coverage.toLowerCase().includes(query) ||
        report.requestedBy.toLowerCase().includes(query) ||
        report.status.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const stats = [
    { label: "Reports Generated Today", value: "18", color: "text-[#595a5d]" },
    { label: "Completed", value: "14", color: "text-emerald-600" },
    { label: "In Queue", value: "3", color: "text-amber-600" },
    { label: "Failed", value: "1", color: "text-red-600" },
  ];

  return (
    <main className="w-full">
      <button
        type="button"
        onClick={() => router.push("/delinquencies")}
        className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Delinquencies & Notices
      </button>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            Delinquency Reports
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Generate operational and compliance reports for delinquent account
            monitoring
          </p>
        </div>

        <Button
          type="button"
          className="font-inter inline-flex cursor-pointer items-center gap-2 rounded bg-[#0f1729] px-4 py-2 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Generate Report
        </Button>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="font-inter text-xs text-slate-400">{stat.label}</p>
            <p className={`font-lexend mt-1 text-xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mb-4 flex flex-col gap-3 rounded-sm border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative flex-1 min-w-45 max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={13}
          />
          <Input
            type="text"
            placeholder="Search report ID, type, coverage, office, or status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="font-inter h-9 rounded-sm border-gray-200 py-2 pl-8 pr-3 text-xs text-[#595a5d] focus-visible:border-slate-400 focus-visible:ring-0"
          />
        </div>

        <p className="flex items-center gap-2 text-xs text-slate-400">
          <Download className="h-4 w-4" />7 report exports are ready for
          download
        </p>
      </section>

      <section className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
        <TableContainer>
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-b border-gray-200">
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Report ID
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Report Type
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Coverage
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Requested By
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Generated At
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-slate-400"
                  >
                    No report records found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow
                    key={report.reportId}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="whitespace-nowrap px-4 py-3 font-medium text-[#595a5d]">
                      {report.reportId}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {report.reportType}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {report.coverage}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {report.requestedBy}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {report.generatedAt}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[report.status]}`}
                      >
                        {report.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <footer className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <p className="font-inter text-xs text-slate-400">
            Showing {filteredReports.length} of {reportQueue.length} report
            records
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-slate-400 hover:text-slate-600"
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="font-inter px-2 text-xs text-slate-500">
              Page 1 of 1
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-slate-400 hover:text-slate-600"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </footer>
      </section>
    </main>
  );
}
