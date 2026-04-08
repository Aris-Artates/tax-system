'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  FileDown,
  Printer,
  CalendarDays,
  MapPin,
  Shield,
  ClipboardList,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  TaxDeclarationPrint,
  type TaxDeclarationData,
} from '@/components/print/TaxDeclarationPrint';
import { GeneralReportPrint, type ReportRow } from '@/components/print/GeneralReportPrint';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';


const reportTypes = [
  {
    id: 'td-print',
    icon: FileText,
    title: 'Tax Declaration Print',
    description: 'Print individual Tax Declaration form with full assessment details and property information',
    variant: 'primary' as const,
    fields: ['tdNumber'],
  },
  {
    id: 'assessment-roll',
    icon: ClipboardList,
    title: 'Assessment Roll by Barangay',
    description: 'Official list of all properties with their assessed values grouped per barangay',
    variant: 'primary' as const,
    fields: ['barangay', 'year'],
  },
  {
    id: 'summary-list',
    icon: FileDown,
    title: 'Summary Assessment List',
    description: 'Consolidated summary of properties, market values, and assessed values by classification',
    variant: 'secondary' as const,
    fields: ['year', 'classification'],
  },
  {
    id: 'certified-copy',
    icon: Shield,
    title: 'Certified True Copy of TD',
    description: 'Issue a certified true copy of a Tax Declaration for use in legal or official transactions',
    variant: 'secondary' as const,
    fields: ['tdNumber'],
  },
  {
    id: 'delinquency-report',
    icon: CalendarDays,
    title: 'Delinquency Report',
    description: 'List of properties with unpaid or overdue real property taxes for a given period',
    variant: 'secondary' as const,
    fields: ['year', 'barangay'],
  },
  {
    id: 'barangay-summary',
    icon: MapPin,
    title: 'Barangay Property Summary',
    description: 'Aggregate total properties, land area, market values, and assessed values by barangay',
    variant: 'secondary' as const,
    fields: ['year'],
  },
];

// Reports that use TaxDeclarationPrint + the by-number API
const TD_PRINT_REPORTS = new Set(['td-print', 'certified-copy']);

type FetchState = 'idle' | 'loading' | 'ready' | 'error';

