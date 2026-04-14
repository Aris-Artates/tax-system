"use client"

import RegistryCard from '@/components/RegistryCard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import {
	Folder,
	FileText,
	Send,
	ListChecks,
	Clock3,
	CircleAlert,
} from 'lucide-react';

export default function DocumentTrackingPage() {
	const router = useRouter();
	const { permissions, user } = useAuth();

	const hasAccess = (tab: string) => {
		if (Number(user?.role_id) === 1) return true;
		const pm = permissions['document'];
		if (!pm) return false;
		if (!pm.tabs || Object.keys(pm.tabs).length === 0) return pm.can_view;
		return pm.tabs[tab]?.can_view;
	};

	const allCards = [
		{
			slug: 'incoming_documents',
			icon: Folder,
			title: 'Incoming Documents',
			description: 'View and log incoming requests and submitted records',
			buttonText: 'Open Inbox',
			path: '/document/incoming_documents'
		},
		{
			slug: 'document_register',
			icon: FileText,
			title: 'Document Register',
			description: 'Create and manage official document registry entries',
			buttonText: 'Register Document',
			path: '/document/document_register'
		},
		{
			slug: 'routing_and_endorsement',
			icon: Send,
			title: 'Routing & Endorsement',
			description: 'Forward documents to offices and assign responsible staff',
			buttonText: 'Route Document',
			path: '/document/routing_and_endorsement'
		},
		{
			slug: 'status_tracking',
			icon: ListChecks,
			title: 'Status Tracking',
			description: 'Track document progress from submission to completion',
			buttonText: 'View Status',
			path: '/document/status_tracking'
		},
		{
			slug: 'pending_documents',
			icon: Clock3,
			title: 'Pending Documents',
			description: 'Monitor overdue and unresolved documents requiring action',
			buttonText: 'Review Pending',
			path: '/document/pending_documents'
		},
		{
			slug: 'document_alerts',
			icon: CircleAlert,
			title: 'Document Alerts',
			description: 'Generate reminders for deadlines and pending endorsements',
			buttonText: 'View Alerts',
			path: '/document/document_alerts'
		}
	];

	const sortedCards = allCards
		.map(card => ({ ...card, locked: !hasAccess(card.slug) }))
		.sort((a, b) => (a.locked === b.locked ? 0 : a.locked ? 1 : -1));

	return (
		<div className='flex'>
			<main className='flex-1'>
				<header className='mb-10'>
					<h1 className={`font-lexend text-2xl font-bold text-[#595a5d]`}>
						Document Tracking
					</h1>
					<p className={`font-inter mt-1 text-xs text-slate-400`}>
						Records Management Module for Routing and Tracking Documents
					</p>
				</header>

				<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{sortedCards.map((card, idx) => (
						<RegistryCard
							key={`${card.slug}-${idx}`}
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
