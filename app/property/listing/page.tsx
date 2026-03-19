'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Plus, Eye, SquarePen, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { toast } from 'sonner';
import {
  TaxDeclarationPrint,
  type TaxDeclarationData,
} from '@/components/print/TaxDeclarationPrint';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_OPTIONS: ComboboxOption[] = [
  { value: 'Active',    label: 'Active' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Revised',   label: 'Revised' },
];

type Property = {
  id: number;
  propertyId: number | null;
  tdNumber: string;
  pin: string;
  owner: string;
  classification: string;
  barangay: string;
  landArea: string;
  marketValue: string;
  assessLevel: string;
  assessedValue: string;
  status: string;
};

type EditablePropertyFields = Omit<Property, 'id' | 'propertyId'>;

type ListingApiRow = {
  id: number;
  property_id: number | null;
  td_number: string | null;
  classification: string | null;
  land_area: number | null;
  total_market_value: number | null;
  land_assessment_level: number | null;
  total_assessed_value: number | null;
  status: string | null;
  taxpayers: { owner_name: string | null } | { owner_name: string | null }[] | null;
  properties:
    | { pin: string | null; barangays: { name: string | null } | { name: string | null }[] | null }
    | { pin: string | null; barangays: { name: string | null } | { name: string | null }[] | null }[]
    | null;
};

type ViewPropertyData = {
  id: number;
  pin: string | null;
  street: string | null;
  lot_number: string | null;
  survey_number: string | null;
  latitude: number | null;
  longitude: number | null;
  barangays: { name: string | null } | { name: string | null }[] | null;
};

type ViewTaxpayerData = {
  owner_name?: string | null;
  tin?: string | null;
  owner_type?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

type ViewDeclarationData = {
  id: number;
  td_number: string | null;
  classification: string | null;
  land_area: number | null;
  total_market_value: number | null;
  total_assessed_value: number | null;
  status: string | null;
  effectivity_year: number | null;
  taxpayers: ViewTaxpayerData | ViewTaxpayerData[] | null;
};

type ViewLinkedResponse = {
  property: ViewPropertyData | null;
  declarations: ViewDeclarationData[];
};

const classificationColors: Record<string, string> = {
  Residential: 'bg-blue-50 text-blue-700',
  Commercial: 'bg-amber-50 text-amber-700',
  Agricultural: 'bg-green-50 text-green-700',
  Industrial: 'bg-purple-50 text-purple-700',
  Special: 'bg-orange-50 text-orange-700',
};

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-red-50 text-red-600',
  Revised: 'bg-yellow-50 text-yellow-700',
};

type NumericInputOptions = {
  allowDecimal?: boolean;
  maxIntegerDigits: number;
  maxDecimalDigits?: number;
};

function sanitizeNumericInput(raw: string, options: NumericInputOptions): string {
  const { allowDecimal = false, maxIntegerDigits, maxDecimalDigits = 0 } = options;
  const cleaned = raw.replace(/,/g, '').replace(allowDecimal ? /[^\d.]/g : /\D/g, '');

  if (!allowDecimal) return cleaned.slice(0, maxIntegerDigits);

  const firstDot = cleaned.indexOf('.');
  const normalized = firstDot >= 0
    ? `${cleaned.slice(0, firstDot)}.${cleaned.slice(firstDot + 1).replace(/\./g, '')}`
    : cleaned;

  const [intPartRaw = '', decPartRaw = ''] = normalized.split('.');
  const intPart = intPartRaw.slice(0, maxIntegerDigits);
  const hasDot = normalized.includes('.');
  const decPart = decPartRaw.slice(0, maxDecimalDigits);

  if (!hasDot) return intPart;
  return `${intPart}.${decPart}`;
}

function formatNumericInput(raw: string, options: NumericInputOptions): string {
  const sanitized = sanitizeNumericInput(raw, options);
  if (!sanitized) return '';

  const hasTrailingDot = sanitized.endsWith('.');
  const [intPart = '', decPart] = sanitized.split('.');
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (!options.allowDecimal) return groupedInt;
  if (hasTrailingDot) return `${groupedInt}.`;
  if (decPart !== undefined) return `${groupedInt}.${decPart}`;
  return groupedInt;
}

function formatTdInput(raw: string): string {
  const digits = raw.replace(/^\s*[Tt][Dd]-?\s*/, '').replace(/\D/g, '').slice(0, 20);
  if (!digits) return 'TD-';

  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return `TD-${parts.join('-')}`;
}

function formatPinInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  if (!digits) return '';

  const groups = [3, 2, 3, 2, 3];
  const parts: string[] = [];
  let index = 0;

  for (const group of groups) {
    if (index >= digits.length) break;
    parts.push(digits.slice(index, index + group));
    index += group;
  }

  return parts.join('-');
}

