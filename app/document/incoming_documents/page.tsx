"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Forward,
  Archive,
  CalendarDays,
  Tag,
  Hash,
  Clock,
  FileCheck,
  User2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/table";

type ApiIncomingDocument = {
  id: number;
  reference_no: string;
  type: string;
  sender: string;
  received_date: string;
  status: string;
};

type ListedDocument = {
  key: string;
  id: number;
  referenceNo: string;
  type: string;
  sender: string;
  receivedDate: string;
  status: string;
};

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Reviewed", label: "Reviewed" },
  { value: "Archived", label: "Archived" },
];

const CLASSIFICATION_OPTIONS = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Agricultural", label: "Agricultural" },
  { value: "Industrial", label: "Industrial" },
  { value: "Special", label: "Special" },
];

export default function IncomingDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<ListedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [viewDoc, setViewDoc] = useState<ListedDocument | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [barangayOptions, setBarangayOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const response = await fetch("/api/documents/incoming/list", {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        documents?: ApiIncomingDocument[];
      };

      if (!response.ok || !data.documents) {
        setDocuments([]);
        return;
      }

      // Map to listed format
      const mapped = data.documents.map(
        (doc): ListedDocument => ({
          key: `doc-${doc.id}`,
          id: doc.id,
          referenceNo: doc.reference_no,
          type: doc.type,
          sender: doc.sender,
          receivedDate: new Date(doc.received_date).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          ),
          status: doc.status,
        }),
      );

      setDocuments(mapped);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to load incoming documents");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: documents.length,
      pending: documents.filter((d) => d.status.includes("Pending")).length,
      filed: documents.filter(
        (d) => d.status === "Filed" || d.status === "Reviewed",
      ).length,
      archived: documents.filter((d) => d.status === "Archived").length,
    };
  }, [documents]);

  useEffect(() => {
    fetchDocuments();

    // Fetch barangays for filter
    fetch("/api/barangays/list")
      .then((res) => res.json())
      .then((data) => {
        const decoded = data._data
          ? JSON.parse(atob(atob(atob(data._data))))
          : (data.barangays ?? []);
        if (Array.isArray(decoded)) {
          setBarangayOptions(
            decoded.map((b: any) => ({ value: String(b.id), label: b.name })),
          );
        }
      })
      .catch((err) => console.error("Failed to load barangays", err));
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "referenceNo",
        header: "Reference No.",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1.5 font-mono text-sm font-medium text-slate-700">
            <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0" />#
            {row.original.referenceNo}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Document Type",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Tag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {row.original.type}
          </div>
        ),
      },
      {
        accessorKey: "sender",
        header: "Sender",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <User2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {row.original.sender}
          </div>
        ),
      },
      {
        accessorKey: "receivedDate",
        header: "Received",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {row.original.receivedDate}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => {
          const status = row.original.status;
          const color = status.includes("Pending")
            ? "bg-amber-50 text-amber-800 border-amber-200"
            : status === "Reviewed" || status === "Filed"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-slate-50 text-slate-800 border-slate-200";
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                color,
              )}
            >
              {status.includes("Pending") ? (
                <Clock className="h-3 w-3" />
              ) : status === "Reviewed" || status === "Filed" ? (
                <FileCheck className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }: any) => (
          <div className="flex justify-end gap-1">
            <button
              title="View Details"
              onClick={() => setViewDoc(row.original)}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              title="Assign/Route"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-slate-600 hover:bg-gray-50 transition-colors"
            >
              <Forward className="h-4 w-4" />
            </button>
            <button
              title="Archive"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-slate-600 hover:bg-gray-50 transition-colors"
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesStatus = statusFilter ? doc.status === statusFilter : true;
      const matchesClass = classificationFilter
        ? doc.type === classificationFilter
        : true;
      const matchesBarangay = barangayFilter
        ? (doc as any).barangay === barangayFilter
        : true;
      return matchesStatus && matchesClass && matchesBarangay;
    });
  }, [documents, statusFilter, classificationFilter, barangayFilter]);

  const table = useReactTable({
    data: filteredDocuments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      globalFilter,
    },
  });

  const handleBack = () => router.push("/document");

  return (
    <div className="flex w-full overflow-x-hidden">
      <main className="flex-1 w-full">
        <header className="mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="font-lexend mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
                Incoming Documents
              </h1>
              <p className="font-inter mt-1 text-xs text-slate-400">
                View and manage newly received documents and requests
              </p>
            </div>
          </div>
        </header>
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 whitespace-nowrap">
          {[
            {
              label: "Total Documents",
              value: stats.total,
              color: "text-[#0F172A]",
              bgColor: "bg-slate-100",
              iconColor: "text-slate-600",
              icon: FileText,
            },
            {
              label: "Pending Review",
              value: stats.pending,
              color: "text-blue-700",
              bgColor: "bg-blue-50",
              iconColor: "text-blue-600",
              icon: Clock,
            },
            {
              label: "Filed / Reviewed",
              value: stats.filed,
              color: "text-amber-700",
              bgColor: "bg-amber-50",
              iconColor: "text-amber-600",
              icon: FileCheck,
            },
            {
              label: "Archived",
              value: stats.archived,
              color: "text-emerald-700",
              bgColor: "bg-emerald-50",
              iconColor: "text-emerald-600",
              icon: Archive,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                    s.bgColor,
                  )}
                >
                  <s.icon
                    className={cn("h-5 w-5", s.iconColor)}
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="font-inter text-xs font-medium text-slate-500">
                    {s.label}
                  </p>
                  {isLoading ? (
                    <Skeleton className="mt-1.5 h-6 w-16" />
                  ) : (
                    <p
                      className={cn(
                        "font-lexend mt-0.5 text-xl font-bold",
                        s.color,
                      )}
                    >
                      {s.value}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative flex-1 min-w-45 max-w-xs">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={13}
              />
              <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search documents, senders, or reference numbers..."
                className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-sm font-inter outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <div className="min-w-35">
              <Combobox
                placeholder="All Statuses"
                searchPlaceholder="Search status..."
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={setStatusFilter}
                triggerClassName="rounded-sm text-xs py-1.5 text-slate-500"
              />
            </div>
          </div>
        </div>

        <section className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <FileText className="h-5 w-5 text-[#00154A]" />
              </div>
              <h2 className="font-lexend text-sm font-semibold text-[#848794]">
                Incoming Queue
              </h2>
            </div>
          </div>

          <div className="rounded-sm border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden print:hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-inter text-[#595a5d] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide">
                <thead className="bg-slate-50 text-xs border-b border-gray-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className={cn(
                            "px-4 py-3 whitespace-nowrap",
                            header.id === "referenceNo" &&
                              "sticky left-0 z-20 bg-slate-50 shadow-[1px_0_0_0_#e2e8f0] w-[180px] min-w-[180px]",
                            header.id === "actions" &&
                              "sticky right-0 z-20 bg-slate-50 shadow-[-1px_0_0_0_#e2e8f0] w-[120px] min-w-[120px] text-right",
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="text-xs">
                  {isLoading ? (
                    <IncomingDocumentsSkeleton />
                  ) : documents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-slate-400"
                      >
                        No incoming documents found.
                      </td>
                    </tr>
                  ) : table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-slate-400"
                      >
                        No documents match your search.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="group border-b border-gray-100 even:bg-slate-50 hover:bg-slate-100/80 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={cn(
                              "px-4 py-3 whitespace-nowrap",
                              cell.column.id === "referenceNo" &&
                                "sticky left-0 z-10 bg-white [tr:nth-child(even)_&]:bg-slate-50 group-hover:bg-slate-100/80 shadow-[1px_0_0_0_#f1f5f9]",
                              cell.column.id === "actions" &&
                                "sticky right-0 z-10 bg-white [tr:nth-child(even)_&]:bg-slate-50 group-hover:bg-slate-100/80 shadow-[-1px_0_0_0_#f1f5f9] text-right",
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!isLoading && documents.length > 0 && (
            <div className="flex items-center justify-between px-2 mt-4">
              <div className="font-inter text-xs text-slate-500">
                Page{" "}
                <span className="font-medium text-slate-900">
                  {table.getState().pagination.pageIndex + 1}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-900">
                  {table.getPageCount()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="inline-flex h-8 items-center rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft className="mr-1 h-3 w-3" />
                  Previous
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="inline-flex h-8 items-center rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  Next
                  <ChevronRight className="ml-1 h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* View Document Dialog */}
      <Dialog
        open={!!viewDoc}
        onOpenChange={(open) => {
          if (!open) setViewDoc(null);
        }}
      >
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-lexend text-lg font-bold text-[#595a5d]">
              Document Details
            </DialogTitle>
            <DialogDescription className="font-inter text-xs text-slate-400">
              Full information for this incoming document.
            </DialogDescription>
          </DialogHeader>

          {viewDoc && (
            <div className="mt-2 space-y-4">
              {/* Status badge */}
              <StatusBadge status={viewDoc.status} />

              {/* Reference & Date */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="font-inter mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Reference No.
                  </p>
                  <p className="font-mono font-bold text-sm text-slate-700 flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-slate-400" />
                    {viewDoc.referenceNo}
                  </p>
                </div>
                <div>
                  <p className="font-inter mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date Received
                  </p>
                  <p className="font-inter text-sm text-slate-700 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    {viewDoc.receivedDate}
                  </p>
                </div>
              </div>

              {/* Type & Sender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-inter mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Document Type
                  </p>
                  <p className="font-inter text-sm text-slate-700 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-slate-400" />
                    {viewDoc.type}
                  </p>
                </div>
                <div>
                  <p className="font-inter mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Sender
                  </p>
                  <p className="font-inter text-sm text-slate-700 flex items-center gap-1.5">
                    <User2 className="h-3.5 w-3.5 text-slate-400" />
                    {viewDoc.sender}
                  </p>
                </div>
              </div>

              {/* Close */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewDoc(null)}
                  className="font-inter rounded-md border border-gray-200 px-4 py-2 text-xs text-slate-600 hover:bg-gray-50 transition cursor-pointer"
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

function IncomingDocumentsSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <tr
          key={i}
          className="animate-pulse border-b border-gray-100 even:bg-slate-50/50"
        >
          <td className="sticky left-0 z-10 bg-white [tr:nth-child(even)_&]:bg-slate-50/50 shadow-[1px_0_0_0_#f1f5f9] px-4 py-4">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="px-4 py-4">
            <Skeleton className="h-4 w-32" />
          </td>
          <td className="px-4 py-4">
            <Skeleton className="h-4 w-40" />
          </td>
          <td className="px-4 py-4">
            <Skeleton className="h-3 w-28" />
          </td>
          <td className="px-4 py-4">
            <Skeleton className="h-5 w-20 rounded-full" />
          </td>
          <td className="sticky right-0 z-10 bg-white [tr:nth-child(even)_&]:bg-slate-50/50 shadow-[-1px_0_0_0_#f1f5f9] px-4 py-4">
            <div className="flex justify-end gap-1">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-8 w-8 rounded" />
              ))}
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = status.includes("Pending")
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : status === "Reviewed"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : "bg-slate-50 text-slate-800 border-slate-200";

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}
    >
      {status}
    </span>
  );
}
