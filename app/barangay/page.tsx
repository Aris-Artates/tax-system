"use client";

import RegistryCard from '@/components/RegistryCard';
import { useRouter } from 'next/navigation';
import { ChartColumn, TrendingUp, Type, Users, FileChartColumnIncreasing, MapPinned } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function BarangayPerformancePage() {
  const router = useRouter();
  const { permissions, user } = useAuth();

  const hasAccess = (tab: string) => {
    if (Number(user?.role_id) === 1) return true;
    const pm = permissions['barangay'];
    if (!pm) return false;
    if (!pm.tabs || Object.keys(pm.tabs).length === 0) return pm.can_view;
    return pm.tabs[tab]?.can_view;
  };

  return (
    <div className="flex">
      <main className="flex-1">
        <header className="mb-10">
          <h1 className={`font-lexend text-2xl font-bold text-[#595a5d]`}>Barangay Performance</h1>
          <p className={`font-inter text-xs text-slate-400 mt-1`}>Executive &amp; Planning View - RPT Performance By Barangay</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hasAccess('collection-performance') && (
            <RegistryCard
              icon={ChartColumn} 
              title="Collection Performance" 
              description="RPT collections per barangay with trend comparison" 
              buttonText="View Performance" 
              onButtonClick={() => router.push('/barangay/collection-performance')}
            />
          )}
          {hasAccess('barangay-ranking') && (
            <RegistryCard 
              icon={TrendingUp} 
              title="Barangay Ranking" 
              description="Rank Barangays by collection efficiency and compliance" 
              buttonText="View Rankings" 
              onButtonClick={() => router.push('/barangay/barangay-ranking')}
            />
          )}
          {hasAccess('deliquency-hotspots') && (
            <RegistryCard 
              icon={Type} 
              title="Deliquency Hotspots" 
              description="Identify barangays with high deliquency rates" 
              buttonText="Analyze" 
              onButtonClick={() => router.push('/barangay/deliquency-hotspots')}
            />
          )}
          {hasAccess('map') && (
            <RegistryCard
              icon={MapPinned}
              title="Barangay Map View"
              description="Pinned Sta. Rita barangays with quick RPT performance"
              buttonText="Open Map"
              variant="secondary"
              onButtonClick={() => router.push('/barangay/map')}
            />
          )}
          {hasAccess('tax_payer-summary') && (
            <RegistryCard 
              icon={Users} 
              title="Taxpayer Summary" 
              description="Number of taxpayers and properties per barangay" 
              buttonText="View Summary" 
              variant="secondary"
              onButtonClick={() => router.push('/barangay/tax_payer-summary')}
            />
          )}
          {hasAccess('barangay-reports') && (
            <RegistryCard 
              icon={FileChartColumnIncreasing} 
              title="Barangay Reports" 
              description="Export barangay-level performance audit reports" 
              buttonText="Generate Reports" 
              variant="secondary"
              onButtonClick={() => router.push('/barangay/barangay-reports')}
            />
          )}
        </div>
      </main>
    </div>
  );
}