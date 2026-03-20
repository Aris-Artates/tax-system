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
  User2,
  Tag,
  Hash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

export default function IncomingDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<ListedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [viewDoc, setViewDoc] = useState<ListedDocument | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
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

  useEffect(() => {
    fetchDocuments();
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "referenceNo",
        header: "Reference No.",
        cell: ({ row }: any) => (
          <div className="font-mono text-sm font-medium">
            #{row.original.referenceNo}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Document Type",
        cell: ({ row }: any) => (
          <span className="text-sm">{row.original.type}</span>
        ),
      },
      {
        accessorKey: "sender",
        header: "Sender",
        cell: ({ row }: any) => (
          <div className="text-sm">{row.original.sender}</div>
        ),
      },
      {
        accessorKey: "receivedDate",
        header: "Received",
        cell: ({ row }: any) => (
          <div className="text-xs text-slate-500">
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
            : status === "Reviewed"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-slate-50 text-slate-800 border-slate-200";
          return (
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${color}`}
            >
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

  const table = useReactTable({
    data: documents,
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

            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search documents, senders, or reference numbers..."
                className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-sm font-inter outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          <TableContainer>
            <Table className="min-w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        align={header.id === "actions" ? "right" : "left"}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-slate-400"
                    >
                      Loading incoming documents...
                    </TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-slate-400"
                    >
                      No incoming documents found.
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-slate-400"
                    >
                      No documents match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

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

function StatusBadge({ status }: { status: string }) {
  const color = status.includes("Pending")
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : status === "Reviewed"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : "bg-slate-50 text-slate-800 border-slate-200";

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {status}
    </span>
  );
}
