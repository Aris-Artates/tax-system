'use client';

/**
 * Linked Properties — app/taxpayers/linked-properties/page.tsx
 *
 * Lets the user search for a taxpayer or a property. When either is selected
 * the linked records (tax declarations + the other party) load automatically.
 * A Leaflet map on the right zooms to a property when it is focused and zooms
 * back out when the focus is cleared.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  FileText,
  Crosshair,
  XCircle,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  Hash,
} from 'lucide-react';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import type { MapProperty } from '@/components/PropertyMap';

// ── Dynamic map (no SSR — Leaflet requires window) ─────────────────────────
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50">
      <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
    </div>
  ),
});

// ── Types ───────────────────────────────────────────────────────────────────
type TaxpayerOption = {
  id: number;
  owner_name: string;
  tin: string | null;
  owner_type: string | null;
};

type PropertyOption = {
  id: number;
  pin: string;
  street: string | null;
  lot_number: string | null;
  latitude: number | null;
  longitude: number | null;
  barangays: { id: number; name: string } | null;
};

type LinkedTaxpayer = {
  id: number;
  owner_name: string;
  tin: string | null;
  address: string | null;
  owner_type: string | null;
  phone: string | null;
  email: string | null;
};

type LinkedProperty = {
  id: number;
  pin: string;
  street: string | null;
  lot_number: string | null;
  survey_number: string | null;
  latitude: number | null;
  longitude: number | null;
  barangays: { id: number; name: string } | null;
};

type Declaration = {
  id: number;
  td_number: string;
  classification: string | null;
  land_area: number | null;
  total_market_value: number | null;
  total_assessed_value: number | null;
  status: string | null;
  effectivity_year: number | null;
  // From taxpayer-linked query:
  properties?: LinkedProperty | null;
  // From property-linked query:
  taxpayers?: LinkedTaxpayer | null;
};

type FullTaxpayer = {
  id: number;
  owner_name: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  suffix: string | null;
  tin: string | null;
  address: string | null;
  owner_type: string | null;
  phone: string | null;
  email: string | null;
};

type FullProperty = {
  id: number;
  pin: string;
  street: string | null;
  lot_number: string | null;
  survey_number: string | null;
  latitude: number | null;
  longitude: number | null;
  barangays: { id: number; name: string } | null;
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

const classColors: Record<string, string> = {
  Residential: 'bg-blue-50 text-blue-700',
  Commercial: 'bg-amber-50 text-amber-700',
  Agricultural: 'bg-green-50 text-green-700',
  Industrial: 'bg-purple-50 text-purple-700',
  Special: 'bg-orange-50 text-orange-700',
};

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-red-50 text-red-600',
  Revised: 'bg-slate-50 text-slate-600',
};

// ── Component ───────────────────────────────────────────────────────────────
export default function LinkedPropertiesPage() {
  const router = useRouter();

  // ── Combobox option pools ─────────────────────────────────────────────────
  const [taxpayerOpts, setTaxpayerOpts] = useState<ComboboxOption[]>([]);
  const [propertyOpts, setPropertyOpts] = useState<ComboboxOption[]>([]);

  // ── Selection state ───────────────────────────────────────────────────────
  const [selTaxpayerId, setSelTaxpayerId] = useState('');
  const [selPropertyId, setSelPropertyId] = useState('');

  // ── Loaded data ───────────────────────────────────────────────────────────
  const [taxpayer, setTaxpayer] = useState<FullTaxpayer | null>(null);
  const [taxpayerDecls, setTaxpayerDecls] = useState<Declaration[]>([]);
  const [property, setProperty] = useState<FullProperty | null>(null);
  const [propertyDecls, setPropertyDecls] = useState<Declaration[]>([]);

  // ── Map state ─────────────────────────────────────────────────────────────
  const [mapFocusId, setMapFocusId] = useState<number | null>(null);

  // ── Loading / error ───────────────────────────────────────────────────────
  const [loadingTaxpayer, setLoadingTaxpayer] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Load combobox options on mount ────────────────────────────────────────
  useEffect(() => {
    fetch('/api/taxpayers/list', { cache: 'no-store' })
      .then((r) => r.json())
      .then((body) => {
        const d = body._data ? JSON.parse(atob(atob(atob(body._data)))) : body;
        const opts: ComboboxOption[] = (d.taxpayers ?? []).map(
          (t: TaxpayerOption) => ({
            value: String(t.id),
            label: t.owner_name,
            sublabel: t.tin ? `TIN: ${t.tin}` : t.owner_type ?? '',
          }),
        );
        setTaxpayerOpts(opts);
      })
      .catch(() => {});

    fetch('/api/properties/list', { cache: 'no-store' })
      .then((r) => r.json())
      .then((body) => {
        const d = body._data ? JSON.parse(atob(atob(atob(body._data)))) : body;
        const opts: ComboboxOption[] = (d.properties ?? []).map(
          (p: PropertyOption) => ({
            value: String(p.id),
            label: p.pin,
            sublabel: [
              p.barangays?.name,
              p.lot_number ? `Lot ${p.lot_number}` : null,
              p.street,
            ]
              .filter(Boolean)
              .join(' · '),
          }),
        );
        setPropertyOpts(opts);
      })
      .catch(() => {});
  }, []);

  // ── Load taxpayer linked data ─────────────────────────────────────────────
  useEffect(() => {
    if (!selTaxpayerId) {
      setTaxpayer(null);
      setTaxpayerDecls([]);
      // Clear map focus if it was from taxpayer side
      setMapFocusId((prev) => {
        // Only clear if focused property came from taxpayer list
        const stillValid = selPropertyId ? prev : null;
        return stillValid;
      });
      return;
    }

    setLoadingTaxpayer(true);
    setErrorMsg('');

    fetch(`/api/taxpayers/linked?id=${selTaxpayerId}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((body) => {
        const d = body._data ? JSON.parse(atob(atob(atob(body._data)))) : body;
        if (d.error) throw new Error(d.error);
        setTaxpayer(d.taxpayer);
        setTaxpayerDecls(d.declarations ?? []);
      })
      .catch((e) => setErrorMsg(e.message ?? 'Failed to load taxpayer data.'))
      .finally(() => setLoadingTaxpayer(false));
  }, [selTaxpayerId]);

  // ── Load property linked data ─────────────────────────────────────────────
  useEffect(() => {
    if (!selPropertyId) {
      setProperty(null);
      setPropertyDecls([]);
      setMapFocusId(null);
      return;
    }

    setLoadingProperty(true);
    setErrorMsg('');

    fetch(`/api/properties/linked?id=${selPropertyId}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((body) => {
        const d = body._data ? JSON.parse(atob(atob(atob(body._data)))) : body;
        if (d.error) throw new Error(d.error);
        setProperty(d.property);
        setPropertyDecls(d.declarations ?? []);
        // Auto-focus map to this property if it has coordinates
        if (d.property?.latitude && d.property?.longitude) {
          setMapFocusId(d.property.id);
        }
      })
      .catch((e) => setErrorMsg(e.message ?? 'Failed to load property data.'))
      .finally(() => setLoadingProperty(false));
  }, [selPropertyId]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTaxpayerChange = useCallback((val: string) => {
    setSelTaxpayerId(val);
    setMapFocusId(null);
  }, []);

  const handlePropertyChange = useCallback((val: string) => {
    setSelPropertyId(val);
  }, []);

  const handleClearAll = useCallback(() => {
    setSelTaxpayerId('');
    setSelPropertyId('');
    setTaxpayer(null);
    setTaxpayerDecls([]);
    setProperty(null);
    setPropertyDecls([]);
    setMapFocusId(null);
    setErrorMsg('');
  }, []);

  const handleFocusProperty = useCallback(
    (propId: number | null | undefined) => {
      if (!propId) return;
      setMapFocusId((prev) => (prev === propId ? null : propId));
    },
    [],
  );

  // ── Map properties derived from loaded data ───────────────────────────────
  const mapProperties = useMemo<MapProperty[]>(() => {
    const list: MapProperty[] = [];

    // Taxpayer side: one marker per linked property that has coordinates
    taxpayerDecls.forEach((d) => {
      const p = d.properties;
      if (p?.latitude && p?.longitude) {
        list.push({
          id: p.id,
          pin: p.pin,
          tdNumber: d.td_number,
          lat: p.latitude,
          lng: p.longitude,
          ownerName: taxpayer?.owner_name,
        });
      }
    });

    // Property side: add the directly selected property if not already listed
    if (property?.latitude && property?.longitude) {
      const alreadyListed = list.some((m) => m.id === property.id);
      if (!alreadyListed) {
        list.push({
          id: property.id,
          pin: property.pin,
          tdNumber: propertyDecls[0]?.td_number ?? '—',
          lat: property.latitude,
          lng: property.longitude,
        });
      }
    }

    return list;
  }, [taxpayerDecls, propertyDecls, taxpayer, property]);

  const hasContent = !!selTaxpayerId || !!selPropertyId;
  const isLoading = loadingTaxpayer || loadingProperty;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push('/taxpayers')}
        className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Taxpayer Records
      </button>

      {/* Header */}
      <header className="mb-6">
        <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
          Linked Properties
        </h1>
        <p className="font-inter mt-1 text-xs text-slate-400">
          Search by taxpayer or property — linked records load together with
          map location
        </p>
      </header>

      {/* Search panel */}
      <div className="mb-6 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
            Search
          </p>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
          {/* Taxpayer combobox */}
          <div className="flex-1">
            <Combobox
              label="Taxpayer"
              placeholder="Select or search taxpayer…"
              searchPlaceholder="Search by name or TIN…"
              options={taxpayerOpts}
              value={selTaxpayerId}
              onChange={handleTaxpayerChange}
              emptyLabel="No taxpayers found."
            />
          </div>

          {/* Property combobox */}
          <div className="flex-1">
            <Combobox
              label="Property"
              placeholder="Select or search property…"
              searchPlaceholder="Search by PIN, lot, or address…"
              options={propertyOpts}
              value={selPropertyId}
              onChange={handlePropertyChange}
              emptyLabel="No properties found."
            />
          </div>

          {/* Clear all */}
          {hasContent && (
            <button
              type="button"
              onClick={handleClearAll}
              className="font-inter inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <XCircle className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="font-inter mb-4 flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Main split layout */}
      <div className="flex gap-6">
        {/* ── Records panel ──────────────────────────────────────────── */}
        <div className="w-2/5 min-w-0 shrink-0 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 18rem)' }}>

          {/* Loading spinner */}
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !hasContent && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-gray-200 bg-white py-16 text-center">
              <FileText className="h-10 w-10 text-slate-200" />
              <div>
                <p className="font-inter text-sm font-medium text-slate-400">
                  No record selected
                </p>
                <p className="font-inter mt-1 text-xs text-slate-300">
                  Search for a taxpayer or property above to load linked records
                </p>
              </div>
            </div>
          )}

          {/* ── Taxpayer info + their linked properties ─────────────── */}
          {!isLoading && taxpayer && (
            <>
              {/* Taxpayer info card */}
              <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <User className="h-4 w-4 text-[#00154A]" />
                  <span className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
                    Taxpayer
                  </span>
                  {taxpayer.owner_type && (
                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 font-inter text-xs text-slate-500">
                      {taxpayer.owner_type}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <p className="font-lexend text-base font-bold text-[#595a5d]">
                    {taxpayer.owner_name}
                  </p>
                  {taxpayer.tin && (
                    <InfoRow icon={<Hash className="h-3 w-3" />} label="TIN" value={taxpayer.tin} />
                  )}
                  {taxpayer.address && (
                    <InfoRow icon={<MapPin className="h-3 w-3" />} label="Address" value={taxpayer.address} />
                  )}
                  {taxpayer.phone && (
                    <InfoRow icon={<Phone className="h-3 w-3" />} label="Phone" value={taxpayer.phone} />
                  )}
                  {taxpayer.email && (
                    <InfoRow icon={<Mail className="h-3 w-3" />} label="Email" value={taxpayer.email} />
                  )}
                </div>
              </div>

              {/* Taxpayer's linked properties */}
              <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <Building2 className="h-4 w-4 text-[#00154A]" />
                  <span className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
                    Linked Properties
                  </span>
                  <span className="ml-auto font-inter text-xs text-slate-400">
                    {taxpayerDecls.length} record{taxpayerDecls.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {taxpayerDecls.length === 0 ? (
                  <p className="font-inter p-6 text-center text-xs text-slate-400">
                    No linked properties found for this taxpayer.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {taxpayerDecls.map((d) => {
                      const prop = d.properties;
                      const hasCoords = !!(prop?.latitude && prop?.longitude);
                      const isFocused = mapFocusId === prop?.id;
                      return (
                        <div key={d.id} className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-inter text-xs font-semibold text-[#595a5d]">
                                {prop?.pin ?? '—'}
                              </p>
                              <p className="font-inter text-xs text-slate-400">
                                {[
                                  prop?.barangays?.name,
                                  prop?.lot_number ? `Lot ${prop.lot_number}` : null,
                                  prop?.street,
                                ]
                                  .filter(Boolean)
                                  .join(' · ') || 'No address'}
                              </p>
                            </div>
                            {hasCoords ? (
                              <button
                                type="button"
                                title={isFocused ? 'Remove map focus' : 'Zoom map to this property'}
                                onClick={() => handleFocusProperty(prop?.id)}
                                className={`shrink-0 cursor-pointer rounded p-1.5 transition-colors ${
                                  isFocused
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                }`}
                              >
                                <Crosshair className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <span
                                title="No coordinates recorded"
                                className="shrink-0 rounded p-1.5 text-slate-200"
                              >
                                <MapPin className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <TdBadge label="TD" value={d.td_number} />
                            {d.classification && (
                              <span
                                className={`rounded-full px-2 py-0.5 font-inter text-xs font-medium ${classColors[d.classification] ?? 'bg-gray-100 text-gray-600'}`}
                              >
                                {d.classification}
                              </span>
                            )}
                            {d.status && (
                              <span
                                className={`rounded-full px-2 py-0.5 font-inter text-xs font-medium ${statusColors[d.status] ?? 'bg-gray-100 text-gray-600'}`}
                              >
                                {d.status}
                              </span>
                            )}
                            {d.effectivity_year && (
                              <span className="rounded-full bg-slate-50 px-2 py-0.5 font-inter text-xs text-slate-500">
                                AY {d.effectivity_year}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <ValueRow label="Market Value" value={`₱ ${fmt(d.total_market_value)}`} />
                            <ValueRow label="Assessed Value" value={`₱ ${fmt(d.total_assessed_value)}`} />
                            {d.land_area != null && (
                              <ValueRow label="Land Area" value={`${d.land_area.toLocaleString()} sqm`} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Property info + linked taxpayers ────────────────────── */}
          {!isLoading && property && (
            <>
              {/* Property info card */}
              <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <Building2 className="h-4 w-4 text-[#00154A]" />
                  <span className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
                    Property
                  </span>
                  {property.latitude && property.longitude ? (
                    <button
                      type="button"
                      title={mapFocusId === property.id ? 'Remove map focus' : 'Zoom map to this property'}
                      onClick={() => handleFocusProperty(property.id)}
                      className={`ml-auto cursor-pointer rounded p-1.5 transition-colors ${
                        mapFocusId === property.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      <Crosshair className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
                <div className="p-4 space-y-2">
                  <p className="font-lexend text-base font-bold text-[#595a5d]">
                    PIN: {property.pin}
                  </p>
                  <InfoRow
                    icon={<MapPin className="h-3 w-3" />}
                    label="Barangay"
                    value={property.barangays?.name ?? '—'}
                  />
                  {property.lot_number && (
                    <InfoRow icon={<Hash className="h-3 w-3" />} label="Lot No." value={property.lot_number} />
                  )}
                  {property.street && (
                    <InfoRow icon={<MapPin className="h-3 w-3" />} label="Street" value={property.street} />
                  )}
                  {property.survey_number && (
                    <InfoRow icon={<Hash className="h-3 w-3" />} label="Survey No." value={property.survey_number} />
                  )}
                  {property.latitude && property.longitude ? (
                    <InfoRow
                      icon={<Crosshair className="h-3 w-3" />}
                      label="Coordinates"
                      value={`${property.latitude.toFixed(6)}, ${property.longitude.toFixed(6)}`}
                    />
                  ) : (
                    <p className="font-inter text-xs text-slate-400 italic">
                      No GPS coordinates recorded
                    </p>
                  )}
                </div>
              </div>

              {/* Linked tax declarations (owners) */}
              <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <User className="h-4 w-4 text-[#00154A]" />
                  <span className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
                    Tax Declarations & Owners
                  </span>
                  <span className="ml-auto font-inter text-xs text-slate-400">
                    {propertyDecls.length} record{propertyDecls.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {propertyDecls.length === 0 ? (
                  <p className="font-inter p-6 text-center text-xs text-slate-400">
                    No tax declarations found for this property.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {propertyDecls.map((d) => {
                      const owner = d.taxpayers;
                      return (
                        <div key={d.id} className="p-4 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <TdBadge label="TD" value={d.td_number} />
                            {d.classification && (
                              <span
                                className={`rounded-full px-2 py-0.5 font-inter text-xs font-medium ${classColors[d.classification] ?? 'bg-gray-100 text-gray-600'}`}
                              >
                                {d.classification}
                              </span>
                            )}
                            {d.status && (
                              <span
                                className={`rounded-full px-2 py-0.5 font-inter text-xs font-medium ${statusColors[d.status] ?? 'bg-gray-100 text-gray-600'}`}
                              >
                                {d.status}
                              </span>
                            )}
                            {d.effectivity_year && (
                              <span className="rounded-full bg-slate-50 px-2 py-0.5 font-inter text-xs text-slate-500">
                                AY {d.effectivity_year}
                              </span>
                            )}
                          </div>
                          {owner && (
                            <div className="rounded-md bg-slate-50 p-3 space-y-1">
                              <p className="font-inter text-xs font-semibold text-slate-700">
                                {owner.owner_name}
                              </p>
                              {owner.tin && (
                                <p className="font-inter text-xs text-slate-500">
                                  TIN: {owner.tin}
                                </p>
                              )}
                              {owner.address && (
                                <p className="font-inter text-xs text-slate-500">
                                  {owner.address}
                                </p>
                              )}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <ValueRow label="Market Value" value={`₱ ${fmt(d.total_market_value)}`} />
                            <ValueRow label="Assessed Value" value={`₱ ${fmt(d.total_assessed_value)}`} />
                            {d.land_area != null && (
                              <ValueRow label="Land Area" value={`${d.land_area.toLocaleString()} sqm`} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Map panel ──────────────────────────────────────────────── */}
        <div
          className="sticky top-4 flex-1 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm"
          style={{ height: 'calc(100vh - 18rem)' }}
        >
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            <MapPin className="h-4 w-4 text-[#00154A]" />
            <span className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
              Property Map
            </span>
            {mapProperties.length > 0 && (
              <span className="ml-auto font-inter text-xs text-slate-400">
                {mapProperties.length} marker{mapProperties.length !== 1 ? 's' : ''}
                {mapFocusId && ' · zoomed in'}
              </span>
            )}
            {mapFocusId && (
              <button
                type="button"
                onClick={() => setMapFocusId(null)}
                title="Zoom back out"
                className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="h-[calc(100%-2.5rem)]">
            <PropertyMap properties={mapProperties} focusedId={mapFocusId} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small presentational sub-components ──────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <span className="font-inter text-xs text-slate-500 shrink-0">{label}:</span>
      <span className="font-inter text-xs text-slate-700 break-all">{value}</span>
    </div>
  );
}

function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-inter text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-inter text-xs font-medium text-[#595a5d]">{value}</p>
    </div>
  );
}

function TdBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#00154A]/5 px-2 py-0.5 font-inter text-xs font-medium text-[#00154A]">
      <FileText className="h-3 w-3" />
      {label}: {value}
    </span>
  );
}
