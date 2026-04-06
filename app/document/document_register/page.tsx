"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Eye,
  Printer,
  FileText,
  Inbox,
  Clock,
  Archive,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CalendarDays,
  User2,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DocumentRegisterPrint } from "@/components/print/DocumentRegisterPrint";
import { RegisterDocumentModal } from "@/components/document/RegisterDocumentModal";
import { toast } from "sonner";

import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
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

const CATEGORY_OPTIONS: ComboboxOption[] = [
  { value: "All", label: "All Categories" },
  { value: "Legal", label: "Legal Documents" },
  { value: "Administrative", label: "Administrative" },
  { value: "Financial", label: "Financial Reports" },
  { value: "Correspondence", label: "Correspondence" },
  { value: "Taxation", label: "Taxation Records" },
];

const STATUS_OPTIONS: ComboboxOption[] = [
  { value: "All", label: "All Statuses" },
  { value: "Received", label: "Received" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Archived", label: "Archived" },
];

type Document = {
  id: string;
  refNumber: string;
  date: string;
  subject: string;
  category: string;
  origin: string;
  status: "Received" | "Pending" | "Approved" | "Archived";
};

export default function DocumentRegisterPage() {
  console.log("DocumentRegisterPage component mounting...");
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [printDoc, setPrintDoc] = useState<Document | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    console.log("Fetching documents from API...");
    try {
      const response = await fetch("/api/documents/register/list");
      const data = await response.json();

      console.log("API Response:", data);

      if (response.ok) {
        // Map snake_case to camelCase
        const mappedDocs = (data.documents || []).map((doc: any) => ({
          id: doc.id,
          refNumber: doc.ref_number,
          date: doc.date_received,
          subject: doc.subject,
          category: doc.category,
          origin: doc.origin,
          status: doc.status,
        }));
        console.log("Mapped Documents:", mappedDocs);
        setDocuments(mappedDocs);
      } else {
        console.error("API error:", data.error);
        toast.error(data.error || "Failed to fetch documents.");
      }
    } catch (error) {
      console.error("Network or parsing error:", error);
      toast.error("A network error occurred while fetching documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handlePrint = () => window.print();

  const handleRegisterSuccess = (newDoc: Document) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  // Pre-filter the data before passing it to TanStack table
  const filteredItems = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.refNumber.toLowerCase().includes(search.toLowerCase()) ||
        doc.subject.toLowerCase().includes(search.toLowerCase()) ||
        doc.origin.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || doc.category === categoryFilter;
      const matchesStatus =
        statusFilter === "All" || doc.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, categoryFilter, statusFilter, documents]);

  const stats = useMemo(() => {
    return [
      {
        label: "Total Documents",
        count: documents.length,
        icon: <FileText className="h-5 w-5 text-blue-600" />,
        bgColor: "bg-blue-50",
      },
      {
        label: "Pending Action",
        count: documents.filter((d) => d.status === "Pending").length,
        icon: <Clock className="h-5 w-5 text-amber-600" />,
        bgColor: "bg-amber-50",
      },
      {
        label: "Recently Received",
        count: documents.filter((d) => d.status === "Received").length,
        icon: <Inbox className="h-5 w-5 text-emerald-600" />,
        bgColor: "bg-emerald-50",
      },
      {
        label: "Archived Records",
        count: documents.filter((d) => d.status === "Archived").length,
        icon: <Archive className="h-5 w-5 text-slate-600" />,
        bgColor: "bg-slate-50",
      },
    ];
  }, [documents]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "refNumber",
        header: "Reference No.",
        cell: ({ row }: any) => (
          <div className="font-mono font-bold text-slate-700 text-[8.5px]">
            {row.original.refNumber}
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: "Date Received",
        cell: ({ row }: any) => (
          <div className="text-xs text-slate-500">{row.original.date}</div>
        ),
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }: any) => (
          <div className="text-sm text-slate-700 max-w-xs truncate">
            {row.original.subject}
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }: any) => (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: "origin",
        header: "Origin/Sender",
        cell: ({ row }: any) => (
          <div className="text-sm text-slate-500">{row.original.origin}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => {
          const status = row.original.status;
          const color =
            status === "Approved"
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : status === "Pending"
                ? "bg-amber-50 text-amber-600 border-amber-100"
                : status === "Received"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : "bg-slate-100 text-slate-500 border-slate-200";

          const dotColor =
            status === "Approved"
              ? "bg-emerald-500"
              : status === "Pending"
                ? "bg-amber-500"
                : status === "Received"
                  ? "bg-blue-500"
                  : "bg-slate-400";

          return (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}
            >
              <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dotColor}`} />
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
              title="Print Document"
              onClick={() => setPrintDoc(row.original)}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-slate-400 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-colors"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [setViewDoc, setPrintDoc],
  );

  const table = useReactTable({
    data: filteredItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleBack = () => router.push("/document");

  return (
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
              Document Register
            </h1>
            <p className="font-inter mt-1 text-xs text-slate-400">
              Manage and track all official documents and correspondence
            </p>
          </div>
          <button
            className="font-inter inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800"
            onClick={() => setIsRegisterModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Register New Document
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="font-inter text-xs font-medium uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
              <p className="font-lexend text-xl font-bold text-[#595a5d]">
                {stat.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      <section className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {/* Controls */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Reference #, Subject, or Origin..."
              className="font-inter w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-slate-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Combobox
              options={CATEGORY_OPTIONS}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="Filter by Category"
              triggerClassName="w-[180px] rounded-md text-xs border-gray-200"
            />
            <Combobox
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by Status"
              triggerClassName="w-[150px] rounded-md text-xs border-gray-200"
            />
            <button
              title="Refresh Data"
              onClick={fetchDocuments}
              disabled={loading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-slate-500 hover:bg-slate-50 transition">
              <ArrowUpDown className="h-4 w-4" />
            </button>
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
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center font-inter italic text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
                      Loading documents...
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center font-inter italic text-slate-400"
                  >
                    No documents found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group hover:bg-slate-50 transition-colors"
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

        {/* Pagination */}
        {filteredItems.length > 0 && (
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
              Full information for this registered document.
            </DialogDescription>
          </DialogHeader>

          {viewDoc && (
            <div className="mt-2 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <StatusBadge status={viewDoc.status} />
              </div>

              {/* Reference & Date */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="font-inter mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Reference No.
                  </p>
                  <p className="font-mono font-bold text-sm text-slate-700">
                    {viewDoc.refNumber}
                  </p>
                </div>
                <div>
                  <p className="font-inter mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date Received
                  </p>
                  <p className="font-inter text-sm text-slate-700 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    {viewDoc.date}
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <p className="font-inter mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Subject / Title
                </p>
                <p className="font-inter text-sm text-slate-700 leading-relaxed">
                  {viewDoc.subject}
                </p>
              </div>

              {/* Category & Origin */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-inter mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Category
                  </p>
                  <p className="font-inter text-sm text-slate-700 flex items-center gap-1.5">
                    <FolderOpen className="h-3.5 w-3.5 text-slate-400" />
                    {viewDoc.category}
                  </p>
                </div>
                <div>
                  <p className="font-inter mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Origin / Sender
                  </p>
                  <p className="font-inter text-sm text-slate-700 flex items-center gap-1.5">
                    <User2 className="h-3.5 w-3.5 text-slate-400" />
                    {viewDoc.origin}
                  </p>
                </div>
              </div>

              {/* Close Button */}
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

      {/* Hidden DocumentRegisterPrint mount — invisible on screen, full-page at print time via @media print CSS */}
      {printDoc && (
        <div className="sr-only print:not-sr-only">
          <DocumentRegisterPrint
            data={{
              refNumber: printDoc.refNumber,
              date: printDoc.date,
              subject: printDoc.subject,
              category: printDoc.category,
              origin: printDoc.origin,
              status: printDoc.status,
              // TODO: pass real remarks / officer names when data is available
            }}
          />
        </div>
      )}

      {/* Print Confirmation Dialog — slim, just shows the document and triggers print */}
      <Dialog
        open={!!printDoc}
        onOpenChange={(open) => {
          if (!open) setPrintDoc(null);
        }}
      >
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="font-lexend text-base font-bold text-[#595a5d]">
              Print Document
            </DialogTitle>
            <DialogDescription className="font-inter text-xs text-slate-400">
              The print dialog will open with a full A4 document layout.
            </DialogDescription>
          </DialogHeader>

          {printDoc && (
            <div className="mt-1 space-y-4">
              {/* Document summary card */}
              <div className="rounded-lg border border-gray-100 bg-slate-50 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-mono text-xs font-bold text-slate-700">
                    {printDoc.refNumber}
                  </p>
                  <StatusBadge status={printDoc.status} />
                </div>
                <p className="font-inter text-xs text-slate-600 leading-relaxed">
                  {printDoc.subject}
                </p>
                <p className="font-inter text-[10px] text-slate-400">
                  {printDoc.category} · {printDoc.origin} · {printDoc.date}
                </p>
              </div>

              <p className="font-inter text-[11px] text-slate-400 leading-relaxed">
                Clicking <strong className="text-slate-600">Print</strong> will
                open the browser&apos;s print dialog with the full official
                document layout. Use <em>Save as PDF</em> in the dialog to
                download.
              </p>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPrintDoc(null)}
                  className="font-inter rounded-md border border-gray-200 px-4 py-2 text-xs text-slate-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="font-inter inline-flex items-center gap-2 rounded-md bg-[#0F172A] px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RegisterDocumentModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleRegisterSuccess}
      />
    </main>
  );
}

function StatusBadge({ status }: { status: Document["status"] }) {
  const color =
    status === "Approved"
      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
      : status === "Pending"
        ? "bg-amber-50 text-amber-600 border-amber-100"
        : status === "Received"
          ? "bg-blue-50 text-blue-600 border-blue-100"
          : "bg-slate-100 text-slate-500 border-slate-200";

  const dotColor =
    status === "Approved"
      ? "bg-emerald-500"
      : status === "Pending"
        ? "bg-amber-500"
        : status === "Received"
          ? "bg-blue-500"
          : "bg-slate-400";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}
