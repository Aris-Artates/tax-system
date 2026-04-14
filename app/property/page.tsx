'use client';

import { useRouter } from 'next/navigation';
import RegistryCard from '@/components/RegistryCard';
import { Building2, FilePlusCorner, RefreshCcw, MapPinned, ListChecks, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PropertyRegistryPage() {
  const router = useRouter();
  const { permissions, user } = useAuth();
  
  const hasAccess = (tab: string) => {
    if (Number(user?.role_id) === 1) return true;
    const pm = permissions['property'];
    if (!pm) return false;
    if (!pm.tabs || Object.keys(pm.tabs).length === 0) return pm.can_view;
    return pm.tabs[tab]?.can_view; 
  };

  const allCards = [
    {
      slug: 'listing',
      icon: Building2,
      title: "Property Listing",
      description: "View and manage all registered real properties",
      buttonText: "Open Registry",
      path: '/property/listing'
    },
    {
      slug: 'new-td',
      icon: FilePlusCorner,
      title: "New Tax Declaration",
      description: "Create Tax Declaration for newly declared properties",
      buttonText: "Create TD",
      path: '/property/new-td'
    },
    {
      slug: 'reassessment',
      icon: RefreshCcw,
      title: "Reassessment & Revision",
      description: "Update assessments due to improvements or reclassification",
      buttonText: "Start Reassessment",
      path: '/property/reassessment'
    },
    {
      slug: 'mapping',
      icon: MapPinned,
      title: "Tax Mapping",
      description: "View properties by barangay and location",
      buttonText: "Open Map",
      variant: 'secondary' as const, // Legacy, will be overridden
      path: '/property/mapping'
    },
    {
      slug: 'schedules',
      icon: ListChecks,
      title: "Assessment Schedules",
      description: "Manage assessment levels and ordinances",
      buttonText: "View Schedules",
      path: '/property/schedules'
    },
    {
      slug: 'reports',
      icon: FileText,
      title: "Reports & Certifications",
      description: "Generate assessor reports and certifications",
      buttonText: "Generate",
      path: '/property/reports'
    }
  ];

  const sortedCards = allCards
    .map(card => ({ ...card, locked: !hasAccess(card.slug) }))
    .sort((a, b) => (a.locked === b.locked ? 0 : a.locked ? 1 : -1));

  return (
    <div className="flex">
      <main className="flex-1">
        <header className="mb-10">
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">Property Registry</h1>
          <p className="font-inter text-xs text-slate-400 mt-1">Assessor Module - Municipality of Sta. Rita, Samar</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCards.map((card, idx) => (
            <RegistryCard
              key={card.slug}
              icon={card.icon}
              title={card.title}
              description={card.description}
              buttonText={card.buttonText}
              variant={idx < 3 ? 'primary' : 'secondary'}
              onButtonClick={() => router.push(card.path)}
              locked={card.locked}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
