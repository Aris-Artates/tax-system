"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlarmClock,
  ArrowLeft,
  BellRing,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  Search,
  Settings2,
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

const reminderRules = [
  {
    code: "RA-2026-001",
    trigger: "15 days before due date",
    audience: "All active RPT accounts",
    channel: "SMS",
    frequency: "Once",
    lastRun: "Mar 13, 2026",
    status: "Active",
  },
  {
    code: "RA-2026-002",
    trigger: "5 days before due date",
    audience: "High-value accounts",
    channel: "Email",
    frequency: "Once",
    lastRun: "Mar 13, 2026",
    status: "Active",
  },
  {
    code: "RA-2026-003",
    trigger: "3 days after missed due date",
    audience: "Unpaid accounts",
    channel: "SMS + Email",
    frequency: "Every 7 days",
    lastRun: "Mar 12, 2026",
    status: "Active",
  },
  {
    code: "RA-2026-004",
    trigger: "10 days after missed due date",
    audience: "Accounts for final demand",
    channel: "SMS",
    frequency: "Every 14 days",
    lastRun: "Mar 10, 2026",
    status: "Paused",
  },
  {
    code: "RA-2026-005",
    trigger: "30 days delinquent",
    audience: "Accounts for field validation",
    channel: "Email",
    frequency: "Once",
    lastRun: "Mar 09, 2026",
    status: "Draft",
  },
] as const;

const statusClasses: Record<(typeof reminderRules)[number]["status"], string> =
  {
    Active: "bg-emerald-50 text-emerald-700",
    Paused: "bg-amber-50 text-amber-700",
    Draft: "bg-slate-100 text-slate-600",
  };

export default function ReminderAlertsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredRules = useMemo(() => {
    const query = search.toLowerCase();

    return reminderRules.filter((rule) => {
      if (!query) {
        return true;
      }

      return (
        rule.code.toLowerCase().includes(query) ||
        rule.trigger.toLowerCase().includes(query) ||
        rule.audience.toLowerCase().includes(query) ||
        rule.channel.toLowerCase().includes(query) ||
        rule.status.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const stats = [
    { label: "Active Rules", value: "3", color: "text-emerald-600" },
    { label: "Alerts Sent Today", value: "1,284", color: "text-[#595a5d]" },
    { label: "Delivery Success Rate", value: "97.4%", color: "text-blue-600" },
    { label: "Failed Deliveries", value: "33", color: "text-red-600" },
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
            Reminder Alerts
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Configure automated reminders and monitor alert delivery for
            delinquency follow-up
          </p>
        </div>

        <Button
          type="button"
          className="font-inter inline-flex cursor-pointer items-center gap-2 rounded bg-[#0f1729] px-4 py-2 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800"
        >
          <Settings2 className="h-4 w-4" />
          Create Rule
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
            placeholder="Search code, trigger, audience, channel, or status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="font-inter h-9 rounded-sm border-gray-200 py-2 pl-8 pr-3 text-xs text-[#595a5d] focus-visible:border-slate-400 focus-visible:ring-0"
          />
        </div>

        <p className="flex items-center gap-2 text-xs text-slate-400">
          <MessageSquareText className="h-4 w-4" />
          14 reminders queued for retry after failed delivery
        </p>
      </section>

      <section className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
        <TableContainer>
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-b border-gray-200">
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Rule Code
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Trigger
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Audience
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Channel
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Frequency
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Last Run
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-[#595a5d]">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-slate-400"
                  >
                    No reminder rules found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <TableRow
                    key={rule.code}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="whitespace-nowrap px-4 py-3 font-medium text-[#595a5d]">
                      {rule.code}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {rule.trigger}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {rule.audience}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {rule.channel}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {rule.frequency}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {rule.lastRun}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[rule.status]}`}
                      >
                        {rule.status}
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
            Showing {filteredRules.length} of {reminderRules.length} reminder
            rules
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
