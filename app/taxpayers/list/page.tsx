"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  Plus,
  SquarePen,
  Trash2,
  Archive,
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { VALIDATORS } from "@/components/ui/validators";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/table";

const OWNER_TYPE_OPTIONS: ComboboxOption[] = [
  { value: "Individual", label: "Individual" },
  { value: "Corporate", label: "Corporate" },
  { value: "Government", label: "Government" },
];

const STATUS_FILTER_OPTIONS: ComboboxOption[] = [
  { value: "Active", label: "Active" },
  { value: "Archived", label: "Archived" },
  { value: "__all__", label: "All Statuses" },
];

const SUFFIX_OPTIONS: ComboboxOption[] = [
  { value: "Jr.", label: "Jr." },
  { value: "Sr.", label: "Sr." },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
  { value: "V", label: "V" },
];

type Taxpayer = {
  id: number | string;
  owner_name: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  tin: string | null;
  address: string | null;
  barangay_id?: number | null;
  address_details?: string | null;
  owner_type: string | null;
  status?: string | null;
  phone: string | null;
  email: string | null;
};

type BarangayOption = {
  id: number;
  name: string;
};

const PAGE_SIZE = 20;

export default function TaxpayerListPage() {
  const router = useRouter();

  const [taxpayers, setTaxpayers] = useState<Taxpayer[]>([]);
  const [barangays, setBarangays] = useState<BarangayOption[]>([]);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [page, setPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editingTaxpayer, setEditingTaxpayer] = useState<Taxpayer | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    tin: "",
    owner_type: "",
    barangay_id: "",
    address_details: "",
    phone: "",
    email: "",
  });
  const [initialForm, setInitialForm] = useState<typeof editForm | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: "archive" | "delete" | "restore" | null;
    taxpayer: Taxpayer | null;
  }>({ isOpen: false, type: null, taxpayer: null });

  const updateField = (
    field: keyof typeof editForm,
    value: any,
    isValid?: boolean,
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (isValid !== undefined) {
      setValidationErrors((prev) => ({ ...prev, [field]: !isValid }));
    }
  };

  const hasFormChanges = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(editForm) !== JSON.stringify(initialForm);
  }, [editForm, initialForm]);

  useEffect(() => {
    const fetchTaxpayers = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/taxpayers/list", { cache: "no-store" });
        const data = (await res.json()) as { taxpayers?: Taxpayer[] };
        setTaxpayers(data.taxpayers ?? []);
      } catch {
        setTaxpayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaxpayers();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchBarangays = async () => {
      setIsLoadingBarangays(true);
      try {
        const res = await fetch("/api/barangays/list", { cache: "no-store" });
        const data = (await res.json()) as { barangays?: BarangayOption[] };

        if (!res.ok) {
          if (isMounted) setBarangays([]);
          return;
        }

        if (isMounted) {
          setBarangays(data.barangays ?? []);
        }
      } catch {
        if (isMounted) setBarangays([]);
      } finally {
        if (isMounted) setIsLoadingBarangays(false);
      }
    };

    fetchBarangays();

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return taxpayers.filter((t) => {
      const normalizedOwnerType =
        t.owner_type === "Corporation" ? "Corporate" : t.owner_type;
      const normalizedStatus =
        t.status?.trim() === "Archived" ? "Archived" : "Active";
      const matchSearch =
        !q ||
        t.owner_name.toLowerCase().includes(q) ||
        (t.tin ?? "").toLowerCase().includes(q) ||
        (t.address ?? "").toLowerCase().includes(q);
      const matchType = !typeFilter || normalizedOwnerType === typeFilter;
      const matchStatus =
        statusFilter === "__all__" || normalizedStatus === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [taxpayers, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value || "Active");
    setPage(1);
  };

  const normalizedOwnerTypeCount = useMemo(() => {
    return taxpayers.reduce(
      (acc, taxpayer) => {
        const normalizedType =
          taxpayer.owner_type === "Corporation"
            ? "Corporate"
            : taxpayer.owner_type;

        if (normalizedType === "Individual") acc.Individual += 1;
        if (normalizedType === "Corporate") acc.Corporate += 1;
        if (normalizedType === "Government") acc.Government += 1;

        return acc;
      },
      { Individual: 0, Corporate: 0, Government: 0 },
    );
  }, [taxpayers]);

  const barangayOptions = useMemo<ComboboxOption[]>(
    () =>
      barangays.map((barangay) => ({
        value: String(barangay.id),
        label: barangay.name,
      })),
    [barangays],
  );

  const handleOpenEditModal = (taxpayer: Taxpayer) => {
    setEditingTaxpayer(taxpayer);

    const fallbackBarangayId =
      taxpayer.barangay_id != null ? String(taxpayer.barangay_id) : "";
    const fallbackAddressDetails =
      taxpayer.address_details ?? taxpayer.address ?? "";

    const formValues = {
      first_name: taxpayer.first_name ?? "",
      middle_name: taxpayer.middle_name ?? "",
      last_name: taxpayer.last_name ?? "",
      suffix: taxpayer.suffix ?? "",
      tin: taxpayer.tin ?? "",
      owner_type:
        taxpayer.owner_type === "Corporation"
          ? "Corporate"
          : (taxpayer.owner_type ?? ""),
      barangay_id: fallbackBarangayId,
      address_details: fallbackAddressDetails,
      phone: taxpayer.phone ?? "",
      email: taxpayer.email ?? "",
    };

    setEditForm(formValues);
    setInitialForm(formValues);
    setValidationErrors({});
    setIsEditModalOpen(true);
  };

  const handleSaveTaxpayer = async () => {
    if (!editingTaxpayer) return;

    const updatedFirstName = editForm.first_name.trim();
    const updatedLastName = editForm.last_name.trim();
    if (
      Object.values(validationErrors).some((v) => v) ||
      !updatedFirstName ||
      !updatedLastName
    )
      return;

    const updatedOwnerName = [
      updatedFirstName,
      editForm.middle_name.trim(),
      updatedLastName,
      editForm.suffix.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    setIsSavingEdit(true);

    try {
      const res = await fetch("/api/taxpayers/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingTaxpayer.id,
          first_name: updatedFirstName,
          middle_name: editForm.middle_name.trim() || null,
          last_name: updatedLastName,
          suffix: editForm.suffix.trim() || null,
          owner_name: updatedOwnerName,
          tin: editForm.tin.trim() || null,
          owner_type: editForm.owner_type,
          barangay_id: Number(editForm.barangay_id),
          address_details: editForm.address_details.trim(),
          phone: editForm.phone.trim() || null,
          email: editForm.email.trim() || null,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        taxpayer?: Taxpayer;
      };

      if (!res.ok || !data.taxpayer) {
        toast.error(data.error ?? "Failed to update taxpayer.");
        return;
      }

      setTaxpayers((prev) =>
        prev.map((taxpayer) =>
          String(taxpayer.id) === String(editingTaxpayer.id)
            ? data.taxpayer!
            : taxpayer,
        ),
      );

      toast.success("Taxpayer updated successfully.");
      setIsEditModalOpen(false);
      setEditingTaxpayer(null);
      setInitialForm(null);
    } catch {
      toast.error("Unable to connect to server.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleArchiveClick = (taxpayer: Taxpayer) => {
    setConfirmState({ isOpen: true, type: "archive", taxpayer });
  };

  const handleConfirmArchive = async () => {
    const { taxpayer } = confirmState;
    if (!taxpayer) return;

    setConfirmState({ isOpen: false, type: null, taxpayer: null });

    try {
      const res = await fetch("/api/taxpayers/archive", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: taxpayer.id }),
      });

      const data = (await res.json()) as {
        error?: string;
        taxpayer?: Taxpayer;
      };

      if (!res.ok || !data.taxpayer) {
        toast.error(data.error ?? "Failed to archive taxpayer.");
        return;
      }

      setTaxpayers((prev) =>
        prev.map((currentTaxpayer) =>
          String(currentTaxpayer.id) === String(taxpayer.id)
            ? data.taxpayer!
            : currentTaxpayer,
        ),
      );

      toast.success("Taxpayer archived successfully.");
    } catch {
      toast.error("Unable to connect to server.");
    }
  };

  const handleDeleteClick = (taxpayer: Taxpayer) => {
    setConfirmState({ isOpen: true, type: "delete", taxpayer });
  };

  const handleConfirmDelete = async () => {
    const { taxpayer } = confirmState;
    if (!taxpayer) return;

    setConfirmState({ isOpen: false, type: null, taxpayer: null });

    try {
      const res = await fetch("/api/taxpayers/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: taxpayer.id }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete taxpayer.");
        return;
      }

      setTaxpayers((prev) =>
        prev.filter(
          (currentTaxpayer) =>
            String(currentTaxpayer.id) !== String(taxpayer.id),
        ),
      );

      toast.success("Taxpayer deleted successfully.");
    } catch {
      toast.error("Unable to connect to server.");
    }
  };

  const handleRestoreClick = (taxpayer: Taxpayer) => {
    setConfirmState({ isOpen: true, type: "restore", taxpayer });
  };

  const handleConfirmRestore = async () => {
    const { taxpayer } = confirmState;
    if (!taxpayer) return;

    setConfirmState({ isOpen: false, type: null, taxpayer: null });

    try {
      const res = await fetch("/api/taxpayers/restore", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: taxpayer.id }),
      });

      const data = (await res.json()) as {
        error?: string;
        taxpayer?: Taxpayer;
      };

      if (!res.ok || !data.taxpayer) {
        toast.error(data.error ?? "Failed to restore taxpayer.");
        return;
      }

      setTaxpayers((prev) =>
        prev.map((currentTaxpayer) =>
          String(currentTaxpayer.id) === String(taxpayer.id)
            ? data.taxpayer!
            : currentTaxpayer,
        ),
      );

      toast.success("Taxpayer restored successfully.");
    } catch {
      toast.error("Unable to connect to server.");
    }
  };

  const getTaxpayerStatus = (taxpayer: Taxpayer) =>
    taxpayer.status?.trim() === "Archived" ? "Archived" : "Active";

  const ownerTypeColor: Record<string, string> = {
    Individual: "bg-blue-50 text-blue-700",
    Corporate: "bg-amber-50 text-amber-700",
    Corporation: "bg-amber-50 text-amber-700",
    Government: "bg-emerald-50 text-emerald-700",
  };

  const statusColor: Record<string, string> = {
    Active: "bg-sky-50 text-sky-700",
    Archived: "bg-slate-100 text-slate-700",
  };

  return (
    <>
      <div className="w-full">
        <button
          type="button"
          onClick={() => router.push("/taxpayers")}
          className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Taxpayer Records
        </button>

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
              Taxpayer Master List
            </h1>
            <p className="font-inter mt-1 text-xs text-slate-400">
              All Registered Taxpayers – Municipality of Sta. Rita, Samar
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/taxpayers/register")}
            className="font-inter inline-flex cursor-pointer items-center gap-2 rounded bg-[#0f1729] px-4 py-2 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Register Taxpayer
          </button>
        </header>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              label: "Total Taxpayers",
              value: isLoading ? "—" : taxpayers.length.toLocaleString(),
              color: "text-[#595a5d]",
            },
            {
              label: "Individual",
              value: isLoading
                ? "—"
                : normalizedOwnerTypeCount.Individual.toLocaleString(),
              color: "text-blue-600",
            },
            {
              label: "Corporate",
              value: isLoading
                ? "—"
                : normalizedOwnerTypeCount.Corporate.toLocaleString(),
              color: "text-amber-600",
            },
            {
              label: "Government",
              value: isLoading
                ? "—"
                : normalizedOwnerTypeCount.Government.toLocaleString(),
              color: "text-emerald-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="font-inter text-xs text-slate-400">{s.label}</p>
              <p className={`font-lexend mt-1 text-xl font-bold ${s.color}`}>
                {s.value}
              </p>
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
                type="text"
                placeholder="Search name, TIN, or address..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="font-inter w-full rounded-sm border border-gray-200 py-2 pl-8 pr-3 text-xs text-[#595a5d] focus:outline-none focus:border-slate-400"
              />
            </div>
            <div className="min-w-40">
              <Combobox
                placeholder="All Owner Types"
                searchPlaceholder="Search type..."
                options={OWNER_TYPE_OPTIONS}
                value={typeFilter}
                onChange={handleTypeFilter}
                triggerClassName="rounded-sm text-xs py-1.5 text-slate-500"
              />
            </div>
            <div className="min-w-40">
              <Combobox
                placeholder="Status"
                searchPlaceholder="Search status..."
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={handleStatusFilter}
                triggerClassName="rounded-sm text-xs py-1.5 text-slate-500"
              />
            </div>
          </div>
        </div>

        <TableContainer>
          <Table zebra>
            <TableHeader>
              <TableRow>
                {[
                  "#",
                  "Full Name",
                  "TIN",
                  "Type",
                  "Status",
                  "Address",
                  "Phone",
                  "Email",
                  "Actions",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className={cn(
                      h.toLowerCase() === "full name" ? "min-w-50" : "",
                    )}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-slate-400"
                  >
                    Loading taxpayers...
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-slate-400"
                  >
                    No taxpayers found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((t, i) => (
                  <TableRow key={t.id}>
                    <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {t.owner_name}
                    </TableCell>
                    <TableCell>{t.tin || "—"}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                          ownerTypeColor[
                            t.owner_type === "Corporation"
                              ? "Corporate"
                              : (t.owner_type ?? "Individual")
                          ],
                        )}
                      >
                        {t.owner_type === "Corporation"
                          ? "Corporate"
                          : t.owner_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                          statusColor[getTaxpayerStatus(t)],
                        )}
                      >
                        {getTaxpayerStatus(t)}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 min-w-60 max-w-xs truncate">
                      {t.address || "—"}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {t.phone || "—"}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {t.email || "—"}
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          title="Edit"
                          className="cursor-pointer p-1.5 text-slate-400 transition-colors hover:text-blue-600"
                        >
                          <SquarePen size={14} />
                        </button>

                        {getTaxpayerStatus(t) === "Active" ? (
                          <button
                            onClick={() => handleArchiveClick(t)}
                            title="Archive"
                            className="cursor-pointer p-1.5 text-slate-400 transition-colors hover:text-amber-600"
                          >
                            <Archive size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreClick(t)}
                            title="Restore"
                            className="cursor-pointer p-1.5 text-slate-400 transition-colors hover:text-emerald-600"
                          >
                            <ArchiveRestore size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(t)}
                          title="Delete"
                          className="cursor-pointer p-1.5 text-slate-400 transition-colors hover:text-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="font-inter text-xs text-slate-400">
              Showing {paginated.length} of {filtered.length} taxpayers
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-inter px-2 text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </TableContainer>
      </div>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col max-h-[85vh] bg-white">
            {/* Fixed Header */}
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="font-lexend text-xl font-bold text-[#0F172A]">
                Edit Taxpayer
              </DialogTitle>
              <DialogDescription className="font-inter text-sm text-slate-500">
                Update taxpayer details and click save to apply changes.
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ValidatedInput
                  label="First Name"
                  required
                  validator="name"
                  type="name"
                  value={editForm.first_name}
                  onChange={(v, isValid) =>
                    updateField("first_name", v, isValid)
                  }
                />

                <ValidatedInput
                  label="Middle Name"
                  validator="name"
                  type="name"
                  value={editForm.middle_name}
                  onChange={(v, isValid) =>
                    updateField("middle_name", v, isValid)
                  }
                />

                <ValidatedInput
                  label="Last Name"
                  required
                  validator="name"
                  type="name"
                  value={editForm.last_name}
                  onChange={(v, isValid) =>
                    updateField("last_name", v, isValid)
                  }
                />

                <div>
                  <label className="font-inter mb-1 block text-xs font-medium text-slate-600 pt-2">
                    Suffix
                  </label>
                  <Combobox
                    value={editForm.suffix}
                    onChange={(val) => updateField("suffix", val)}
                    options={SUFFIX_OPTIONS}
                    placeholder="Select suffix"
                    searchPlaceholder="Search suffix..."
                    triggerClassName="h-9 text-xs"
                  />
                </div>

                <ValidatedInput
                  label="TIN"
                  type="tin"
                  validator="tin"
                  placeholder="000-000-000 or 000-000-000-000"
                  value={editForm.tin}
                  onChange={(v, isValid) => updateField("tin", v, isValid)}
                  showValidationIcon
                />

                <div>
                  <label className="font-inter block text-xs font-medium text-slate-600 mb-1 pt-2">
                    Owner Type <span className="text-rose-500">*</span>
                  </label>
                  <Combobox
                    value={editForm.owner_type}
                    onChange={(val) => updateField("owner_type", val)}
                    options={OWNER_TYPE_OPTIONS}
                    placeholder="Select owner type"
                    searchPlaceholder="Search type..."
                    triggerClassName="h-9 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-inter mb-1 block text-xs font-medium text-slate-600">
                    Barangay <span className="text-rose-500">*</span>
                  </label>
                  <Combobox
                    value={editForm.barangay_id}
                    onChange={(val) => updateField("barangay_id", val)}
                    options={barangayOptions}
                    disabled={isLoadingBarangays}
                    placeholder={
                      isLoadingBarangays ? "Loading..." : "Select barangay"
                    }
                    searchPlaceholder="Search barangay..."
                    emptyLabel="No barangay found."
                    triggerClassName="h-9 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-inter mb-1 block text-xs font-medium text-slate-600">
                    Other Address Details{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={editForm.address_details}
                    onChange={(e) =>
                      updateField("address_details", e.target.value)
                    }
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 font-inter"
                    placeholder="Street, Purok, Sitio, Landmark"
                  />
                </div>

                <ValidatedInput
                  type="phone"
                  label="Phone"
                  validator="phone"
                  required
                  placeholder="e.g. 912 345 6789"
                  value={editForm.phone}
                  onChange={(v, isValid) => updateField("phone", v, isValid)}
                  showValidationIcon
                />

                <ValidatedInput
                  type="email"
                  label="Email"
                  validator="email"
                  required
                  placeholder="example@email.com"
                  value={editForm.email}
                  onChange={(v, isValid) => updateField("email", v, isValid)}
                  showValidationIcon
                />
              </div>

              {!editForm.first_name.trim() ||
              !editForm.last_name.trim() ||
              !editForm.owner_type ||
              !editForm.barangay_id ||
              !editForm.address_details.trim() ? (
                <p className="font-inter mt-4 text-[10px] text-rose-500 italic">
                  * Required: Names, Owner Type, Barangay, and Address Details
                </p>
              ) : null}
            </div>

            {/* Fixed Footer Actions */}
            <div className="p-6 pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <DialogClose asChild>
                <button
                  type="button"
                  className="font-inter px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="button"
                disabled={
                  isSavingEdit ||
                  !hasFormChanges ||
                  Object.values(validationErrors).some((v) => v) ||
                  !editForm.first_name.trim() ||
                  !editForm.last_name.trim() ||
                  !editForm.owner_type ||
                  !editForm.barangay_id ||
                  !editForm.address_details.trim()
                }
                onClick={handleSaveTaxpayer}
                className="font-inter h-10 inline-flex items-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={confirmState.isOpen}
        onClose={() =>
          setConfirmState({ isOpen: false, type: null, taxpayer: null })
        }
        onConfirm={
          confirmState.type === "delete"
            ? handleConfirmDelete
            : confirmState.type === "archive"
              ? handleConfirmArchive
              : handleConfirmRestore
        }
        title={
          confirmState.type === "delete"
            ? "Delete Taxpayer"
            : confirmState.type === "archive"
              ? "Archive Taxpayer"
              : "Restore Taxpayer"
        }
        description={
          confirmState.type === "delete"
            ? "Are you sure you want to permanently delete this record? This action cannot be undone."
            : confirmState.type === "archive"
              ? "Are you sure you want to archive this record? It will be moved to the historical archive."
              : "Are you sure you want to restore this record to active status?"
        }
        entityName={confirmState.taxpayer?.owner_name}
        variant={
          confirmState.type === "delete"
            ? "danger"
            : confirmState.type === "archive"
              ? "warning"
              : "success"
        }
        confirmText={
          confirmState.type === "delete"
            ? "Confirm Delete"
            : confirmState.type === "archive"
              ? "Confirm Archive"
              : "Confirm Restore"
        }
      />
    </>
  );
}
