"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Search,
  Send,
  Truck,
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

const distributionRecords = [
  {
    reference: "ND-2026-0313-041",
    batch: "NG-2026-0312-06",
    taxpayer: "Ramon C. Dela Cruz",
    barangay: "San Isidro",
    channel: "Field Service",
    servedDate: "Mar 12, 2026",
    status: "Acknowledged",
  },
  {
    reference: "ND-2026-0313-040",
    batch: "NG-2026-0312-07",
    taxpayer: "Lourdes M. Angeles",
    barangay: "Mabini",
    channel: "Registered Mail",
    servedDate: "Mar 11, 2026",
    status: "Delivered",
  },
  {
    reference: "ND-2026-0313-039",
    batch: "NG-2026-0312-06",
    taxpayer: "Golden Fields Realty",
    barangay: "Poblacion East",
    channel: "Messenger",
    servedDate: "Mar 11, 2026",
    status: "In Transit",
  },
  {
    reference: "ND-2026-0313-038",
    batch: "NG-2026-0311-11",
    taxpayer: "Northpoint Agri Ventures",
    barangay: "Bagong Silang",
    channel: "Field Service",
    servedDate: "Mar 10, 2026",
    status: "Attempted",
  },
  {
    reference: "ND-2026-0313-037",
    batch: "NG-2026-0312-07",
    taxpayer: "Teresita P. Navarro",
    barangay: "Sta. Elena",
    channel: "Registered Mail",
    servedDate: "Mar 10, 2026",
    status: "Delivered",
  },
] as const;

const statusClasses: Record<
  (typeof distributionRecords)[number]["status"],
  string
> = {
  Acknowledged: "bg-emerald-50 text-emerald-700",
  Delivered: "bg-blue-50 text-blue-700",
  "In Transit": "bg-amber-50 text-amber-700",
  Attempted: "bg-slate-100 text-slate-600",
};

export default function NoticeDistributionPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase();

    return distributionRecords.filter((record) => {
      if (!query) {
        return true;
      }

      return (
        record.reference.toLowerCase().includes(query) ||
        record.batch.toLowerCase().includes(query) ||
        record.taxpayer.toLowerCase().includes(query) ||
        record.barangay.toLowerCase().includes(query) ||
        record.channel.toLowerCase().includes(query) ||
        record.status.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const stats = [
    { label: "Notices to Distribute", value: "65", color: "text-[#595a5d]" },
    { label: "Served Today", value: "24", color: "text-emerald-600" },
    { label: "Pending Acknowledgment", value: "18", color: "text-amber-600" },
    { label: "Failed Attempts", value: "4", color: "text-red-600" },
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
            Notice Distribution
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Monitor service channels, delivery outcomes, and taxpayer
            acknowledgment of notices
          </p>
        </div>

        <Button
          type="button"
          onClick={() => router.push("/deliquencies/notice_generation")}
          className="font-inter inline-flex cursor-pointer items-center gap-2 rounded bg-[#0f1729] px-4 py-2 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800"
        >
          <Send className="h-4 w-4" />
          Release New Batch
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

      <div className="mb-4 flex flex-col gap-3 rounded-sm border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative flex-1 min-w-45 max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={13}
          />
          <Input
            type="text"
            placeholder="Search ref#, batch, taxpayer, barangay, channel, or status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="font-inter h-9 rounded-sm border-gray-200 py-2 pl-8 pr-3 text-xs text-[#595a5d] focus-visible:border-slate-400 focus-visible:ring-0"
          />
        </div>

        <p className="flex items-center gap-2 text-xs text-slate-400">
          <Mail className="h-4 w-4" />
          18 notices still pending taxpayer acknowledgment
        </p>
      </div>

      <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
        <TableContainer>
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-b border-gray-200">
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Reference
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Generation Batch
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Taxpayer
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Barangay
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Channel
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Served Date
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-slate-400"
                  >
                    No notice distribution records found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow
                    key={record.reference}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="whitespace-nowrap px-4 py-3 font-medium text-[#595a5d]">
                      {record.reference}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {record.batch}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {record.taxpayer}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {record.barangay}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {record.channel}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {record.servedDate}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[record.status]}`}
                      >
                        {record.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <p className="font-inter text-xs text-slate-400">
            Showing {filteredRecords.length} of {distributionRecords.length}{" "}
            notice records
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
        </div>
      </div>
    </main>
  );
}
