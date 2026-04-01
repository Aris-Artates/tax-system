"use client";

import * as React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Map as MapIcon, 
  Search, 
  Printer, 
  Info, 
  ChevronRight,
  TrendingUp as TrendingUpIcon,
  PieChart,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import BarangayPerformanceMapClient from '@/components/BarangayPerformanceMapClient';
import type { BarangayPerformance } from '@/components/BarangayPerformanceData';
import { STA_RITA_BARANGAY_DATA } from '@/components/BarangayPerformanceData';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BarangayMapPage() {
  const [selectedBarangay, setSelectedBarangay] = React.useState<BarangayPerformance | null>(null);
  const [filterTier, setFilterTier] = React.useState<'All' | 'High' | 'Average' | 'At Risk'>('All');
  const [searchQuery, setSearchQuery] = React.useState('');

  const totalAssessed = STA_RITA_BARANGAY_DATA.reduce((acc, b) => acc + b.assessedAmount, 0);
  const totalCollected = STA_RITA_BARANGAY_DATA.reduce((acc, b) => acc + b.collectedAmount, 0);
  const avgRate = Math.round((totalCollected / totalAssessed) * 100);

  const filteredBarangays = STA_RITA_BARANGAY_DATA.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 print:bg-white print:overflow-visible print:h-auto">
      {/* Header - Hidden on Print if needed, but usually good to keep for context */}
      <header className="flex-none p-6 border-b border-slate-200 bg-white shadow-sm print:shadow-none print:border-b-2">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <button 
              onClick={() => window.history.back()}
              className="mt-1 p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors print:hidden"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapIcon className="text-blue-600" size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600/70">Sta. Rita RPT Geographic View</span>
              </div>
              <h1 className="font-lexend text-2xl font-bold text-slate-800">Barangay Performance Map</h1>
              <p className="mt-0.5 font-inter text-xs text-slate-500">Real-time collection efficiency and assessment distribution by barangay.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text"
                placeholder="Search barangay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-inter focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-[1000] max-h-60 overflow-y-auto">
                  {filteredBarangays.map(b => (
                    <button
                      key={b.name}
                      onClick={() => {
                        setSelectedBarangay(b);
                        setSearchQuery('');
                      }}
                      className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between group"
                    >
                      <span className="text-slate-700 font-medium">{b.name}</span>
                      <ChevronRight size={12} className="text-slate-300 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              <Printer size={16} />
              Print Report
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 print:block">
        {/* Stats Row */}
        <div className="flex-none p-6 pb-0 print:p-0">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label="Municipal Average" 
              value={`${avgRate}%`} 
              icon={BarChart3} 
              color="bg-blue-50 text-blue-600"
              subValue="Compliance Efficiency"
            />
            <StatCard 
              label="Total Assessed" 
              value={formatCurrency(totalAssessed)} 
              icon={TrendingUpIcon} 
              color="bg-indigo-50 text-indigo-600"
              subValue="Sta. Rita LGU"
            />
            <StatCard 
              label="Total Collected" 
              value={formatCurrency(totalCollected)} 
              icon={PieChart} 
              color="bg-emerald-50 text-emerald-600"
              subValue="YTD RPT Collections"
            />
            <StatCard 
              label="Barangays Tracked" 
              value={STA_RITA_BARANGAY_DATA.length.toString()} 
              icon={Users} 
              color="bg-amber-50 text-amber-600"
              subValue="All Zones Included"
            />
          </div>
        </div>

        {/* Map & Sidebar Container */}
        <div className="flex-1 p-6 flex gap-6 overflow-hidden min-h-0 print:p-0 print:block">
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-200 print:shadow-none print:border-none">
            <BarangayPerformanceMapClient 
              selectedBarangay={selectedBarangay}
              onSelectBarangay={setSelectedBarangay}
              filterTier={filterTier}
            />

            {/* Floating Filter Overlay */}
            <div className="absolute top-4 left-4 z-[999] flex flex-col gap-2 print:hidden">
              <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-xl border border-white/40 shadow-lg flex items-center gap-1">
                {(['All', 'High', 'Average', 'At Risk'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setFilterTier(tier)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-tight",
                      filterTier === tier 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                        : "text-slate-600 hover:bg-white/60"
                    )}
                  >
                    {tier}
                  </button>
                ))}
              </div>
              <div className="bg-white/20 backdrop-blur-[2px] px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-4 text-[10px] font-bold text-slate-700/60 uppercase tracking-widest pointer-events-none">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10b981]" /> 80%+ </div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f59e0b]" /> 70-79% </div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ef4444]" /> &lt; 70% </div>
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <aside className={cn(
            "w-80 flex-none bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden transition-all duration-300 print:hidden",
            !selectedBarangay && "opacity-60 grayscale pointer-events-none"
          )}>
            {selectedBarangay ? (
              <>
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <span className={cn(
                    "inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-2",
                    selectedBarangay.collectionRate >= 80 ? "bg-emerald-100 text-emerald-700" :
                    selectedBarangay.collectionRate >= 70 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                  )}>
                    {selectedBarangay.collectionRate >= 80 ? 'Top Tier' :
                     selectedBarangay.collectionRate >= 70 ? 'Satisfactory' : 'Needs Attention'}
                  </span>
                  <h3 className="font-lexend text-xl font-bold text-slate-800">{selectedBarangay.name}</h3>
                  <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                    <Info size={12} />
                    <span className="text-[10px] font-medium uppercase tracking-tight">Barangay Profile & RPT Insights</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Gauge Placeholder */}
                  <div className="relative h-24 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-[6px] border-slate-100" />
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center rounded-full border-[6px] border-transparent border-t-current",
                        selectedBarangay.collectionRate >= 80 ? "text-emerald-500" :
                        selectedBarangay.collectionRate >= 70 ? "text-amber-500" : "text-rose-500"
                      )} style={{ transform: `rotate(${(selectedBarangay.collectionRate / 100) * 360 - 90}deg)` }} />
                    </div>
                    <div className="text-center">
                      <span className="block text-2xl font-black text-slate-800">{selectedBarangay.collectionRate}%</span>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">efficiency</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SidebarStat 
                      label="Assessed Value" 
                      value={formatCurrency(selectedBarangay.assessedAmount)} 
                      icon={TrendingUp} 
                      trend="Expected Gross" 
                    />
                    <SidebarStat 
                      label="Actual Collections" 
                      value={formatCurrency(selectedBarangay.collectedAmount)} 
                      icon={TrendingDown} 
                      trend="Realized Revenue" 
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                      Performance data is calculated based on current year property assessments and received payments for the fiscal year 2026.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-all active:scale-[0.98]">
                    View Detailed Report
                  </button>
                  <button 
                    onClick={() => setSelectedBarangay(null)}
                    className="w-full py-2 text-slate-400 hover:text-slate-600 text-[10px] font-semibold transition-all"
                  >
                    Clear Selection
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <MapIcon size={32} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-600">No Barangay Selected</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Select a pin on the map or use the search bar to view specific performance data.</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Hidden Print Content */}
      <div className="hidden print:block font-inter p-10">
        <h2 className="text-xl font-bold mb-4">Barangay Collection Efficiency Report - {new Date().toLocaleDateString()}</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="p-2 border text-[12px]">Barangay Name</th>
              <th className="p-2 border text-[12px]">Collection Rate</th>
              <th className="p-2 border text-[12px]">Assessed Amount</th>
              <th className="p-2 border text-[12px]">Collected Amount</th>
            </tr>
          </thead>
          <tbody>
            {STA_RITA_BARANGAY_DATA.map(b => (
              <tr key={b.name}>
                <td className="p-2 border text-[11px]">{b.name}</td>
                <td className="p-2 border text-[11px] font-bold">{b.collectionRate}%</td>
                <td className="p-2 border text-[11px]">{formatCurrency(b.assessedAmount)}</td>
                <td className="p-2 border text-[11px] font-medium text-emerald-700">{formatCurrency(b.collectedAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  subValue: string;
}

function StatCard({ label, value, icon: Icon, color, subValue }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group print:border-2">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", color)}>
          <Icon size={18} />
        </div>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</span>
      </div>
      <div className="space-y-0.5">
        <h4 className="text-2xl font-black text-slate-800">{value}</h4>
        <p className="text-[10px] font-medium text-slate-400 group-hover:text-blue-500 transition-colors uppercase tracking-tight">{subValue}</p>
      </div>
    </div>
  );
}

interface SidebarStatProps {
  label: string;
  value: string;
  icon: React.ElementType;
  trend: string;
}

function SidebarStat({ label, value, icon: Icon, trend }: SidebarStatProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between group">
        <div>
          <span className="block text-lg font-black text-slate-700">{value}</span>
          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">{trend}</span>
        </div>
        <div className="p-2 rounded-lg bg-white text-slate-300 border border-slate-200 transition-colors group-hover:text-blue-500 group-hover:border-blue-100">
          <Icon size={14} />
        </div>
      </div>
    </div>
  );
}