"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Clock, 
  Download, 
  Search, 
  Eye,
  CheckCircle2,
  CalendarDays,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  MapPin,
  Building2
} from "lucide-react";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/table";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DelinquentTaxpayer = {
  id: number;
  full_name: string;
  tin: string;
  barangay_name: string;
  property_count: number;
  bucket: "Current" | "1 Year" | "2 Years" | "3 Years" | "5+ Years";
  total_due: string;
  years_due: string;
};

type DelinquentsResponse = {
  data: DelinquentTaxpayer[];
  meta: {
    totalItems: number;
    totalPages: number;
  };
} | null;

const bucketColors: Record<DelinquentTaxpayer["bucket"], string> = {
  Current: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "1 Year": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "2 Years": "bg-blue-50 text-blue-700 border-blue-100",
  "3 Years": "bg-amber-50 text-amber-700 border-amber-100",
  "5+ Years": "bg-rose-50 text-rose-600 border-rose-100",
};

const bucketPanels = [
  {
    bucket: "Current",
    total: "128",
    balance: "PHP 2.1M",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-500",
    icon: CheckCircle2,
  },
  {
    bucket: "1 Year",
    total: "388",
    balance: "PHP 6.1M",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-500",
    icon: Clock,
  },
  {
    bucket: "2 Years",
    total: "274",
    balance: "PHP 8.8M",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
    icon: CalendarDays,
  },
  {
    bucket: "3 Years",
    total: "238",
    balance: "PHP 10.2M",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-500",
    icon: AlertCircle,
  },
  {
    bucket: "5+ Years",
    total: "348",
    balance: "PHP 13.5M",
    textColor: "text-rose-700",
    bgColor: "bg-rose-50",
    iconColor: "text-rose-500",
    icon: AlertTriangle,
  },
];

async function fetchDelinquents(
  search: string,
  pageIndex: number,
  pageSize: number,
): Promise<DelinquentsResponse> {
  const params = new URLSearchParams({
    search,
    page: (pageIndex + 1).toString(),
    limit: pageSize.toString(),
  });

  await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulated network delay

  return fetch(`/api/taxpayers/delinquents?${params}`).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch");
    }
    return res.json();
  });
}

