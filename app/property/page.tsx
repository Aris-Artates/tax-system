'use client';

import { useRouter } from 'next/navigation';
import RegistryCard from '@/components/RegistryCard';
import { Building2, FilePlusCorner, RefreshCcw, MapPinned, ListChecks, FileText } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export default function PropertyRegistryPage() {
  const router = useRouter();
  const { permissions, user } = useAuth();
  
  const hasAccess = (tab: string) => {
    // Super admin bypass
    if (Number(user?.role_id) === 1) return true;
    
    const pm = permissions['property'];
    if (!pm) return false;
    // Fast path: if there are no tabs listed but they somehow have view access to the module root (global permission)
    if (!pm.tabs || Object.keys(pm.tabs).length === 0) return pm.can_view;
    return pm.tabs[tab]?.can_view; 
  };

  return (
    <div className="flex">
      <main className="flex-1">
        <header className="mb-10">
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">Property Registry</h1>
          <p className="font-inter text-xs text-slate-400 mt-1">Assessor Module - Municipality of Sta. Rita, Samar</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hasAccess('listing') && (
            <RegistryCard
              icon={Building2}
              title="Property Listing"
              description="View and manage all registered real properties"
              buttonText="Open Registry"
              onButtonClick={() => router.push('/property/listing')}
            />
          )}
          {hasAccess('new-td') && (
            <RegistryCard
              icon={FilePlusCorner}
              title="New Tax Declaration"
              description="Create Tax Declaration for newly declared properties"
              buttonText="Create TD"
              onButtonClick={() => router.push('/property/new-td')}
            />
          )}
          {hasAccess('reassessment') && (
            <RegistryCard
              icon={RefreshCcw}
              title="Reassessment & Revision"
              description="Update assessments due to improvements or reclassification"
              buttonText="Start Reassessment"
              onButtonClick={() => router.push('/property/reassessment')}
            />
          )}
          {hasAccess('mapping') && (
            <RegistryCard
              icon={MapPinned}
              title="Tax Mapping"
              description="View properties by barangay and location"
              buttonText="Open Map"
              variant="secondary"
              onButtonClick={() => router.push('/property/mapping')}
            />
          )}
          {hasAccess('schedules') && (
            <RegistryCard
              icon={ListChecks}
              title="Assessment Schedules"
              description="Manage assessment levels and ordinances"
              buttonText="View Schedules"
              variant="secondary"
              onButtonClick={() => router.push('/property/schedules')}
            />
          )}
          {hasAccess('reports') && (
            <RegistryCard
              icon={FileText}
              title="Reports & Certifications"
              description="Generate assessor reports and certifications"
              buttonText="Generate"
              variant="secondary"
              onButtonClick={() => router.push('/property/reports')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
