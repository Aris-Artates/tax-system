"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Printer,
  Search,
  Send,
  WandSparkles,
} from "lucide-react";

const noticeTemplates = [
  {
    name: "Initial Delinquency Notice",
    audience: "1 year overdue accounts",
    count: "388 eligible",
    accent: "bg-blue-50 text-blue-700",
  },
  {
    name: "Final Demand Letter",
    audience: "2-3 year overdue accounts",
    count: "426 eligible",
    accent: "bg-amber-50 text-amber-700",
  },
  {
    name: "Escalation Notice",
    audience: "5+ year overdue accounts",
    count: "154 eligible",
    accent: "bg-red-50 text-red-600",
  },
] as const;

const generationQueue = [
  {
    batch: "NG-2026-0313-01",
    noticeType: "Final Demand Letter",
    target: "San Isidro Cluster",
    accounts: "42 accounts",
    status: "Ready to Generate",
  },
  {
    batch: "NG-2026-0313-02",
    noticeType: "Initial Delinquency Notice",
    target: "Mabini Cluster",
    accounts: "58 accounts",
    status: "Drafted",
  },
  {
    batch: "NG-2026-0313-03",
    noticeType: "Escalation Notice",
    target: "Bagong Silang Priority List",
    accounts: "17 accounts",
    status: "For Review",
  },
  {
    batch: "NG-2026-0313-04",
    noticeType: "Final Demand Letter",
    target: "Poblacion East High Balance",
    accounts: "23 accounts",
    status: "Ready to Generate",
  },
] as const;

const recentBatches = [
  {
    batch: "NG-2026-0312-07",
    type: "Initial Delinquency Notice",
    generated: "136 notices",
    channel: "Print Queue",
  },
  {
    batch: "NG-2026-0312-06",
    type: "Final Demand Letter",
    generated: "84 notices",
    channel: "For Distribution",
  },
  {
    batch: "NG-2026-0311-11",
    type: "Escalation Notice",
    generated: "19 notices",
    channel: "Legal Review",
  },
] as const;

const statusColors: Record<(typeof generationQueue)[number]["status"], string> =
  {
    "Ready to Generate": "bg-emerald-50 text-emerald-700",
    Drafted: "bg-blue-50 text-blue-700",
    "For Review": "bg-amber-50 text-amber-700",
  };

export default function NoticeGenerationPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredQueue = useMemo(() => {
    const query = search.toLowerCase();

    return generationQueue.filter((item) => {
      if (!query) {
        return true;
      }

      return (
        item.batch.toLowerCase().includes(query) ||
        item.noticeType.toLowerCase().includes(query) ||
        item.target.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const stats = [
    { label: "Templates Available", value: "3", color: "text-[#595a5d]" },
    { label: "Queued for Generation", value: "140", color: "text-blue-600" },
    { label: "Ready to Print", value: "65", color: "text-emerald-600" },
    { label: "Pending Review", value: "17", color: "text-amber-600" },
  ];

  return (
    <div className="w-full">
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
            Notice Generation
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Prepare, review, and generate delinquency notices for overdue
            accounts
          </p>
        </div>

        <button
          type="button"
          className="font-inter inline-flex cursor-pointer items-center gap-2 rounded bg-[#0f1729] px-4 py-2 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800"
        >
          <WandSparkles className="h-4 w-4" />
          Generate New Batch
        </button>
      </header>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.35fr_0.8fr]">
        <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-inter text-xs uppercase tracking-wide text-slate-400">
                Notice Templates
              </p>
              <h2 className="font-lexend mt-2 text-xl font-bold text-[#595a5d]">
                Select the notice type based on account aging and enforcement
                stage
              </h2>
              <p className="font-inter mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Create batches from pre-defined notice templates so wording, due
                dates, and escalation language stay consistent across all
                delinquent account communications.
              </p>
            </div>
            <div className="rounded-sm bg-slate-50 p-3 text-slate-500">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {noticeTemplates.map((template) => (
              <div
                key={template.name}
                className="rounded-sm border border-gray-200 bg-gray-50 p-4"
              >
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${template.accent}`}
                >
                  {template.count}
                </span>
                <h3 className="font-lexend mt-3 text-sm font-bold text-[#595a5d]">
                  {template.name}
                </h3>
                <p className="font-inter mt-1 text-xs leading-5 text-slate-500">
                  {template.audience}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-sm bg-blue-50 p-2 text-blue-700">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-lexend text-base font-bold text-[#595a5d]">
                Batch Output
              </h2>
              <p className="font-inter text-xs text-slate-400">
                Current notice production status
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-sm border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="font-inter text-xs text-slate-500">
                Generated today
              </p>
              <p className="font-lexend mt-1 text-base font-bold text-[#595a5d]">
                239 notices
              </p>
            </div>
            <div className="rounded-sm border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="font-inter text-xs text-slate-500">
                Queued for print and release
              </p>
              <p className="font-lexend mt-1 text-base font-bold text-[#595a5d]">
                65 notices
              </p>
            </div>
            <div className="rounded-sm border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="font-inter text-xs text-slate-500">
                Awaiting reviewer sign-off
              </p>
              <p className="font-lexend mt-1 text-base font-bold text-[#595a5d]">
                17 batches
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-sm border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="font-inter text-xs text-amber-700">
              Final demand batches should be reviewed before releasing to notice
              distribution.
            </p>
          </div>
        </div>
      </div>

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

      <div className="mb-4 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="relative flex-1 min-w-45 max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={13}
            />
            <input
              type="text"
              placeholder="Search batch, notice type, target, or status..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="font-inter w-full rounded-sm border border-gray-200 py-2 pl-8 pr-3 text-xs text-[#595a5d] focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Printer className="h-4 w-4" />
            65 notices are currently ready for print release
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.82fr]">
        <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="font-lexend text-base font-bold text-[#595a5d]">
              Generation Queue
            </h2>
            <p className="font-inter mt-1 text-xs text-slate-400">
              Notice batches waiting for generation, review, or printing
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full font-inter text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {[
                    "Batch ID",
                    "Notice Type",
                    "Target Group",
                    "Coverage",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-3 text-left font-semibold uppercase tracking-wide text-[#595a5d]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-slate-400"
                    >
                      No notice batches found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map((item) => (
                    <tr
                      key={item.batch}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-[#595a5d]">
                        {item.batch}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {item.noticeType}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {item.target}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {item.accounts}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="font-inter text-xs text-slate-400">
              Showing {filteredQueue.length} of {generationQueue.length} queued
              batches
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="cursor-pointer p-1 text-slate-400 hover:text-slate-600"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-inter px-2 text-xs text-slate-500">
                Page 1 of 1
              </span>
              <button
                type="button"
                className="cursor-pointer p-1 text-slate-400 hover:text-slate-600"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-lexend text-base font-bold text-[#595a5d]">
                Recent Batches
              </h2>
              <p className="font-inter mt-1 text-xs text-slate-400">
                Latest generated notice outputs
              </p>
            </div>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-5 space-y-3">
            {recentBatches.map((batch) => (
              <div
                key={batch.batch}
                className="rounded-sm border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <p className="font-lexend text-sm font-bold text-[#595a5d]">
                  {batch.batch}
                </p>
                <p className="font-inter mt-1 text-xs text-slate-500">
                  {batch.type}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>{batch.generated}</span>
                  <span>{batch.channel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
