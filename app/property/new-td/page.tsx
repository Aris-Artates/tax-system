"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  MapPin,
  Layers,
  Home,
  BarChart3,
  FileText,
  User,
  Printer,
  ChevronDown,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@/components/ui/select";

import { ValidatedInput } from "@/components/ui/ValidatedInput";

import {
  TaxDeclarationPrint,
  type TaxDeclarationData,
} from "@/components/print/TaxDeclarationPrint";

function parseNumeric(v: string): number | null {
  const cleaned = v.replace(/,/g, "").trim();
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function parseNumericString(v: string | undefined | null): number {
  if (!v) return 0;
  const parsed = parseNumeric(v);
  return parsed !== null ? parsed : 0;
}

function normalizeBarangayName(name: string): string {
  return name.trim().toLowerCase();
}

// ── Static option sets (small, no DB fetch needed) ────────────────────────────
const DECLARATION_TYPES: ComboboxOption[] = [
  { value: "New", label: "New" },
  { value: "Revision", label: "Revision" },
  { value: "Cancellation", label: "Cancellation" },
  { value: "Transfer", label: "Transfer" },
];

const CLASSIFICATIONS: ComboboxOption[] = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Agricultural", label: "Agricultural" },
  { value: "Industrial", label: "Industrial" },
  { value: "Special", label: "Special" },
  { value: "Timberland", label: "Timberland" },
  { value: "Mineral", label: "Mineral" },
];

const ACTUAL_USE_OPTIONS: ComboboxOption[] = [
  { value: "Single-Family Dwelling", label: "Single-Family Dwelling" },
  { value: "Multi-Family Dwelling", label: "Multi-Family Dwelling" },
  { value: "Vacant Residential Lot", label: "Vacant Residential Lot" },
  { value: "Retail", label: "Retail" },
  { value: "Office", label: "Office" },
  { value: "Warehouse", label: "Warehouse" },
  { value: "Rice Land", label: "Rice Land" },
  { value: "Corn Land", label: "Corn Land" },
  { value: "Coconut Land", label: "Coconut Land" },
  { value: "Industrial Plant Site", label: "Industrial Plant Site" },
];

const STRUCTURAL_TYPES: ComboboxOption[] = [
  { value: "Type I Wood", label: "Type I Wood" },
  { value: "Type II Mixed", label: "Type II Mixed" },
  { value: "Type III Masonry/Steel", label: "Type III Masonry/Steel" },
  { value: "Type IV Steel/RC", label: "Type IV Steel/RC" },
  { value: "Type V RC", label: "Type V RC" },
];

const BUILDING_KINDS: ComboboxOption[] = [
  { value: "Single Detached", label: "Single Detached" },
  { value: "Duplex", label: "Duplex" },
  { value: "Apartment", label: "Apartment" },
  { value: "Townhouse", label: "Townhouse" },
  { value: "Commercial Building", label: "Commercial Building" },
  { value: "Warehouse", label: "Warehouse" },
  { value: "Office Building", label: "Office Building" },
  { value: "Industrial Building", label: "Industrial Building" },
  { value: "Institutional Building", label: "Institutional Building" },
  { value: "Mixed-Use Building", label: "Mixed-Use Building" },
];

const CURRENT_YEAR = new Date().getFullYear();

const TAX_YEAR_OPTIONS: ComboboxOption[] = Array.from(
  { length: 21 },
  (_, index) => {
    const year = String(CURRENT_YEAR + 5 - index);
    return { value: year, label: year };
  },
);

const QUARTER_OPTIONS = ["1st", "2nd", "3rd", "4th"] as const;

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