export default function PropertyListingPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [barangayFilter, setBarangayFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [printData, setPrintData] = useState<TaxDeclarationData | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState('');
  const [viewData, setViewData] = useState<ViewLinkedResponse | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditablePropertyFields>({
    tdNumber: '',
    pin: '',
    owner: '',
    classification: '',
    barangay: '',
    landArea: '',
    marketValue: '',
    assessLevel: '',
    assessedValue: '',
    status: 'Active',
  });

  const pageSize = 20;

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      setError('');

      try {
        const res = await fetch('/api/properties/listing', { cache: 'no-store' });
        const body = await res.json();

        if (!res.ok) {
          setError(body?.error || 'Unable to load property listing.');
          setProperties([]);
          return;
        }

        const rows: ListingApiRow[] = Array.isArray(body?.rows) ? body.rows : [];
        const mapped: Property[] = rows.map((row) => {
          const taxpayer = Array.isArray(row.taxpayers) ? row.taxpayers[0] : row.taxpayers;
          const property = Array.isArray(row.properties) ? row.properties[0] : row.properties;
          const barangayRaw = property?.barangays;
          const barangay = Array.isArray(barangayRaw) ? barangayRaw[0] : barangayRaw;

          return {
            id: row.id,
            propertyId: row.property_id,
            tdNumber: row.td_number || '—',
            pin: property?.pin || '—',
            owner: taxpayer?.owner_name || '—',
            classification: row.classification || '—',
            barangay: barangay?.name || '—',
            landArea: row.land_area == null ? '—' : row.land_area.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            marketValue: row.total_market_value == null ? '—' : `₱${row.total_market_value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            assessLevel: row.land_assessment_level == null ? '—' : `${Number(row.land_assessment_level).toFixed(2)}%`,
            assessedValue: row.total_assessed_value == null ? '—' : `₱${row.total_assessed_value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            status: row.status || '—',
          };
        });

        setProperties(mapped);
      } catch {
        setError('Unable to load property listing.');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    loadListing();
  }, []);

  const classOptions = useMemo<ComboboxOption[]>(() => {
    const values = [...new Set(properties.map((p) => p.classification).filter((v) => v && v !== '—'))].sort();
    return values.map((v) => ({ value: v, label: v }));
  }, [properties]);

  const barangayOptions = useMemo<ComboboxOption[]>(() => {
    const values = [...new Set(properties.map((p) => p.barangay).filter((v) => v && v !== '—'))].sort();
    return values.map((v) => ({ value: v, label: v }));
  }, [properties]);

  const filtered = properties.filter((p) =>
    (p.tdNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.pin.includes(search) ||
      p.owner.toLowerCase().includes(search.toLowerCase())) &&
    (classFilter ? p.classification === classFilter : true) &&
    (barangayFilter ? p.barangay === barangayFilter : true) &&
    (statusFilter ? p.status === statusFilter : true)
  );

  useEffect(() => {
    setPage(1);
  }, [search, classFilter, barangayFilter, statusFilter]);

  useEffect(() => {
    if (!printData) return;

    const t = setTimeout(() => {
      window.print();
      window.addEventListener('afterprint', () => setPrintData(null), { once: true });
    }, 80);

    return () => clearTimeout(t);
  }, [printData]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);
  const summaryStart = filtered.length === 0 ? 0 : startIdx + 1;
  const summaryEnd = Math.min(startIdx + pageSize, filtered.length);

  const totalProperties = properties.length;
  const totalResidential = properties.filter((p) => p.classification === 'Residential').length;
  const totalCommercial = properties.filter((p) => p.classification === 'Commercial').length;
  const totalAgricultural = properties.filter((p) => p.classification === 'Agricultural').length;

  function openEditModal(property: Property) {
    setEditingPropertyId(property.id);
    setEditForm({
      tdNumber: property.tdNumber,
      pin: property.pin,
      owner: property.owner,
      classification: property.classification,
      barangay: property.barangay,
      landArea: property.landArea,
      marketValue: property.marketValue.replace(/[^\d.,]/g, ''),
      assessLevel: property.assessLevel.replace(/[^\d.,]/g, ''),
      assessedValue: property.assessedValue.replace(/[^\d.,]/g, ''),
      status: property.status,
    });
    setIsEditOpen(true);
  }

  function closeViewModal() {
    setIsViewOpen(false);
    setViewLoading(false);
    setViewError('');
    setViewData(null);
  }

  function closeEditModal() {
    setIsEditOpen(false);
    setEditingPropertyId(null);
  }

  function updateEditField<K extends keyof EditablePropertyFields>(key: K, value: EditablePropertyFields[K]) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  function saveEditModal() {
    if (editingPropertyId == null) return;

    const marketValueDisplay = editForm.marketValue.trim() ? `₱${editForm.marketValue.trim()}` : '—';
    const assessLevelDisplay = editForm.assessLevel.trim() ? `${editForm.assessLevel.trim()}%` : '—';
    const assessedValueDisplay = editForm.assessedValue.trim() ? `₱${editForm.assessedValue.trim()}` : '—';

    setProperties((prev) =>
      prev.map((item) => (item.id === editingPropertyId
        ? {
            id: editingPropertyId,
          propertyId: item.propertyId,
            ...editForm,
            marketValue: marketValueDisplay,
            assessLevel: assessLevelDisplay,
            assessedValue: assessedValueDisplay,
          }
        : item))
    );

    toast.success('Property details updated in list.');
    closeEditModal();
  }

  async function handlePrintProperty(property: Property) {
    const tdNumber = property.tdNumber?.trim();

    if (!tdNumber || tdNumber === '—') {
      toast.error('No TD Number available for this property.');
      return;
    }

    try {
      const res = await fetch(`/api/tax-declarations/by-number?td_number=${encodeURIComponent(tdNumber)}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok || !data?.td) {
        toast.error(data?.error || 'Unable to load print data.');
        return;
      }

      setPrintData(data.td as TaxDeclarationData);
    } catch {
      toast.error('Unable to load print data. Please try again.');
    }
  }

  async function handleViewProperty(property: Property) {
    if (property.propertyId == null) {
      toast.error('No linked property found for this record.');
      return;
    }

    setIsViewOpen(true);
    setViewLoading(true);
    setViewError('');
    setViewData(null);

    try {
      const res = await fetch(`/api/properties/linked?id=${property.propertyId}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok) {
        setViewError(data?.error || 'Unable to load property details.');
        return;
      }

      setViewData({
        property: data?.property ?? null,
        declarations: Array.isArray(data?.declarations) ? data.declarations : [],
      });
    } catch {
      setViewError('Unable to load property details.');
    } finally {
      setViewLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => router.push('/property')}
        className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Property Registry
      </button>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">Property Listing</h1>
          <p className="font-inter mt-1 text-xs text-slate-400">All Registered Real Properties – Municipality of Sta. Rita, Samar</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/property/new-td')}
          className="font-inter inline-flex cursor-pointer items-center gap-2 rounded bg-[#0f1729] px-4 py-2 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          New Tax Declaration
        </button>
      </header>

      {error && (
        <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-2 font-inter text-xs text-red-700">
          {error}
        </div>
      )}

      {printData && (
        <div className="sr-only print:not-sr-only">
          <TaxDeclarationPrint data={printData} />
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total Properties', value: totalProperties.toLocaleString('en-PH'), color: 'text-[#595a5d]' },
          { label: 'Residential', value: totalResidential.toLocaleString('en-PH'), color: 'text-blue-600' },
          { label: 'Commercial', value: totalCommercial.toLocaleString('en-PH'), color: 'text-amber-600' },
          { label: 'Agricultural', value: totalAgricultural.toLocaleString('en-PH'), color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-inter text-xs text-slate-400">{s.label}</p>
            <p className={`font-lexend mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-4 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 min-w-45 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search TD#, PIN, or Owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="font-inter w-full rounded-sm border border-gray-200 py-2 pl-8 pr-3 text-xs text-[#595a5d] focus:outline-none focus:border-slate-400"
            />
          </div>
          <div className="min-w-40">
            <Combobox
              placeholder="All Classifications"
              searchPlaceholder="Search classification..."
              options={classOptions}
              value={classFilter}
              onChange={setClassFilter}
              triggerClassName="rounded-sm text-xs py-1.5 text-slate-500"
            />
          </div>
          <div className="min-w-40">
            <Combobox
              placeholder="All Barangays"
              searchPlaceholder="Search barangay..."
              options={barangayOptions}
              value={barangayFilter}
              onChange={setBarangayFilter}
              triggerClassName="rounded-sm text-xs py-1.5 text-slate-500"
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

      {/* Table */}
      <div className="rounded-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full font-inter text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['TD Number', 'PIN', 'Owner Name', 'Classification', 'Barangay', 'Land Area (sqm)', 'Market Value (₱)', 'Assess. Level', 'Assessed Value (₱)', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className={`whitespace-nowrap px-4 py-3 text-left text-[#595a5d] font-semibold uppercase tracking-wide ${h === 'Actions' ? 'sticky right-0 z-20 bg-gray-50 border-l border-gray-200' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400">Loading property records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400">No properties found matching your filters.</td>
                </tr>
              ) : (
                pageRows.map((p) => (
                  <tr key={p.id} className="group border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#595a5d] whitespace-nowrap">{p.tdNumber}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.pin}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{p.owner}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${classificationColors[p.classification] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.classification}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.barangay}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{p.landArea}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{p.marketValue}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{p.assessLevel}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#595a5d]">{p.assessedValue}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="sticky right-0 z-10 border-l border-gray-100 bg-white px-4 py-3 group-hover:bg-gray-50">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="View"
                          onClick={() => handleViewProperty(p)}
                          className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => openEditModal(p)}
                          className="text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                        >
                          <SquarePen size={14} />
                        </button>
                        <button
                          title="Print"
                          onClick={() => handlePrintProperty(p)}
                          className="text-slate-400 hover:text-green-600 transition-colors cursor-pointer"
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <p className="font-inter text-xs text-slate-400">
            Showing {summaryStart}-{summaryEnd} of {filtered.length} properties
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-inter px-2 text-xs text-slate-500">Page {safePage} of {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isViewOpen} onOpenChange={(open) => !open && closeViewModal()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 bg-white gap-0 border-0 shadow-lg">
          <DialogHeader className="mb-4 text-left border-b-0 px-0 pt-0">
            <DialogTitle className="font-lexend text-lg font-semibold text-[#0F172A]">Property Details</DialogTitle>
            <DialogDescription className="font-inter text-sm text-slate-500">Linked property, declarations, and taxpayer information.</DialogDescription>
          </DialogHeader>

            {viewLoading ? (
              <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-6 text-center font-inter text-sm text-slate-500">
                Loading property details...
              </div>
            ) : viewError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 font-inter text-sm text-red-700">
                {viewError}
              </div>
            ) : viewData ? (
              <>
                <div className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                  <InfoRow label="PIN" value={viewData.property?.pin || '—'} />
                  <InfoRow
                    label="Barangay"
                    value={
                      (Array.isArray(viewData.property?.barangays)
                        ? viewData.property?.barangays[0]?.name
                        : viewData.property?.barangays?.name) || '—'
                    }
                  />
                  <InfoRow label="Street" value={viewData.property?.street || '—'} />
                  <InfoRow label="Lot Number" value={viewData.property?.lot_number || '—'} />
                  <InfoRow label="Survey Number" value={viewData.property?.survey_number || '—'} />
                  <InfoRow
                    label="Coordinates"
                    value={
                      viewData.property?.latitude != null && viewData.property?.longitude != null
                        ? `${viewData.property.latitude}, ${viewData.property.longitude}`
                        : '—'
                    }
                  />
                </div>

                <div className="mt-4 rounded-md border border-gray-200">
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 font-lexend text-sm font-semibold text-[#0F172A]">
                    Linked Tax Declarations ({viewData.declarations.length})
                  </div>

                  {viewData.declarations.length === 0 ? (
                    <p className="px-4 py-4 font-inter text-sm text-slate-500">No declarations found.</p>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {viewData.declarations.map((decl) => {
                        const taxpayer = Array.isArray(decl.taxpayers) ? decl.taxpayers[0] : decl.taxpayers;
                        return (
                          <div key={decl.id} className="px-4 py-3">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <p className="font-lexend text-sm font-semibold text-[#0F172A]">{decl.td_number || '—'}</p>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[decl.status || ''] ?? 'bg-gray-100 text-gray-600'}`}>
                                {decl.status || '—'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
                              <InfoRow label="Owner" value={taxpayer?.owner_name || '—'} compact />
                              <InfoRow label="Owner Type" value={taxpayer?.owner_type || '—'} compact />
                              <InfoRow label="Classification" value={decl.classification || '—'} compact />
                              <InfoRow
                                label="Land Area"
                                value={decl.land_area == null ? '—' : `${decl.land_area.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sqm`}
                                compact
                              />
                              <InfoRow
                                label="Market Value"
                                value={decl.total_market_value == null ? '—' : `₱${decl.total_market_value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                compact
                              />
                              <InfoRow
                                label="Assessed Value"
                                value={decl.total_assessed_value == null ? '—' : `₱${decl.total_assessed_value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                compact
                              />
                              <InfoRow label="Effectivity Year" value={decl.effectivity_year == null ? '—' : String(decl.effectivity_year)} compact />
                              <InfoRow label="TIN" value={taxpayer?.tin || '—'} compact />
                              <InfoRow label="Phone" value={taxpayer?.phone || '—'} compact />
                              <InfoRow label="Email" value={taxpayer?.email || '—'} compact />
                            </div>
                            <InfoRow label="Address" value={taxpayer?.address || '—'} compact />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : null}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={closeViewModal}
                className="border border-gray-200 text-slate-600 text-xs font-inter px-4 py-2 rounded-md hover:bg-gray-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent className="max-w-lg bg-white p-6 gap-0 border-0 shadow-lg">
          <DialogHeader className="mb-4 text-left border-b-0 px-0 pt-0">
            <DialogTitle className="font-lexend text-lg font-semibold text-[#0F172A]">Edit Property</DialogTitle>
            <DialogDescription className="font-inter text-sm text-slate-500">Update property details and click save to apply changes.</DialogDescription>
          </DialogHeader>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ModalField
                  label="TD Number"
                  value={editForm.tdNumber}
                  onChange={(v) => updateEditField('tdNumber', formatTdInput(v))}
                  required
                />
                <ModalField
                  label="Property Index Number (PIN)"
                  value={editForm.pin}
                  onChange={(v) => updateEditField('pin', formatPinInput(v))}
                  required
                />
                <ModalField
                  label="Owner Name"
                  value={editForm.owner}
                  onChange={(v) => updateEditField('owner', v)}
                  required
                  readOnly
                />
                <ModalField
                  label="Classification"
                  value={editForm.classification}
                  onChange={(v) => updateEditField('classification', v)}
                />
                <ModalField
                  label="Barangay"
                  value={editForm.barangay}
                  onChange={(v) => updateEditField('barangay', v)}
                />
                <ModalField
                  label="Land Area (sqm)"
                  value={editForm.landArea}
                  onChange={(v) => updateEditField('landArea', formatNumericInput(v, { allowDecimal: true, maxIntegerDigits: 10, maxDecimalDigits: 4 }))}
                />
                <ModalField
                  label="Market Value (P)"
                  value={editForm.marketValue}
                  onChange={(v) => updateEditField('marketValue', formatNumericInput(v, { allowDecimal: true, maxIntegerDigits: 12, maxDecimalDigits: 2 }))}
                />
                <ModalField
                  label="Assess. Level"
                  value={editForm.assessLevel}
                  onChange={(v) => updateEditField('assessLevel', formatNumericInput(v, { allowDecimal: true, maxIntegerDigits: 3, maxDecimalDigits: 2 }))}
                  suffix="%"
                />
                <ModalField
                  label="Assessed Value (P)"
                  value={editForm.assessedValue}
                  onChange={(v) => updateEditField('assessedValue', formatNumericInput(v, { allowDecimal: true, maxIntegerDigits: 12, maxDecimalDigits: 2 }))}
                />
                <div>
                  <label className="font-inter mb-1 block text-xs font-medium text-slate-600">
                    Status
                    <span className="ml-1 text-rose-500">*</span>
                  </label>
                  <Combobox
                    placeholder="Select status"
                    searchPlaceholder="Search status..."
                    options={STATUS_OPTIONS}
                    value={editForm.status}
                    onChange={(v) => updateEditField('status', v)}
                    triggerClassName="rounded-md text-sm py-2 text-slate-700"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="border border-gray-200 text-slate-600 text-xs font-inter px-4 py-2 rounded-md hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEditModal}
                  className="bg-[#0F172A] text-white text-xs font-inter px-4 py-2 rounded-md hover:bg-slate-800 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <p className={`${compact ? 'font-inter text-xs' : 'font-inter text-sm'} text-slate-600`}>
      <span className="font-medium text-slate-700">{label}:</span> {value}
    </p>
  );
}

function ModalField({
  label,
  value,
  onChange,
  required = false,
  readOnly = false,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  readOnly?: boolean;
  suffix?: string;
}) {
  return (
    <div>
      <label className="font-inter mb-1 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          className={`w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 outline-none ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-slate-200'}`}
        />
        {suffix && <span className="font-inter text-sm text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}
