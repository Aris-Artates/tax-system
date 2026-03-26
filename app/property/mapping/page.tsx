"use client";

/**
 * Tax Mapping — app/property/mapping/page.tsx
 *
 * Barangay list is hardcoded.
 * A search bar (shadcn Input style) is placed above the barangay sidebar list
 * to filter entries dynamically — no layout or structure has been changed.
 *
 * TODO: Replace hardcoded barangayStats and propertiesByBarangay with data
 *       fetched from Supabase (via /api/property/mapping?barangay_id=X).
 */

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, MapPinned, Eye, Search, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const STA_RITA_BARANGAY_COORDINATES: Array<{
  name: string;
  coordinates: [number, number];
}> = [
  { name: "Alegria", coordinates: [11.3753963, 124.9942696] },
  { name: "Anibongan", coordinates: [11.4691187, 124.9963205] },
  { name: "Aslum", coordinates: [11.4337161, 124.9962983] },
  { name: "Bagolibas", coordinates: [11.3942155, 125.0012056] },
  { name: "Binanalan", coordinates: [11.4939885, 125.027347] },
  { name: "Cabacungan", coordinates: [11.3842767, 125.0076798] },
  { name: "Cabunga-an", coordinates: [11.4691011, 124.8831102] },
  { name: "Camayse", coordinates: [11.4692933, 125.0074848] },
  { name: "Cansadong", coordinates: [11.4935259, 124.9049655] },
  { name: "Caticugan", coordinates: [11.3324706, 125.0136457] },
  { name: "Dampigan", coordinates: [11.3321189, 124.9903609] },
  { name: "Guinbalot-an", coordinates: [11.4333593, 124.9778961] },
  { name: "Hinangudtan", coordinates: [11.4674838, 124.9162914] },
  { name: "Igang-igang", coordinates: [11.4651019, 124.8622936] },
  { name: "La Paz", coordinates: [11.3988559, 124.9877928] },
  { name: "Lupig", coordinates: [11.4283624, 125.0123349] },
  { name: "Magsaysay", coordinates: [11.3622912, 125.0263337] },
  { name: "Maligaya", coordinates: [11.4587867, 125.052894] },
  { name: "New Manunca", coordinates: [11.4444289, 125.0125344] },
  { name: "Old Manunca", coordinates: [11.4380195, 125.0153845] },
  { name: "Pagsulhogon", coordinates: [11.3728397, 125.0213201] },
  { name: "Salvacion", coordinates: [11.4364937, 124.9644831] },
  { name: "San Eduardo", coordinates: [11.474091, 125.0410392] },
  { name: "San Isidro", coordinates: [11.5062627, 125.0263517] },
  { name: "San Juan", coordinates: [11.3186042, 124.9775722] },
  { name: "San Pascual (Crossing)", coordinates: [11.40364, 124.9964841] },
  { name: "San Pedro", coordinates: [11.3079778, 124.9832423] },
  { name: "San Roque", coordinates: [11.4525, 124.945] },
  { name: "Santa Elena", coordinates: [11.3553584, 125.0105753] },
  { name: "Tagacay", coordinates: [11.4938223, 124.884314] },
  { name: "Tominamos", coordinates: [11.4523264, 125.0204] },
  { name: "Tulay", coordinates: [11.4691438, 125.0195549] },
  { name: "Union", coordinates: [11.4457647, 125.0825161] },
  {
    name: "Bokinggan Poblacion (Zone I)",
    coordinates: [11.4525024, 124.9449563],
  },
  {
    name: "Bougainvilla Poblacion (Zone II)",
    coordinates: [11.4513904, 124.9425396],
  },
  {
    name: "Gumamela Poblacion (Zone III)",
    coordinates: [11.4621237, 124.9451521],
  },
  { name: "Rosal Poblacion (Zone IV)", coordinates: [11.4693052, 124.9532551] },
  { name: "Santan Poblacion (Zone V)", coordinates: [11.4515928, 124.9407345] },
];

const BarangayLeafletMap = dynamic(
  () => import("@/components/BarangayLeafletMap"),
  {
    ssr: false,
  },
);

type LatLngTuple = [number, number];

const barangays = STA_RITA_BARANGAY_COORDINATES.map((item) => item.name);
const barangayCenters: Record<string, LatLngTuple> = Object.fromEntries(
  STA_RITA_BARANGAY_COORDINATES.map((item) => [item.name, item.coordinates]),
);

// ── Types ──────────────────────────────────────────────────────────────────────
type PropertyEntry = {
  tdNumber: string;
  owner: string;
  classification: string;
  landArea: string;
  marketValue: string;
  assessedValue: string;
};

type BarangayStats = {
  total: number;
  residential: number;
  commercial: number;
  agricultural: number;
  landArea: string;
  marketValue: string;
  assessedValue: string;
};

