import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileBarChart2,
  FileSpreadsheet,
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
} from "@/components/Table";

type ReportRow = {
  reportName: string;
  coverage: string;
  generatedAt: string;
  format: "PDF" | "XLSX";
  status: "Ready" | "Queued";
};

const reportRows: ReportRow[] = [
  {
    reportName: "Barangay Collection Performance",
    coverage: "CY 2026 - Q1",
    generatedAt: "Mar 11, 2026 09:42 AM",
    format: "PDF",
    status: "Ready",
  },
  {
    reportName: "Delinquency Hotspot Summary",
    coverage: "CY 2026 - Q1",
    generatedAt: "Mar 10, 2026 04:18 PM",
    format: "XLSX",
    status: "Ready",
  },
  {
    reportName: "Taxpayer Distribution by Barangay",
    coverage: "CY 2026 - Q1",
    generatedAt: "Mar 9, 2026 01:05 PM",
    format: "PDF",
    status: "Queued",
  },
  {
    reportName: "Barangay Ranking Audit Trail",
    coverage: "CY 2026 - Q1",
    generatedAt: "Mar 8, 2026 03:31 PM",
    format: "XLSX",
    status: "Ready",
  },
];

export default function BarangayReportsPage() {
  return (
    <div className="w-full">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            Barangay Reports
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Generate and export barangay-level RPT performance and compliance
            reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/barangay">
            <Button
              variant="outline"
              className="font-inter h-9 cursor-pointer text-xs text-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Barangay Overview
            </Button>
          </Link>
          <Button className="font-inter h-9 cursor-pointer bg-[#0F172A] text-xs text-[#8A9098] hover:bg-slate-800">
            <FileBarChart2 className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <FileBarChart2 className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            Generated This Month
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            14
          </p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <FileSpreadsheet className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">Ready for Export</p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            11
          </p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <Download className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            Downloads This Week
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            27
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
            Report Library
          </h2>

          <div className="flex w-full gap-2 sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search reports"
                className="h-9 pl-8 text-xs"
              />
            </div>
            <Button variant="outline" className="h-9 px-3 text-xs">
              Current Year
            </Button>
          </div>
        </div>

        <TableContainer>
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]">
                  Report Name
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]">
                  Coverage
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]">
                  Generated At
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Format
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Status
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportRows.map((row) => (
                <TableRow
                  key={`${row.reportName}-${row.generatedAt}`}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="px-4 py-3 font-medium text-[#595a5d]">
                    {row.reportName}
                  </TableCell>
                  <TableCell className="px-4 py-3">{row.coverage}</TableCell>
                  <TableCell className="px-4 py-3">{row.generatedAt}</TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {row.format}
                    </span>
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.status === "Ready"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={row.status !== "Ready"}
                      className="h-8 cursor-pointer text-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </div>
  );
}