export default function ReportsCertificationsPage() {
  const router = useRouter();

  // ── Report selection ───────────────────────────────────────────────────────
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // ── Form params ───────────────────────────────────────────────────────────
  const [year,           setYear]           = useState('2024');
  const [barangay,       setBarangay]       = useState('All Barangays');
  const [classification, setClassification] = useState('');
  const [tdNumber,       setTdNumber]       = useState('');

  // ── TD fetch state (used by td-print + certified-copy) ────────────────────
  const [fetchState,  setFetchState]  = useState<FetchState>('idle');
  const [fetchError,  setFetchError]  = useState<string | null>(null);
  const [printData,   setPrintData]   = useState<TaxDeclarationData | null>(null);

  // ── General Report Data (for tabular reports) ─────────────────────────────
  const [reportData, setReportData] = useState<{ title: string; subtitle: string; rows: ReportRow[] } | null>(null);

  // ── Property Options (for Combobox) ───────────────────────────────────────
  const [allOptions, setAllOptions] = useState<ComboboxOption[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  // ── Barangay Options (for Combobox) ───────────────────────────────────────
  const [barangayOptions, setBarangayOptions] = useState<ComboboxOption[]>([]);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(true);

  // ── Year Options (static for now) ─────────────────────────────────────────
  const yearOptions: ComboboxOption[] = ['2024', '2023', '2022', '2021', '2020', '2019'].map(y => ({
    value: y,
    label: y
  }));

  // triggerPrint: set to 'preview' or 'download' after data is ready so
  // useEffect can call window.print() on the next render (data + DOM ready).
  const printIntent = useRef<'preview' | 'download' | null>(null);

  const selected = reportTypes.find((r) => r.id === selectedReport);

  // ── Reset fetch state when report type or tdNumber changes ─────────────────
  useEffect(() => {
    setFetchState('idle');
    setFetchError(null);
    setPrintData(null);
    setReportData(null);
    printIntent.current = null;
  }, [selectedReport, tdNumber, year, barangay, classification]);

  // ── Fetch all properties for combobox ─────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      setIsLoadingProperties(true);
      try {
        const res = await fetch('/api/properties/listing');
        if (!res.ok) throw new Error('Failed to load properties');
        const json = await res.json();
        const rows = json._data ? JSON.parse(atob(atob(atob(json._data)))) : (json.rows ?? []);
        const options: ComboboxOption[] = (rows || []).map((row: any) => ({
          value: row.td_number || '',
          label: row.td_number || '',
          sublabel: row.taxpayers?.owner_name || 'Unknown Owner',
        }));
        setAllOptions(options);
      } catch (err) {
        console.error('Property fetch error:', err);
      } finally {
        setIsLoadingProperties(false);
      }
    }
    fetchAll();
  }, []);

  // ── Fetch all barangays for combobox ──────────────────────────────────────
  useEffect(() => {
    async function fetchBarangays() {
      setIsLoadingBarangays(true);
      try {
        const res = await fetch('/api/barangays/list');
        if (!res.ok) throw new Error('Failed to load barangays');
        const data = await res.json();
        const decodedBarangays = data._data ? JSON.parse(atob(atob(atob(data._data)))) : (data.barangays ?? []);
        
        const options: ComboboxOption[] = [
          { value: 'All Barangays', label: 'All Barangays' },
          ...(decodedBarangays || []).map((b: any) => ({
            value: b.name,
            label: b.name,
          })),
        ];
        setBarangayOptions(options);
      } catch (err) {
        console.error('Barangay fetch error:', err);
      } finally {
        setIsLoadingBarangays(false);
      }
    }
    fetchBarangays();
  }, []);

  // ── Trigger window.print() once printData or reportData is rendered in the DOM
  useEffect(() => {
    if (fetchState === 'ready' && (printData || reportData) && printIntent.current) {
      // Small timeout lets React flush the print component render first
      const t = setTimeout(() => window.print(), 120);
      return () => clearTimeout(t);
    }
  }, [fetchState, printData, reportData]);

  // ── Fetch Report data from API, then set intent ────────────────────────────
  async function fetchAndPrint(intent: 'preview' | 'download') {
    if (isTDReport && !tdNumber.trim()) return;

    setFetchState('loading');
    setFetchError(null);
    setPrintData(null);
    setReportData(null);
    printIntent.current = intent;

    try {
      let url = '';
      if (isTDReport) {
        url = `/api/tax-declarations/by-number?td_number=${encodeURIComponent(tdNumber.trim())}`;
      } else {
        url = `/api/reports/generate?type=${selectedReport}&year=${year}&barangay=${encodeURIComponent(barangay)}&classification=${encodeURIComponent(classification)}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        setFetchError(json.error ?? 'Failed to load report data.');
        setFetchState('error');
        printIntent.current = null;
        return;
      }

      if (isTDReport) {
        setPrintData(json.td as TaxDeclarationData);
      } else {
        setReportData(json.data);
      }
      setFetchState('ready');
    } catch {
      setFetchError('Network error. Please try again.');
      setFetchState('error');
      printIntent.current = null;
    }
  }

  const isTDReport    = selectedReport ? TD_PRINT_REPORTS.has(selectedReport) : false;
  const isLoading     = fetchState === 'loading';
  const canGenerate   = isTDReport ? tdNumber.trim().length > 0 && !isLoading : true;

  return (
    <div className="w-full">
      {/* ── Hidden TaxDeclarationPrint mount ─────────────────────────────────
          Invisible on screen (sr-only). Becomes visible via @media print CSS
          inside TaxDeclarationPrint itself (#td-print-root visibility trick).
      ──────────────────────────────────────────────────────────────────────── */}
      {printData && (
        <div className="sr-only print:not-sr-only relative">
          {selectedReport === 'certified-copy' && (
            <div className="absolute top-40 right-10 rotate-12 border-4 border-red-600 px-4 py-2 text-red-600 font-bold text-2xl uppercase tracking-widest opacity-80 pointer-events-none z-50">
              Certified True Copy
            </div>
          )}
          <TaxDeclarationPrint data={printData} />
        </div>
      )}

      {reportData && selectedReport && (
        <div className="sr-only print:not-sr-only">
          <GeneralReportPrint data={reportData} type={selectedReport} />
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push('/property')}
        className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Property Registry
      </button>

      <header className="mb-6">
        <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">Reports & Certifications</h1>
        <p className="font-inter mt-1 text-xs text-slate-400">
          Generate Assessor Reports and Official Certifications – Municipality of Sta. Rita, Samar
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── Report Type Cards ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <p className="font-inter mb-4 text-xs text-slate-400">Select a report type to configure and generate.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const isSelected = selectedReport === report.id;
              return (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => setSelectedReport(report.id)}
                  className={`group rounded-sm border p-5 text-left shadow-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300'
                      : 'border-gray-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <Icon className={`mb-3 h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-[#00154A]'}`} />
                  <h3 className={`font-inter text-sm font-semibold ${isSelected ? 'text-blue-800' : 'text-[#848794]'}`}>
                    {report.title}
                  </h3>
                  <p className={`font-inter mt-1 text-xs ${isSelected ? 'text-blue-600' : 'text-[#C0C7D0]'}`}>
                    {report.description}
                  </p>
                  <div className={`mt-3 text-xs font-medium ${isSelected ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-500'}`}>
                    {isSelected ? '✓ Selected' : 'Click to select →'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Generation Panel ─────────────────────────────────────────────── */}
        <div>
          <div className="sticky top-6 rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
            {!selected ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="mb-3 h-10 w-10 text-slate-300" />
                <p className="font-inter text-xs font-semibold text-[#848794]">Select a Report Type</p>
                <p className="font-inter mt-1 text-xs text-slate-400">
                  Choose from the available report types on the left to configure parameters.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-2">
                  <div className="rounded-md bg-slate-100 p-2">
                    <selected.icon className="h-5 w-5 text-[#00154A]" />
                  </div>
                  <div>
                    <h2 className="font-inter text-sm font-semibold text-[#595a5d]">{selected.title}</h2>
                    <p className="font-inter text-xs text-slate-400">Configure parameters below</p>
                  </div>
                </div>

                {/* ── Parameter fields ────────────────────────────────────── */}
                <div className="space-y-4">
                  {selected.fields.includes('tdNumber') && (
                    <div>
                      <label className="font-inter text-xs font-medium text-slate-600">
                        TD Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="mt-1">
                        <Combobox
                          placeholder={isLoadingProperties ? 'Loading…' : 'Select TD Number…'}
                          searchPlaceholder="Type to search…"
                          options={allOptions}
                          value={tdNumber}
                          onChange={setTdNumber}
                          disabled={isLoadingProperties}
                        />
                      </div>
                    </div>
                  )}
                  {selected.fields.includes('year') && (
                    <div>
                      <label className="font-inter text-xs font-medium text-slate-600">Tax Year</label>
                      <div className="mt-1">
                        <Combobox
                          placeholder="Select Year…"
                          options={yearOptions}
                          value={year}
                          onChange={setYear}
                          hideSearch={true}
                        />
                      </div>
                    </div>
                  )}
                  {selected.fields.includes('barangay') && (
                    <div>
                      <label className="font-inter text-xs font-medium text-slate-600">Barangay</label>
                      <div className="mt-1">
                        <Combobox
                          placeholder={isLoadingBarangays ? 'Loading…' : 'Select Barangay…'}
                          searchPlaceholder="Type to search…"
                          options={barangayOptions}
                          value={barangay}
                          onChange={setBarangay}
                          disabled={isLoadingBarangays}
                        />
                      </div>
                    </div>
                  )}
                  {selected.fields.includes('classification') && (
                    <div>
                      <label className="font-inter text-xs font-medium text-slate-600">Classification</label>
                      <select
                        value={classification}
                        onChange={(e) => setClassification(e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 font-inter text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      >
                        <option value="">All Classifications</option>
                        {['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Special', 'Timberland'].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* ── Error message ────────────────────────────────────────── */}
                {fetchState === 'error' && fetchError && (
                  <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <p className="font-inter text-xs text-red-700">{fetchError}</p>
                  </div>
                )}

                {/* ── Ready confirmation ───────────────────────────────────── */}
                {fetchState === 'ready' && printData && (
                  <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2">
                    <p className="font-inter text-xs text-green-700">
                      ✓ TD loaded — print dialog should have opened. If not,{' '}
                      <button
                        type="button"
                        className="underline underline-offset-2 hover:text-green-900"
                        onClick={() => window.print()}
                      >
                        click here to retry
                      </button>
                      .
                    </p>
                  </div>
                )}

                {/* ── Action buttons ───────────────────────────────────────── */}
                <div className="mt-6 space-y-2">
                  <button
                    type="button"
                    disabled={!canGenerate}
                    onClick={() => fetchAndPrint('download')}
                    className="font-inter w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-[#0f1729] px-4 py-2.5 text-xs font-medium text-[#8A9098] hover:bg-slate-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading && printIntent.current === 'download'
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <FileDown className="h-4 w-4" />
                    }
                    {isLoading && printIntent.current === 'download'
                      ? 'Loading…'
                      : 'Generate & Download'
                    }
                  </button>
                  <button
                    type="button"
                    disabled={!canGenerate}
                    onClick={() => fetchAndPrint('preview')}
                    className="font-inter w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading && printIntent.current === 'preview'
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Printer className="h-4 w-4" />
                    }
                    {isLoading && printIntent.current === 'preview'
                      ? 'Loading…'
                      : 'Print Preview'
                    }
                  </button>
                </div>

                <div className="mt-4 rounded-md border border-gray-100 bg-gray-50 p-3">
                  <p className="font-inter text-xs text-slate-400">
                    {isTDReport
                      ? 'Fetches the saved TD from the database and opens the browser print dialog. Use "Save as PDF" in the dialog to download.'
                      : 'Generated reports are in PDF format and will include the official municipality header and certification signature block.'
                    }
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