export default function ViewDelinquenciesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selectedDelinquent, setSelectedDelinquent] =
    useState<DelinquentTaxpayer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const {
    data: delinquentsData,
    isLoading: isInitialLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["delinquents", { search, pagination: pagination.pageIndex }],
    queryFn: () =>
      fetchDelinquents(search, pagination.pageIndex, pagination.pageSize),
    gcTime: 0,
    staleTime: 0,
  });

  const isLoading = isInitialLoading || isFetching;

  const totalCount = delinquentsData?.meta?.totalItems ?? 0;
  const totalPages = delinquentsData?.meta?.totalPages ?? 1;
  const delinquents = delinquentsData?.data ?? [];

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Error loading delinquents. Please try again.
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => router.push("/taxpayers")}
        className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900 print:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Taxpayer Records
      </button>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            Delinquent Accounts
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Monitor overdue Real Property Tax obligations
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="font-inter inline-flex items-center gap-2 rounded-lg bg-[#0f172a] px-5 py-2.5 text-xs font-medium text-white hover:bg-slate-800 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Export Delinquency List
        </button>
      </header>

      {/* PRINT VIEW TEMPLATE - HIDDEN ON SCREEN */}
      <div className="hidden print:block w-full max-w-[210mm] mx-auto p-4 text-black font-serif">
        <style>{`
          @media print {
            @page { size: A4 portrait; margin: 15mm; }
            body { font-size: 11pt; color: #000; background: #fff; }
            .print-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .print-table th, .print-table td { border: 1px solid #000; padding: 10px; font-size: 10pt; }
            .print-table th { background: #f0f0f0 !important; font-weight: bold; }
          }
        `}</style>

        {/* PRINT HEADER */}
        <div className="text-center mb-10 pb-4 border-b-2 border-black/10">
          <p className="text-[10pt] font-bold uppercase tracking-widest">
            Republic of the Philippines
          </p>
          <p className="text-[11pt] font-semibold">Province of Samar</p>
          <p className="text-[11pt] font-semibold uppercase">
            Municipality of Sta. Rita
          </p>
          <div className="mt-2 inline-block border-y border-black py-1 px-4">
            <p className="text-[12pt] font-bold uppercase">
              Office of the Municipal Treasurer
            </p>
          </div>
          <h2 className="mt-8 text-[16pt] font-black uppercase underline decoration-2 underline-offset-4">
            List of Delinquent Taxpayers
          </h2>
          <p className="mt-2 text-[10pt] italic">
            As of{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* PRINT TABLE */}
        <table className="print-table w-full">
          <thead>
            <tr>
              <th className="w-8">#</th>
              <th className="text-left font-bold">Taxpayer Name</th>
              <th className="text-left font-bold">TIN</th>
              <th className="text-left font-bold">Barangay</th>
              <th className="text-center font-bold">Aging</th>
              <th className="text-right font-bold w-32">Amount Due</th>
            </tr>
          </thead>
          <tbody>
            {delinquents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center italic">
                  No records found for the current filter.
                </td>
              </tr>
            ) : (
              delinquents.map((row, i) => (
                <tr key={row.id}>
                  <td className="text-center font-serif">
                    {pagination.pageIndex * pagination.pageSize + i + 1}
                  </td>
                  <td className="font-bold">{row.full_name}</td>
                  <td className="font-mono text-[9pt]">{row.tin}</td>
                  <td className="font-serif">{row.barangay_name}</td>
                  <td className="text-center font-serif">{row.bucket}</td>
                  <td className="text-right font-bold font-serif">
                    {row.total_due}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PRINT FOOTER / SIGNATORIES */}
        <div className="mt-20 grid grid-cols-2 gap-12 font-serif text-[11pt]">
          <div className="text-left">
            <p className="mb-14">Prepared by:</p>
            <div className="w-64 border-t border-black">
              <p className="font-bold uppercase pt-1">RPTA Staff / Assessor</p>
              <p className="text-[10pt] italic text-slate-600">
                Administrative Assistant
              </p>
            </div>
          </div>
          <div className="text-left ml-auto">
            <p className="mb-14">Noted by:</p>
            <div className="w-64 border-t border-black">
              <p className="font-bold uppercase pt-1">NAME OF TREASURER</p>
              <p className="text-[10pt] italic text-slate-600">
                Municipal Treasurer
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-[8pt] text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4">
          LGU STA. RITA, SAMAR · RPT DELINQUENCIES SYSTEM REPORT · CONFIDENTIAL
        </div>
      </div>

      {/* Aging Buckets */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-5 print:hidden">
        {bucketPanels.map((panel) => (
          <div
            key={panel.bucket}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", panel.bgColor)}>
                <panel.icon className={cn("h-5 w-5", panel.iconColor)} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs font-medium text-slate-500">{panel.bucket}</p>
                <div className="flex flex-col">
                  {isLoading ? (
                    <>
                      <div className="mt-1 h-6 w-24 animate-pulse rounded bg-slate-200" />
                      <div className="mt-1.5 h-3 w-16 animate-pulse rounded bg-slate-200" />
                    </>
                  ) : (
                    <>
                      <p className={cn("font-lexend mt-0.5 text-xl font-bold truncate", panel.textColor)}>
                        {panel.balance}
                      </p>
                      <p className="font-inter mt-0.5 text-[10px] font-medium text-slate-400">
                        {panel.total} Due Accounts
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-4 rounded-sm border border-gray-200 bg-white p-4 shadow-sm print:hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, TIN, or barangay..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="w-full rounded-lg border border-gray-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-gray-100">
            <Clock className="h-4 w-4 text-slate-400" />
            {totalCount} Delinquent Accounts Found
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden print:hidden">
        <TableContainer className="border-none shadow-none rounded-none w-full">
          <Table zebra className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] min-w-[50px] sticky left-0 z-20 bg-gray-50 shadow-[1px_0_0_0_#e5e7eb]">
                  #
                </TableHead>
                <TableHead className="w-[250px] min-w-[250px] sticky left-[50px] z-20 bg-gray-50 shadow-[1px_0_0_0_#e5e7eb]">
                  Taxpayer Name
                </TableHead>
                <TableHead className="w-[120px] min-w-[120px]">
                  TIN
                </TableHead>
                <TableHead className="w-[200px] min-w-[200px]">
                  Barangay
                </TableHead>
                <TableHead className="w-[100px] min-w-[100px]" align="center">
                  Prop.
                </TableHead>
                <TableHead className="w-[150px] min-w-[150px]" align="center">
                  Aging Bucket
                </TableHead>
                <TableHead className="w-[150px] min-w-[150px]" align="right">
                  Total Due
                </TableHead>
                <TableHead className="w-[80px] min-w-[80px] sticky right-0 z-20 bg-gray-50 shadow-[-1px_0_0_0_#e5e7eb]" align="center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell className="w-[50px] min-w-[50px] sticky left-0 z-10 bg-white [tr:nth-child(even)_&]:bg-slate-50 shadow-[1px_0_0_0_#e5e7eb]">
                      <div className="h-4 w-6 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[250px] min-w-[250px] max-w-[250px] sticky left-[50px] z-10 bg-white [tr:nth-child(even)_&]:bg-slate-50 shadow-[1px_0_0_0_#e5e7eb]">
                      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[120px] min-w-[120px]">
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[200px] min-w-[200px]">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[100px] min-w-[100px]" align="center">
                      <div className="mx-auto h-4 w-6 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[150px] min-w-[150px]" align="center">
                      <div className="mx-auto h-5 w-16 animate-pulse rounded-full bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[150px] min-w-[150px]" align="right">
                      <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[80px] min-w-[80px] sticky right-0 z-10 bg-white [tr:nth-child(even)_&]:bg-slate-50 shadow-[-1px_0_0_0_#e5e7eb]" align="center">
                      <div className="mx-auto h-8 w-8 animate-pulse rounded-lg bg-slate-200" />
                    </TableCell>
                  </TableRow>
                ))
              ) : delinquents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-slate-400"
                  >
                    No delinquent accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                delinquents.map((t, i) => (
                  <TableRow key={t.id}>
                    <TableCell className="w-[50px] min-w-[50px] sticky left-0 z-10 bg-white [tr:nth-child(even)_&]:bg-slate-50 group-hover:bg-gray-50! shadow-[1px_0_0_0_#e5e7eb]">
                      {pagination.pageIndex * pagination.pageSize + i + 1}
                    </TableCell>
                    <TableCell className="w-[250px] min-w-[250px] max-w-[250px] sticky left-[50px] z-10 bg-white [tr:nth-child(even)_&]:bg-slate-50 group-hover:bg-gray-50! shadow-[1px_0_0_0_#e5e7eb] font-medium text-slate-700 truncate">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{t.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[120px] min-w-[120px] text-xs font-mono text-slate-500 truncate">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{t.tin || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[200px] min-w-[200px] truncate">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{t.barangay_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[100px] min-w-[100px] font-medium text-slate-500" align="center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{t.property_count}</span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[150px] min-w-[150px]" align="center">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${bucketColors[t.bucket]}`}>
                        {t.bucket}
                      </span>
                    </TableCell>
                    <TableCell className="w-[150px] min-w-[150px] font-semibold text-slate-900" align="right">
                      {t.total_due}
                    </TableCell>
                    <TableCell className="w-[80px] min-w-[80px] sticky right-0 z-10 bg-white [tr:nth-child(even)_&]:bg-slate-50 group-hover:bg-gray-50! shadow-[-1px_0_0_0_#e5e7eb]" align="center">
                      <button
                        onClick={() => {
                          setSelectedDelinquent(t);
                          setIsDetailsOpen(true);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 bg-white w-full shrink-0">
          <p className="font-inter text-xs text-slate-400">
            Showing Page {pagination.pageIndex + 1} of {totalPages} ({totalCount} total)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }))}
              disabled={pagination.pageIndex === 0}
              className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-inter px-2 text-xs text-slate-500">
              Page {pagination.pageIndex + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1) }))}
              disabled={pagination.pageIndex >= totalPages - 1}
              className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md bg-white p-6 shadow-xl rounded-xl border border-slate-200">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-lexend text-lg text-slate-800 flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              Taxpayer Details
            </DialogTitle>
          </DialogHeader>

          {selectedDelinquent && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 divide-y divide-slate-100">
                <div className="pt-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Full Name
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    {selectedDelinquent.full_name}
                  </p>
                </div>

                <div className="pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    TIN
                  </p>
                  <p className="text-sm font-mono text-slate-700 mt-0.5">
                    {selectedDelinquent.tin}
                  </p>
                </div>

                <div className="pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Barangay
                  </p>
                  <p className="text-sm text-slate-700 mt-0.5">
                    {selectedDelinquent.barangay_name}
                  </p>
                </div>

                <div className="pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Properties Count
                  </p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">
                    {selectedDelinquent.property_count} Registered Properties
                  </p>
                </div>

                <div className="pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Delinquency Age
                  </p>
                  <div className="mt-1 flex items-center">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${bucketColors[selectedDelinquent.bucket]}`}
                    >
                      {selectedDelinquent.bucket}
                    </span>
                  </div>
                </div>

                <div className="pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Total Outstanding Due
                  </p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">
                    {selectedDelinquent.total_due}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end pt-4 border-t border-slate-50">
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
