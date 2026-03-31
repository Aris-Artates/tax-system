'// Integrated with Supabase via /api/properties/listing (see API route for join details).\n'
'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, RefreshCcw, Save, FileText, Layers, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';


type PropertyRecord = {
  id: number;
  tdNumber: string;
  pin: string;
  owner: string;
  classification: string;
  barangay: string;
  landArea: string;
  marketValue: string;
  assessLevel: string;
  assessedValue: string;
  taxpayer_id?: number;
  property_id?: number;
};

export default function ReassessmentPage() {
  const router = useRouter();
  const [selectedTdId, setSelectedTdId] = useState('');
  const [allOptions, setAllOptions] = useState<ComboboxOption[]>([]);
  const [propertyData, setPropertyData] = useState<Record<string, PropertyRecord>>({});
  const [selectedProperty, setSelectedProperty] = useState<PropertyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Revision fields
  const [newTdNumber, setNewTdNumber] = useState('');
  const [reason, setReason] = useState('');
  const [newClassification, setNewClassification] = useState('');
  const [newLandArea, setNewLandArea] = useState('');
  const [newUnitValue, setNewUnitValue] = useState('');
  const [newMarketValue, setNewMarketValue] = useState('');
  const [newAssessLevel, setNewAssessLevel] = useState('');
  const [newAssessedValue, setNewAssessedValue] = useState('');
  const [bldgChanges, setBldgChanges] = useState('');
  const [effectivityYear, setEffectivityYear] = useState('2024');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-compute Market Value
  useEffect(() => {
    const area = parseFloat(newLandArea.replace(/,/g, '')) || 0;
    const unit = parseFloat(newUnitValue.replace(/,/g, '')) || 0;
    if (area && unit) {
      setNewMarketValue((area * unit).toFixed(2));
    } else {
      setNewMarketValue('');
    }
  }, [newLandArea, newUnitValue]);

  // Auto-compute Assessed Value
  useEffect(() => {
    const market = parseFloat(newMarketValue.replace(/,/g, '')) || 0;
    const level = parseFloat(newAssessLevel.replace(/,/g, '')) || 0;
    if (market && level) {
      setNewAssessedValue(((market * level) / 100).toFixed(2));
    } else {
      setNewAssessedValue('');
    }
  }, [newMarketValue, newAssessLevel]);

  // Fetch all properties for combobox
  useEffect(() => {
    async function fetchAll() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/properties/listing');
        if (!res.ok) throw new Error('Failed to load properties');
        const { rows } = await res.json();
        const options: ComboboxOption[] = [];
        const data: Record<string, PropertyRecord> = {};

        (rows || []).forEach((row: any) => {
          const idStr = String(row.id);
          const p: PropertyRecord = {
            id: row.id,
            tdNumber: row.td_number || '',
            pin: row.properties?.pin || '',
            owner: row.taxpayers?.owner_name || '',
            classification: row.classification || '',
            barangay: row.properties?.barangays?.name || '',
            landArea: row.land_area ? String(row.land_area) : '',
            marketValue: row.total_market_value ? String(row.total_market_value) : '',
            assessLevel: row.land_assessment_level ? String(row.land_assessment_level) : '',
            assessedValue: row.total_assessed_value ? String(row.total_assessed_value) : '',
            taxpayer_id: row.taxpayer_id,
            property_id: row.property_id
          };
          
          options.push({
            value: idStr,
            label: `${p.tdNumber} – ${p.owner}`,
            sublabel: `PIN: ${p.pin} | ${p.classification} | ${p.barangay}`
          });
          data[idStr] = p;
        });

        setAllOptions(options);
        setPropertyData(data);
      } catch (err) {
        toast.error('Could not load property records.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Update selected property when combobox value changes
  useEffect(() => {
    if (selectedTdId && propertyData[selectedTdId]) {
      const p = propertyData[selectedTdId];
      setSelectedProperty(p);
      setNewClassification(p.classification);
      setNewLandArea(p.landArea);
      setNewAssessLevel(p.assessLevel);
      setNewTdNumber(''); // Reset for new entry
    } else {
      setSelectedProperty(null);
    }
  }, [selectedTdId, propertyData]);

  const handleSaveRevision = async () => {
    if (!selectedProperty || !newTdNumber || !reason || !newClassification || !newLandArea || !newUnitValue || !newAssessLevel || !effectivityYear) {
      toast.error('Please fill in all required fields marked with *');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/property/reassessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldTdId: selectedProperty.id,
          oldTdNumber: selectedProperty.tdNumber,
          property_id: selectedProperty.property_id,
          taxpayer_id: selectedProperty.taxpayer_id,
          newTdNumber,
          reason,
          newClassification,
          newLandArea: parseFloat(newLandArea.replace(/,/g, '')),
          newUnitValue: parseFloat(newUnitValue.replace(/,/g, '')),
          newMarketValue: parseFloat(newMarketValue.replace(/,/g, '')),
          newAssessLevel: parseFloat(newAssessLevel.replace(/,/g, '')),
          newAssessedValue: parseFloat(newAssessedValue.replace(/,/g, '')),
          bldgChanges,
          effectivityYear,
          notes,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save revision');
      }

      toast.success('Property revision saved successfully!');
      setSelectedProperty(null);
      setSelectedTdId(''); // Clear selection
      // Reset form
      setReason(''); setNewClassification(''); setNewLandArea(''); setNewUnitValue(''); setNewMarketValue(''); setNewAssessLevel(''); setNewAssessedValue(''); setBldgChanges(''); setNotes('');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

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

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">Reassessment & Revision</h1>
          <p className="font-inter mt-1 text-xs text-slate-400">Update assessments due to improvements, reclassification, or corrections</p>
        </div>
        {selectedProperty && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setSelectedTdId(''); setSelectedProperty(null); setReason(''); setNewClassification(''); setNewLandArea(''); setNewUnitValue(''); setNewMarketValue(''); setNewAssessLevel(''); setNewAssessedValue(''); setBldgChanges(''); setNotes(''); }}
              className="font-inter inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveRevision}
              className="font-inter inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save Revision'}
            </button>
          </div>
        )}
      </header>

      {/* Step 1: Search */}
      {!selectedProperty && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-md bg-slate-100 p-2">
              <Search className="h-5 w-5 text-[#00154A]" />
            </div>
            <h2 className="font-inter text-sm font-semibold text-[#848794]">Step 1 – Select Property for Revision</h2>
          </div>
          <p className="font-inter mb-4 text-xs text-slate-400">
            Search and select the property you wish to revise from the registry.
          </p>
          <div className="max-w-xl">
            <Combobox
              placeholder={isLoading ? 'Loading properties...' : 'Select or search property...'}
              searchPlaceholder="Search by TD Number, Owner, or PIN..."
              options={allOptions}
              value={selectedTdId}
              onChange={setSelectedTdId}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Step 2: Revision Form */}
      {selectedProperty && (
        <div className="space-y-6">
          {/* Current Assessment Banner */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <RefreshCcw className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-inter text-sm font-semibold text-blue-800">
                  Revising: {selectedProperty.tdNumber} – {selectedProperty.owner}
                </p>
                <p className="font-inter mt-1 text-xs text-blue-600">
                  PIN: {selectedProperty.pin} | {selectedProperty.classification} | {selectedProperty.barangay}
                </p>
                <p className="font-inter mt-0.5 text-xs text-blue-600">
                  Current Market Value: ₱{selectedProperty.marketValue} | Current Assessed Value: ₱{selectedProperty.assessedValue}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">

              {/* Reason for Revision */}
              <Section icon={<FileText className="h-5 w-5 text-[#00154A]" />} title="Step 2 – Reason for Revision">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="font-inter text-xs font-medium text-slate-600">Reason for Reassessment <span className="text-rose-500">*</span></label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 font-inter text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Select reason</option>
                      {[
                        'New Construction / Improvement',
                        'Change in Actual Use',
                        'Reclassification of Land',
                        'Correction of Error / Clerical',
                        'Demolition / Destruction',
                        'Transfer of Ownership',
                        'General Revision',
                      ].map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <Field label="New TD Number" placeholder="e.g. TD-2024-XXXX" value={newTdNumber} onChange={setNewTdNumber} required />
                  <Field label="Effectivity Year" placeholder="e.g. 2024" value={effectivityYear} onChange={setEffectivityYear} required />
                  <div className="sm:col-span-2">
                    <label className="font-inter text-xs font-medium text-slate-600">Notes / Remarks</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Add any relevant notes or remarks..."
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 font-inter text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>
              </Section>

              {/* Revised Land Details */}
              <Section icon={<Layers className="h-5 w-5 text-[#00154A]" />} title="Revised Land Details">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="font-inter text-xs font-medium text-slate-600">Classification <span className="text-rose-500">*</span></label>
                    <select
                      value={newClassification}
                      onChange={(e) => setNewClassification(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 font-inter text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      {['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Special', 'Timberland', 'Mineral'].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <Field label="Land Area (sqm)" placeholder={selectedProperty.landArea} value={newLandArea} onChange={setNewLandArea} required />
                  <Field label="New Unit Value (₱/sqm)" placeholder="e.g. 6,000.00" value={newUnitValue} onChange={setNewUnitValue} required />
                  <Field label="New Market Value (₱)" placeholder="Auto-computed" value={newMarketValue} onChange={setNewMarketValue} />
                  <Field label="Assessment Level (%)" placeholder={selectedProperty.assessLevel} value={newAssessLevel} onChange={setNewAssessLevel} required />
                  <Field label="New Assessed Value (₱)" placeholder="Auto-computed" value={newAssessedValue} onChange={setNewAssessedValue} />
                </div>
              </Section>

              {/* Building Changes */}
              <Section icon={<BarChart3 className="h-5 w-5 text-[#00154A]" />} title="Building / Improvement Changes">
                <p className="font-inter mb-4 text-xs text-slate-400">Leave blank if no changes to improvements.</p>
                <div>
                  <label className="font-inter text-xs font-medium text-slate-600">Describe Building Changes</label>
                  <textarea
                    value={bldgChanges}
                    onChange={(e) => setBldgChanges(e.target.value)}
                    rows={4}
                    placeholder="Describe new construction, renovations, demolitions, or improvements..."
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 font-inter text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </Section>
            </div>

            {/* Sidebar comparison */}
            <div className="space-y-6">
              <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="font-inter text-sm font-semibold text-[#848794]">Assessment Comparison</h2>
                <div className="mt-4 space-y-3">
                  <div className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">Current</div>
                  <CompareRow label="Classification" value={selectedProperty.classification} />
                  <CompareRow label="Land Area (sqm)" value={selectedProperty.landArea} />
                  <CompareRow label="Market Value" value={`₱${selectedProperty.marketValue}`} />
                  <CompareRow label="Assess. Level" value={`${selectedProperty.assessLevel}%`} />
                  <CompareRow label="Assessed Value" value={`₱${selectedProperty.assessedValue}`} />
                  <div className="border-t border-gray-100 pt-3">
                    <div className="font-inter text-xs font-semibold uppercase tracking-wide text-blue-600">Revised</div>
                    <div className="mt-2 space-y-2">
                      <CompareRow label="Classification" value={newClassification || '—'} highlight />
                      <CompareRow label="Land Area (sqm)" value={newLandArea || '—'} highlight />
                      <CompareRow label="Market Value" value={newMarketValue ? `₱${newMarketValue}` : '—'} highlight />
                      <CompareRow label="Assess. Level" value={newAssessLevel ? `${newAssessLevel}%` : '—'} highlight />
                      <CompareRow label="Assessed Value" value={newAssessedValue ? `₱${newAssessedValue}` : '—'} highlight />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md bg-slate-100 p-2">{icon}</div>
        <h2 className="font-inter text-sm font-semibold text-[#848794]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  required = false,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="font-inter text-xs font-medium text-slate-600">
        {label}{required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      <div className="mt-1 flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-slate-200">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent font-inter text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

function CompareRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-inter text-xs text-slate-500">{label}</span>
      <span className={`font-inter text-xs font-medium ${highlight ? 'text-blue-700' : 'text-slate-900'}`}>{value}</span>
    </div>
  );
}
