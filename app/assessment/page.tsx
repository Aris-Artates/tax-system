"use client";

import RegistryCard from '@/components/RegistryCard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import {
	Calculator,
	FileText,
	Receipt,
	Percent,
	CalendarDays,
	ClipboardList,
} from 'lucide-react';

export default function AssessmentBillingPage() {
	const router = useRouter();
	const { permissions, user } = useAuth();

	const hasAccess = (tab: string) => {
		if (Number(user?.role_id) === 1) return true;
		const pm = permissions['assessment'];
		if (!pm) return false;
		if (!pm.tabs || Object.keys(pm.tabs).length === 0) return pm.can_view;
		return pm.tabs[tab]?.can_view;
	};

	const allCards = [
		{
			slug: 'rpt-assessment',
			icon: Calculator,
			title: 'RPT Assessment',
			description: 'Compute real property tax based on assessed values',
			buttonText: 'Compute Tax',
			path: '/assessment/rpt-assessment'
		},
		{
			slug: 'billing-generation',
			icon: FileText,
			title: 'Billing Generation',
			description: 'Generate billing statements and assessment notices',
			buttonText: 'Generate Bill',
			path: '/assessment/billing-generation'
		},
		{
			slug: 'or-monitoring',
			icon: Receipt,
			title: 'Official Receipt Monitoring',
			description: 'Manage issued ORs and billing references',
			buttonText: 'View OR',
			path: '/assessment/or-monitoring'
		},
		{
			slug: 'discounts-penalties',
			icon: Percent,
			title: 'Discounts & Penalties',
			description: 'Apply early payment discounts and late penalties',
			buttonText: 'Configure',
			path: '/assessment/discounts-penalties'
		},
		{
			slug: 'view-schedule',
			icon: CalendarDays,
			title: 'Billing Schedules',
			description: 'Manage annual and quarterly billing cycles',
			buttonText: 'View Schedules',
			path: '/assessment/view-schedule'
		},
		{
			slug: 'billing-generation', // Map report to generation slug as placeholders for now
			icon: ClipboardList,
			title: 'Billing & Assessment Reports',
			description: 'Generate billing summaries and collection reports',
			buttonText: 'Generate Reports',
			path: '/assessment/billing-generation'
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
						Assessment &amp; Billing
					</h1>
					<p className={`font-inter mt-1 text-xs text-slate-400`}>
						Treasurer Module - RPT Computation and Billing Management
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