const classificationColors: Record<string, string> = {
  Residential: "bg-blue-50 text-blue-700",
  Commercial: "bg-amber-50 text-amber-700",
  Agricultural: "bg-green-50 text-green-700",
  Industrial: "bg-purple-50 text-purple-700",
  Special: "bg-orange-50 text-orange-700",
};

// ─────────────────────────────────────────────────────────────────────────────

type Barangay = {
  id: number;
  name: string;
};

export default function TaxMappingPage() {
  const router = useRouter();

  const [barangayList, setBarangayList] = useState<Barangay[]>([]);
  const [selectedBarangay, setSelectedBarangay] = useState(
    "Bokinggan Poblacion (Zone I)",
  );
  const [selectedBarangayId, setSelectedBarangayId] = useState<number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [properties, setProperties] = useState<PropertyEntry[]>([]);
  const [stats, setStats] = useState<BarangayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingProperties, setFetchingProperties] = useState(false);

  // Fetch barangay list on mount
  useEffect(() => {
    async function fetchBarangays() {
      try {
        const res = await fetch("/api/barangays/list");
        const data = await res.json();
        if (res.ok && data.barangays) {
          setBarangayList(data.barangays);
          // Try to find the initial selected barangay ID
          const initial = data.barangays.find(
            (b: Barangay) => b.name === selectedBarangay,
          );
          if (initial) setSelectedBarangayId(initial.id);
        }
      } catch (err) {
        console.error("Failed to load barangays:", err);
        toast.error("Failed to load barangay list.");
      } finally {
        setLoading(false);
      }
    }
    fetchBarangays();
  }, [selectedBarangay]);

  // Fetch properties when selectedBarangayId changes
  useEffect(() => {
    if (!selectedBarangayId) return;

    async function fetchProperties() {
      setFetchingProperties(true);
      try {
        const res = await fetch(
          `/api/property/mapping?barangay_id=${selectedBarangayId}`,
        );
        const data = await res.json();

        if (res.ok && data.properties) {
          const raw = data.properties;

          // Map to PropertyEntry
          const mapped: PropertyEntry[] = raw.map((p: any) => ({
            tdNumber: p.td_number || "—",
            owner: p.taxpayers?.owner_name || "—",
            classification: p.classification || "—",
            landArea:
              p.land_area != null
                ? p.land_area.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00",
            marketValue:
              p.total_market_value != null
                ? p.total_market_value.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00",
            assessedValue:
              p.total_assessed_value != null
                ? p.total_assessed_value.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00",
          }));

          setProperties(mapped);

          // Calculate aggregate stats
          const total = raw.length;
          const residential = raw.filter(
            (p: any) => p.classification === "Residential",
          ).length;
          const commercial = raw.filter(
            (p: any) => p.classification === "Commercial",
          ).length;
          const agricultural = raw.filter(
            (p: any) => p.classification === "Agricultural",
          ).length;
          const totalLandArea = raw.reduce(
            (sum: number, p: any) => sum + (p.land_area || 0),
            0,
          );
          const totalMarketValue = raw.reduce(
            (sum: number, p: any) => sum + (p.total_market_value || 0),
            0,
          );
          const totalAssessedValue = raw.reduce(
            (sum: number, p: any) => sum + (p.total_assessed_value || 0),
            0,
          );

          setStats({
            total,
            residential,
            commercial,
            agricultural,
            landArea: totalLandArea.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            marketValue: totalMarketValue.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            assessedValue: totalAssessedValue.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          });
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
        toast.error("Failed to load property data.");
      } finally {
        setFetchingProperties(false);
      }
    }

    fetchProperties();
  }, [selectedBarangayId]);

  // Filter the barangay list dynamically based on search input
  const filteredBarangays = useMemo(() => {
    if (!searchQuery.trim()) return barangayList;
    const q = searchQuery.toLowerCase();
    return barangayList.filter((b) => b.name.toLowerCase().includes(q));
  }, [searchQuery, barangayList]);

  const selectedBarangayCenter =
    barangayCenters[selectedBarangay] ??
    barangayCenters["Bokinggan Poblacion (Zone I)"];

  function handleBarangaySelect(b: Barangay) {
    setSelectedBarangay(b.name);
    setSelectedBarangayId(b.id);
    setSearchQuery(""); // clear search after selection
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => router.push("/property")}
        className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Property Registry
      </button>

      <header className="mb-6">
        <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
          Tax Mapping
        </h1>
        <p className="font-inter mt-1 text-xs text-slate-400">
          Property Distribution by Barangay – Municipality of Sta. Rita, Samar
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* ── Barangay Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
            {/* Sidebar header */}
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-[#00154A]" />
                <h2 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
                  Barangays
                </h2>
              </div>
            </div>

            {/* Search bar — shadcn Input style */}
            <div className="border-b border-gray-100 px-3 py-2">
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 transition-colors focus-within:border-blue-200 focus-within:ring-1 focus-within:ring-blue-100">
                <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search barangay..."
                  className="w-full bg-transparent font-inter text-xs text-slate-700 outline-none placeholder:text-slate-400"
                  aria-label="Search barangays"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="shrink-0 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Barangay list */}
            <nav className="max-h-115 overflow-y-auto p-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  <p className="mt-2 font-inter text-xs text-slate-400">
                    Loading barangays...
                  </p>
                </div>
              ) : filteredBarangays.length === 0 ? (
                <p className="px-3 py-4 text-center font-inter text-xs text-slate-400">
                  No barangay matches &ldquo;{searchQuery}&rdquo;.
                </p>
              ) : (
                filteredBarangays.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleBarangaySelect(b)}
                    className={`font-inter w-full rounded px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                      selectedBarangay === b.name
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : "text-slate-500 hover:bg-gray-50 hover:text-slate-700"
                    }`}
                  >
                    {b.name}
                  </button>
                ))
              )}
            </nav>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="space-y-6 lg:col-span-3">
          {/* Barangay Header */}
          <div className="flex items-center gap-3 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
            <div className="rounded-md bg-slate-100 p-2">
              <MapPinned className="h-5 w-5 text-[#00154A]" />
            </div>
            <div>
              <h2 className="font-lexend text-lg font-bold text-[#595a5d]">
                Barangay {selectedBarangay}
              </h2>
              <p className="font-inter text-xs text-slate-400">
                Municipality of Sta. Rita, Samar
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          {fetchingProperties ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-sm border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="h-3 w-20 rounded bg-gray-100"></div>
                  <div className="mt-2 h-6 w-16 rounded bg-gray-100"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  label: "Total Properties",
                  value: stats.total.toLocaleString(),
                  color: "text-[#595a5d]",
                },
                {
                  label: "Residential",
                  value: stats.residential.toLocaleString(),
                  color: "text-blue-600",
                },
                {
                  label: "Commercial",
                  value: stats.commercial.toLocaleString(),
                  color: "text-amber-600",
                },
                {
                  label: "Agricultural",
                  value: stats.agricultural.toLocaleString(),
                  color: "text-green-600",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <p className="font-inter text-xs text-slate-400">{s.label}</p>
                  <p
                    className={`font-lexend mt-1 text-xl font-bold ${s.color}`}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-gray-200 bg-white p-6 text-center shadow-sm">
              <p className="font-inter text-xs text-slate-400">
                No property data available for Barangay {selectedBarangay}.
              </p>
            </div>
          )}

          {/* Valuation Stats */}
          {fetchingProperties ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-sm border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="h-3 w-24 rounded bg-gray-100"></div>
                  <div className="mt-2 h-4 w-32 rounded bg-gray-100"></div>
                </div>
              ))}
            </div>
          ) : (
            stats && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    label: "Total Land Area (sqm)",
                    value: stats.landArea,
                    color: "text-[#595a5d]",
                  },
                  {
                    label: "Total Market Value (₱)",
                    value: stats.marketValue,
                    color: "text-amber-600",
                  },
                  {
                    label: "Total Assessed Value (₱)",
                    value: stats.assessedValue,
                    color: "text-green-600",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <p className="font-inter text-xs text-slate-400">
                      {s.label}
                    </p>
                    <p
                      className={`font-lexend mt-1 text-sm font-bold ${s.color}`}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Map */}
          <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
                Property Map – Barangay {selectedBarangay}
              </h3>
            </div>
            <div className="bg-gray-50">
              <BarangayLeafletMap
                barangayName={selectedBarangay}
                center={selectedBarangayCenter}
                zoom={15}
              />
            </div>
          </div>

          {/* Property Table */}
          <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
                Properties in Barangay {selectedBarangay}
                {properties.length > 0 && (
                  <span className="ml-2 font-normal text-slate-400">
                    ({properties.length} shown)
                  </span>
                )}
              </h3>
            </div>

            {fetchingProperties ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                <p className="mt-4 font-inter text-xs text-slate-400">
                  Loading properties...
                </p>
              </div>
            ) : properties.length === 0 ? (
              <p className="font-inter p-6 text-center text-xs text-slate-400">
                No property records found for Barangay {selectedBarangay}.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full font-inter text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      {[
                        "TD Number",
                        "Owner Name",
                        "Classification",
                        "Land Area (sqm)",
                        "Market Value (₱)",
                        "Assessed Value (₱)",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-4 py-3 text-left font-semibold uppercase tracking-wide text-[#595a5d]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr
                        key={p.tdNumber}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-[#595a5d]">
                          {p.tdNumber}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                          {p.owner}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${classificationColors[p.classification] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {p.classification}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {p.landArea}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {p.marketValue}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-[#595a5d]">
                          {p.assessedValue}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            title="View"
                            className="cursor-pointer text-slate-400 transition-colors hover:text-blue-600"
                            onClick={() =>
                              router.push(`/property/listing?td=${p.tdNumber}`)
                            }
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