export default function NewTaxDeclarationPage() {
  const router = useRouter();

  // ── Remote option lists ──────────────────────────────────────────────────
  const [barangayOptions, setBarangayOptions] = useState<ComboboxOption[]>([]);
  const [taxpayerOptions, setTaxpayerOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  type TaxpayerRecord = {
    tin: string | null;
    address: string | null;
    owner_type: string | null;
  };
  const [taxpayerMap, setTaxpayerMap] = useState<Map<string, TaxpayerRecord>>(
    new Map(),
  );

  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [barangayRes, taxpayerRes] = await Promise.all([
          fetch("/api/barangays/list"),
          fetch("/api/taxpayers/list"),
        ]);

        const barangayData = barangayRes.ok ? await barangayRes.json() : {};
        const decodedBarangays = barangayData._data ? JSON.parse(atob(atob(atob(barangayData._data)))) : (barangayData.barangays ?? []);
        
        const taxpayerData = taxpayerRes.ok ? await taxpayerRes.json() : {};
        const taxpayers = taxpayerData._data ? JSON.parse(atob(atob(atob(taxpayerData._data)))) : (taxpayerData.taxpayers ?? []);

        const fallbackBarangays: ComboboxOption[] =
          STA_RITA_BARANGAY_COORDINATES.map((b) => ({
            value: b.name,
            label: b.name,
          })).sort((a, b) => a.label.localeCompare(b.label));

        const remoteBarangays: ComboboxOption[] = decodedBarangays.map(
          (b: { id: number; name: string }) => ({
            value: String(b.id),
            label: b.name,
          }),
        );

        setBarangayOptions(
          remoteBarangays.length > 0 ? remoteBarangays : fallbackBarangays,
        );

        type RawTaxpayer = {
          id: number;
          owner_name: string;
          tin: string | null;
          address: string | null;
          owner_type: string | null;
        };
        setTaxpayerOptions(
          taxpayers.map((t: RawTaxpayer) => ({
            value: String(t.id),
            label: t.owner_name,
            sublabel: t.tin ? `TIN: ${t.tin}` : undefined,
          })),
        );

        const map = new Map<string, TaxpayerRecord>();
        taxpayers.forEach((t: RawTaxpayer) => {
          map.set(String(t.id), {
            tin: t.tin,
            address: t.address,
            owner_type: t.owner_type,
          });
        });
        setTaxpayerMap(map);
      } catch {
        const fallbackBarangays: ComboboxOption[] =
          STA_RITA_BARANGAY_COORDINATES.map((b) => ({
            value: b.name,
            label: b.name,
          })).sort((a, b) => a.label.localeCompare(b.label));

        setBarangayOptions(fallbackBarangays);
      } finally {
        setLoading(false);
      }
    }
    loadReferenceData();
  }, []);

  const [tdNumber, setTdNumber] = useState("");
  const [pin, setPin] = useState("");
  const [prevTd, setPrevTd] = useState("");
  const [declarationType, setDeclarationType] = useState("New");
  const [arpNumber, setArpNumber] = useState("");
  const [taxYear, setTaxYear] = useState("");

  const [taxpayerId, setTaxpayerId] = useState("");
  const [tin, setTin] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [ownerType, setOwnerType] = useState("Individual");

  const [barangayId, setBarangayId] = useState("");
  const [street, setStreet] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [blockNumber, setBlockNumber] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");

  const [classification, setClassification] = useState("Residential");
  const [actualUse, setActualUse] = useState("");
  const [landArea, setLandArea] = useState("");
  const [landUnitValue, setLandUnitValue] = useState("");
  const [landMarketValue, setLandMarketValue] = useState("");
  const [landAssessLevel, setLandAssessLevel] = useState("");
  const [landAssessedValue, setLandAssessedValue] = useState("");

  const [buildingKind, setBuildingKind] = useState("");
  const [structuralType, setStructuralType] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [bldgMarketValue, setBldgMarketValue] = useState("");
  const [bldgAssessLevel, setBldgAssessLevel] = useState("");
  const [bldgAssessedValue, setBldgAssessedValue] = useState("");

  const [effectivityYear, setEffectivityYear] = useState("");
  const [effectivityQuarter, setEffectivityQuarter] = useState("1st");

  const fullTdNumber = tdNumber.trim()
    ? tdNumber.startsWith("TD-")
      ? tdNumber.trim()
      : `TD-${tdNumber.trim()}`
    : "";

  useEffect(() => {
    if (!taxpayerId) return;
    const found = taxpayerMap.get(taxpayerId);
    if (!found) return;

    setTin(found.tin ?? "");
    setOwnerAddress(found.address ?? "");
    setOwnerType(
      (found.owner_type as
        | "Individual"
        | "Corporation"
        | "Government"
        | null) ?? "Individual",
    );
  }, [taxpayerId, taxpayerMap]);

  useEffect(() => {
    const area = parseNumeric(landArea);
    const unitValue = parseNumeric(landUnitValue);

    if (
      !Number.isFinite(area) ||
      !Number.isFinite(unitValue) ||
      area! <= 0 ||
      unitValue! <= 0
    ) {
      setLandMarketValue("");
      return;
    }

    setLandMarketValue((area! * unitValue!).toFixed(2));
  }, [landArea, landUnitValue]);

  useEffect(() => {
    const marketValue = parseNumericString(landMarketValue);
    const assessmentLevel = parseNumericString(landAssessLevel);

    if (
      !Number.isFinite(marketValue) ||
      !Number.isFinite(assessmentLevel) ||
      marketValue <= 0 ||
      assessmentLevel <= 0
    ) {
      setLandAssessedValue("");
      return;
    }

    setLandAssessedValue((marketValue * (assessmentLevel / 100)).toFixed(2));
  }, [landMarketValue, landAssessLevel]);

  useEffect(() => {
    const buildingArea = parseNumericString(floorArea);
    const marketValue = parseNumericString(bldgMarketValue);
    const assessmentLevel = parseNumericString(bldgAssessLevel);

    if (
      !Number.isFinite(buildingArea) ||
      !Number.isFinite(marketValue) ||
      !Number.isFinite(assessmentLevel) ||
      buildingArea <= 0 ||
      marketValue <= 0 ||
      assessmentLevel <= 0
    ) {
      setBldgAssessedValue("");
      return;
    }

    setBldgAssessedValue((marketValue * (assessmentLevel / 100)).toFixed(2));
  }, [floorArea, bldgMarketValue, bldgAssessLevel]);

  const selectedBarangayLabel =
    barangayOptions.find((b) => b.value === barangayId)?.label ?? "";
  const selectedTaxpayerLabel =
    taxpayerOptions.find((t) => t.value === taxpayerId)?.label ?? "";
  const totalMarketValue =
    (parseFloat(landMarketValue) || 0) + (parseFloat(bldgMarketValue) || 0);
  const totalAssessedValue =
    (parseFloat(landAssessedValue) || 0) + (parseFloat(bldgAssessedValue) || 0);

  const [printData, setPrintData] = useState<TaxDeclarationData | null>(null);

  useEffect(() => {
    if (!printData) return;
    const t = setTimeout(() => {
      window.print();
      window.addEventListener("afterprint", () => setPrintData(null), {
        once: true,
      });
    }, 80);
    return () => clearTimeout(t);
  }, [printData]);

  function buildPrintSnapshot(): TaxDeclarationData {
    return {
      id: 0,
      td_number: fullTdNumber || "(DRAFT)",
      arp_number: arpNumber || null,
      declaration_type:
        (declarationType as TaxDeclarationData["declaration_type"]) || "New",
      tax_year: parseInt(taxYear) || new Date().getFullYear(),
      effectivity_year: parseInt(effectivityYear) || new Date().getFullYear(),
      effectivity_quarter:
        effectivityQuarter as TaxDeclarationData["effectivity_quarter"],
      previous_td_id: prevTd ? parseInt(prevTd) : null,
      classification: classification as TaxDeclarationData["classification"],
      actual_use: actualUse || null,
      land_area: parseFloat(landArea) || null,
      land_unit_value: parseFloat(landUnitValue) || null,
      land_market_value: parseFloat(landMarketValue) || null,
      land_assessment_level: parseFloat(landAssessLevel) || null,
      land_assessed_value: parseFloat(landAssessedValue) || null,
      total_market_value:
        (parseFloat(landMarketValue) || 0) +
          (parseFloat(bldgMarketValue) || 0) || null,
      total_assessed_value:
        (parseFloat(landAssessedValue) || 0) +
          (parseFloat(bldgAssessedValue) || 0) || null,
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      taxpayers: {
        id: parseInt(taxpayerId) || 0,
        owner_name: selectedTaxpayerLabel || "(Not selected)",
        first_name: null,
        middle_name: null,
        last_name: null,
        suffix: null,
        tin: tin || null,
        address: ownerAddress || null,
        owner_type: ownerType as TaxDeclarationData["taxpayers"]["owner_type"],
        phone: null,
        email: null,
      },
      properties: {
        id: 0,
        pin: pin || "—",
        municipality: "Sta. Rita",
        province: "Samar",
        street: street || null,
        lot_number: lotNumber || null,
        block_number: blockNumber || null,
        survey_number: surveyNumber || null,
        barangays: {
          id: parseInt(barangayId) || 0,
          name: selectedBarangayLabel || "—",
          municipality: "Sta. Rita",
          province: "Samar",
        },
      },
      buildings:
        buildingKind || structuralType || floorArea || yearBuilt
          ? [
              {
                id: 0,
                td_id: 0,
                kind_of_building: buildingKind || null,
                structural_type:
                  (structuralType as TaxDeclarationData["buildings"][0]["structural_type"]) ||
                  null,
                floor_area: parseFloat(floorArea) || null,
                year_built: parseInt(yearBuilt) || null,
                age_years: yearBuilt
                  ? new Date().getFullYear() - parseInt(yearBuilt)
                  : null,
                condition: null,
                market_value: parseFloat(bldgMarketValue) || null,
                assessment_level: parseFloat(bldgAssessLevel) || null,
                assessed_value: parseFloat(bldgAssessedValue) || null,
                created_at: new Date().toISOString(),
              },
            ]
          : [],
    };
  }

  function handlePrint() {
    setPrintData(buildPrintSnapshot());
  }

  async function handleSave() {
    const selectedBarangayId = Number(barangayId);
    const isBarangayIdNumeric =
      Number.isFinite(selectedBarangayId) && selectedBarangayId > 0;

    if (!tdNumber.trim() || !pin.trim() || !taxpayerId || !barangayId) {
      toast.error(
        "Please fill in TD Number, PIN, Owner/Taxpayer, and Barangay.",
      );
      return;
    }

    setSaving(true);

    try {
      const matchedBarangay = STA_RITA_BARANGAY_COORDINATES.find(
        (b) =>
          normalizeBarangayName(b.name) ===
          normalizeBarangayName(selectedBarangayLabel),
      );

      const payload = {
        td_number: fullTdNumber,
        arp_number: arpNumber.trim() || null,
        declaration_type: declarationType,
        tax_year: Number(taxYear) || new Date().getFullYear(),
        effectivity_year: Number(effectivityYear) || new Date().getFullYear(),
        effectivity_quarter: effectivityQuarter,
        previous_td_id: parseNumeric(prevTd),
        classification,
        actual_use: actualUse.trim() || null,
        land_area: parseNumeric(landArea),
        land_unit_value: parseNumeric(landUnitValue),
        land_market_value: parseNumeric(landMarketValue),
        land_assessment_level: parseNumeric(landAssessLevel),
        land_assessed_value: parseNumeric(landAssessedValue),
        total_market_value: totalMarketValue || null,
        total_assessed_value: totalAssessedValue || null,
        taxpayer_id: taxpayerId,
        property: {
          pin: pin.trim(),
          barangay_id: isBarangayIdNumeric ? selectedBarangayId : null,
          barangay_name: selectedBarangayLabel || barangayId,
          municipality: "Sta. Rita",
          province: "Samar",
          street: street.trim() || null,
          lot_number: lotNumber.trim() || null,
          block_number: blockNumber.trim() || null,
          survey_number: surveyNumber.trim() || null,
          latitude: matchedBarangay?.coordinates[0] ?? null,
          longitude: matchedBarangay?.coordinates[1] ?? null,
        },
        building: {
          kind_of_building: buildingKind.trim() || null,
          structural_type: structuralType || null,
          floor_area: parseNumeric(floorArea),
          year_built: parseNumeric(yearBuilt),
          market_value: parseNumeric(bldgMarketValue),
          assessment_level: parseNumeric(bldgAssessLevel),
          assessed_value: parseNumeric(bldgAssessedValue),
          condition: null,
        },
      };

      const res = await fetch("/api/tax-declarations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || "Unable to save tax declaration.");
        return;
      }

      toast.success("Tax Declaration saved successfully.");
      router.push(`/property?td=${encodeURIComponent(fullTdNumber)}`);
    } catch {
      toast.error("Unable to save tax declaration. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <header>
        <button
          type="button"
          onClick={() => router.push("/property")}
          className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Property Registry
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex mb-11 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
                New Tax Declaration
              </h1>
              <p className="font-inter mt-1 text-xs text-slate-400">
                Create Tax Declaration for Newly Declared Properties –
                Municipality of Sta. Rita, Samar
              </p>
            </div>
          </div>

          {printData && (
            <div className="sr-only print:not-sr-only">
              <TaxDeclarationPrint data={printData} />
            </div>
          )}

          <div className="space-y-6 lg:col-span-2">
            <div className="lg:-mt-3">
              <Section
                icon={<FileText className="h-5 w-5 text-[#00154A]" />}
                title="Declaration Information"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ValidatedInput
                    type="td-number"
                    label="TD Number"
                    placeholder="e.g. 2024-0001"
                    value={tdNumber}
                    onChange={(v) => setTdNumber(v)}
                    required
                  />
                  <ValidatedInput
                    type="pin"
                    label="Property Index Number (PIN)"
                    placeholder="e.g. 088-01-001-01-001"
                    value={pin}
                    onChange={(v) => setPin(v)}
                    required
                  />
                  <ValidatedInput
                    type="td-number"
                    label="Previous TD Number"
                    placeholder="If revision or cancellation"
                    value={prevTd}
                    onChange={(v) => setPrevTd(v)}
                  />
                  <Combobox
                    label="Declaration Type"
                    placeholder="Select type"
                    searchPlaceholder="Search type..."
                    options={DECLARATION_TYPES}
                    value={declarationType}
                    onChange={setDeclarationType}
                    required
                  />
                  <ValidatedInput
                    type="arp-number"
                    label="ARP Number"
                    placeholder="Assessment Roll of Property #"
                    value={arpNumber}
                    onChange={(v) => setArpNumber(v)}
                  />
                  <Combobox
                    label="Tax Year"
                    placeholder="Select tax year"
                    searchPlaceholder="Search year..."
                    options={TAX_YEAR_OPTIONS}
                    value={taxYear}
                    onChange={setTaxYear}
                    required
                  />
                </div>
              </Section>
            </div>

            <Section
              icon={<User className="h-5 w-5 text-[#00154A]" />}
              title="Owner Information"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Combobox
                    label="Owner / Taxpayer"
                    placeholder={
                      loading
                        ? "Loading taxpayers..."
                        : "Select or search taxpayer"
                    }
                    searchPlaceholder="Type name or TIN to search..."
                    options={taxpayerOptions}
                    value={taxpayerId}
                    onChange={setTaxpayerId}
                    required
                    disabled={loading}
                  />
                  <p className="font-inter mt-1 text-xs text-slate-400">
                    Select an existing taxpayer or{" "}
                    <button
                      type="button"
                      className="text-blue-600 underline-offset-2 hover:underline"
                      onClick={() => router.push("/taxpayers?action=new")}
                    >
                      register a new one
                    </button>
                    .
                  </p>
                </div>

                <div>
                  <label className="font-inter text-xs font-medium text-slate-600 block mb-1">
                    Tax Identification Number (TIN)
                  </label>
                  <input
                    type="text"
                    value={tin}
                    readOnly
                    placeholder="Auto-filled from taxpayer"
                    className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 font-inter text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none cursor-not-allowed opacity-60"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-inter text-xs font-medium text-slate-600 block mb-1">
                    Owner Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ownerAddress}
                    readOnly
                    placeholder="Complete address of owner"
                    className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 font-inter text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none cursor-not-allowed opacity-60"
                  />
                </div>

                <div>
                  <label className="font-inter text-xs font-medium text-slate-600">
                    Owner Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 flex gap-2">
                    {(["Individual", "Corporation", "Government"] as const).map(
                      (t) => (
                        <button
                          key={t}
                          type="button"
                          disabled
                          className={`font-inter rounded-md border px-3 py-2 text-xs transition ${ownerType === t ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-slate-600"} cursor-not-allowed opacity-80`}
                        >
                          {t}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </Section>

            <Section
              icon={<MapPin className="h-5 w-5 text-[#00154A]" />}
              title="Property Location"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-inter text-xs font-medium text-slate-600">
                    Municipality <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                    <span className="font-inter text-sm text-slate-500">
                      Sta. Rita, Samar
                    </span>
                  </div>
                </div>

                <Combobox
                  label="Barangay"
                  placeholder={
                    loading ? "Loading barangays..." : "Select barangay"
                  }
                  searchPlaceholder="Search barangay..."
                  options={barangayOptions}
                  value={barangayId}
                  onChange={setBarangayId}
                  required
                  disabled={loading}
                />

                <ValidatedInput
                  type="text"
                  label="Street / Road"
                  placeholder="Street or road name"
                  value={street}
                  onChange={setStreet}
                />
                <ValidatedInput
                  type="lot-number"
                  label="Lot Number"
                  placeholder="e.g. 12"
                  value={lotNumber}
                  onChange={(v) => setLotNumber(v)}
                />
                <ValidatedInput
                  type="lot-number"
                  label="Block Number"
                  placeholder="e.g. 5"
                  value={blockNumber}
                  onChange={setBlockNumber}
                />
                <ValidatedInput
                  type="text"
                  label="Survey / Cadastral Number"
                  placeholder="e.g. 088-D"
                  value={surveyNumber}
                  onChange={setSurveyNumber}
                />
              </div>
            </Section>

            <Section
              icon={<Layers className="h-5 w-5 text-[#00154A]" />}
              title="Land Details"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Combobox
                  label="Classification"
                  placeholder="Select classification"
                  searchPlaceholder="Search classification..."
                  options={CLASSIFICATIONS}
                  value={classification}
                  onChange={setClassification}
                  required
                />

                <Combobox
                  label="Actual Use"
                  placeholder="Select actual use"
                  searchPlaceholder="Search actual use..."
                  options={ACTUAL_USE_OPTIONS}
                  value={actualUse}
                  onChange={setActualUse}
                  required
                />
                <ValidatedInput
                  type="decimal-numeric"
                  label="Land Area (sqm)"
                  placeholder="e.g. 250.00"
                  value={landArea}
                  onChange={(v) => setLandArea(v)}
                  required
                />
                <ValidatedInput
                  type="decimal-numeric"
                  label="Unit Value (₱ per sqm)"
                  placeholder="e.g. 5,000.00"
                  value={landUnitValue}
                  onChange={(v) => setLandUnitValue(v)}
                  required
                />
                <div>
                  <label className="font-inter text-xs font-medium text-slate-600">
                    Land Market Value (₱)
                  </label>
                  <input
                    type="text"
                    value={landMarketValue}
                    readOnly
                    placeholder="Auto-computed"
                    className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 font-inter text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none cursor-not-allowed opacity-60 mt-1"
                  />
                </div>
                <ValidatedInput
                  type="decimal-numeric"
                  label="Assessment Level (%)"
                  placeholder="e.g. 20"
                  value={landAssessLevel}
                  onChange={(v) => setLandAssessLevel(v)}
                  required
                />
                <div>
                  <label className="font-inter text-xs font-medium text-slate-600">
                    Land Assessed Value (₱)
                  </label>
                  <input
                    type="text"
                    value={landAssessedValue}
                    readOnly
                    placeholder="Auto-computed"
                    className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 font-inter text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none cursor-not-allowed opacity-60 mt-1"
                  />
                </div>
              </div>
            </Section>

            <Section
              icon={<Home className="h-5 w-5 text-[#00154A]" />}
              title="Building / Improvement Details"
            >
              <p className="font-inter mb-4 text-xs text-slate-400">
                Leave blank if land only.
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Combobox
                  label="Kind of Building"
                  placeholder="Select kind of building"
                  searchPlaceholder="Search building kind..."
                  options={BUILDING_KINDS}
                  value={buildingKind}
                  onChange={setBuildingKind}
                />

                {/* Structural Type — Combobox */}
                <Combobox
                  label="Structural Type"
                  placeholder="Select structural type"
                  searchPlaceholder="Search structural type..."
                  options={STRUCTURAL_TYPES}
                  value={structuralType}
                  onChange={setStructuralType}
                />

                <ValidatedInput
                  type="decimal-numeric"
                  label="Floor Area (sqm)"
                  placeholder="e.g. 120.00"
                  value={floorArea}
                  onChange={(v) => setFloorArea(v)}
                />
                <Combobox
                  label="Year Built"
                  placeholder="Select year built"
                  searchPlaceholder="Search year..."
                  options={TAX_YEAR_OPTIONS}
                  value={yearBuilt}
                  onChange={setYearBuilt}
                />
                <ValidatedInput
                  type="decimal-numeric"
                  label="Building Market Value (₱)"
                  placeholder="e.g. 1,200,000.00"
                  value={bldgMarketValue}
                  onChange={(v) => setBldgMarketValue(v)}
                />
                <ValidatedInput
                  type="decimal-numeric"
                  label="Assessment Level (%)"
                  placeholder="e.g. 20"
                  value={bldgAssessLevel}
                  onChange={(v) => setBldgAssessLevel(v)}
                />
                <div>
                  <label className="font-inter text-xs font-medium text-slate-600 block mb-1">
                    Building Assessed Value (₱)
                  </label>
                  <input
                    type="text"
                    value={bldgAssessedValue}
                    readOnly
                    placeholder="Auto-computed"
                    className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 font-inter text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none cursor-not-allowed opacity-60"
                  />
                </div>
              </div>
            </Section>

            {/* Effectivity & Total Valuation */}
            <Section
              icon={<BarChart3 className="h-5 w-5 text-[#00154A]" />}
              title="Effectivity & Total Valuation"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Combobox
                  label="Year of Effectivity"
                  placeholder="Select effectivity year"
                  searchPlaceholder="Search year..."
                  options={TAX_YEAR_OPTIONS}
                  value={effectivityYear}
                  onChange={setEffectivityYear}
                  required
                />
                <div>
                  <label className="font-inter text-xs font-medium text-slate-600">
                    Quarter <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={effectivityQuarter}
                    onValueChange={setEffectivityQuarter}
                  >
                    <SelectTrigger className="cursor-pointer font-inter mt-1 flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-200">
                      <SelectValue placeholder="Select quarter" />
                      <SelectIcon>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </SelectIcon>
                    </SelectTrigger>
                    <SelectContent className="z-50 min-w-(--radix-select-trigger-width) rounded-md border border-gray-200 bg-white shadow-sm">
                      <SelectViewport className="p-1">
                        {QUARTER_OPTIONS.map((quarter) => (
                          <SelectItem
                            key={quarter}
                            value={quarter}
                            className="font-inter cursor-pointer rounded px-3 py-2 text-sm text-slate-700 outline-none data-highlighted:bg-slate-100"
                          >
                            <SelectItemText>{quarter}</SelectItemText>
                          </SelectItem>
                        ))}
                      </SelectViewport>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-4">
                <h3 className="font-inter mb-3 text-xs font-semibold uppercase tracking-wide text-[#595a5d]">
                  Total Valuation Summary
                </h3>
                <div className="space-y-2">
                  <ValuationRow
                    label="Land Market Value"
                    value={landMarketValue ? `₱${landMarketValue}` : "—"}
                  />
                  <ValuationRow
                    label="Building Market Value"
                    value={bldgMarketValue ? `₱${bldgMarketValue}` : "—"}
                  />
                  <ValuationRow
                    label="Land Assessed Value"
                    value={landAssessedValue ? `₱${landAssessedValue}` : "—"}
                  />
                  <ValuationRow
                    label="Building Assessed Value"
                    value={bldgAssessedValue ? `₱${bldgAssessedValue}` : "—"}
                  />
                  <div className="border-t border-gray-200 pt-2">
                    <ValuationRow
                      label="Total Market Value"
                      value={
                        totalMarketValue
                          ? `₱${totalMarketValue.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "—"
                      }
                      bold
                    />
                    <ValuationRow
                      label="Total Assessed Value"
                      value={
                        totalAssessedValue
                          ? `₱${totalAssessedValue.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "—"
                      }
                      bold
                    />
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>
        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-8 lg:self-start flex flex-col lg:flex-col">
          <div className="z-40 mb-6 flex justify-end py-1.5 w-full px-4 md:px-0">
            <div className="flex w-full items-center gap-2 mb-2 mt-4 md:mt-0 md:w-auto">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 justify-center md:flex-none font-inter inline-flex h-10 cursor-pointer items-center gap-2 rounded border border-gray-300 bg-white px-4 text-xs font-medium text-slate-600 transition-colors hover:bg-gray-50 print:hidden"
              >
                <Printer className="h-4 w-4" />
                Print Review
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 justify-center md:flex-none font-inter inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Tax Declaration"}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {/* Header Section */}
            <div className="mb-6">
              <h2 className="font-inter text-sm font-semibold text-[#848794]">
                Details & Reference
              </h2>
              <p className="font-inter mt-1 text-xs text-slate-400">
                Declaration summary, assessment levels, and required documents.
              </p>
            </div>

            {/* Accordion Content */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="summary" className="border-b-0">
                <AccordionTrigger className="font-inter text-xs font-semibold text-[#4e5058] hover:no-underline py-3 cursor-pointer border-b-2 rounded-b-none mb-2">
                  Declaration Summary
                </AccordionTrigger>
                <AccordionContent>
                  <p className="font-inter mb-3 text-xs text-slate-400">
                    Fields marked with * are required.
                  </p>
                  <div className="space-y-3">
                    <SummaryRow
                      label="TD Number"
                      value={fullTdNumber || "(Required)"}
                    />
                    <SummaryRow
                      label="Owner"
                      value={selectedTaxpayerLabel || "(Required)"}
                    />
                    <SummaryRow
                      label="Barangay"
                      value={selectedBarangayLabel || "(Required)"}
                    />
                    <SummaryRow label="Classification" value={classification} />
                    <SummaryRow
                      label="Tax Year"
                      value={taxYear || "(Required)"}
                    />
                    <SummaryRow label="Type" value={declarationType} />
                    <SummaryRow
                      label="Effectivity"
                      value={`${effectivityQuarter} Qtr ${effectivityYear}`}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="assessment" className="border-b-0">
                <AccordionTrigger className="font-inter text-xs font-semibold text-[#4e5058] hover:no-underline py-3 cursor-pointer border-b-2 rounded-b-none mb-2">
                  Assessment Levels Reference
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 font-inter text-xs text-slate-500">
                    {[
                      ["Residential", "20%"],
                      ["Commercial", "40–50%"],
                      ["Agricultural", "40%"],
                      ["Industrial", "50%"],
                      ["Special", "10–30%"],
                      ["Timberland", "20%"],
                    ].map(([cls, lvl]) => (
                      <div key={cls} className="flex justify-between">
                        <span>{cls}</span>
                        <span className="font-medium text-[#595a5d]">
                          {lvl}
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="documents" className="border-b-0">
                <AccordionTrigger className="font-inter text-xs font-semibold text-[#4e5058] hover:no-underline py-3 cursor-pointer mb-2">
                  Required Documents
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 font-inter text-xs text-slate-500">
                    {[
                      "Deed of Sale / Transfer Document",
                      "Lot Plan / Survey Plan",
                      "Building Permit (if applicable)",
                      "Tax Clearance Certificate",
                      "Valid Government-issued ID",
                    ].map((doc) => (
                      <li key={doc} className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md bg-slate-100 p-2">{icon}</div>
        <h2 className="font-inter text-sm font-semibold text-[#848794]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function ValuationRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`font-inter text-xs ${bold ? "font-semibold text-[#595a5d]" : "text-slate-500"}`}
      >
        {label}
      </span>
      <span
        className={`font-inter text-xs ${bold ? "font-bold text-[#595a5d]" : "text-slate-600"}`}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-inter text-xs text-slate-500">{label}</span>
      <span className="font-inter text-xs font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}
