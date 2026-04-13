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
					{hasAccess('rpt-assessment') && (
						<RegistryCard
							icon={Calculator}
							title='RPT Assessment'
							description='Compute real property tax based on assessed values'
							buttonText='Compute Tax'
							onButtonClick={() => router.push('/assessment/rpt-assessment')}
						/>
					)}
					{hasAccess('billing-generation') && (
						<RegistryCard
							icon={FileText}
							title='Billing Generation'
							description='Generate billing statements and assessment notices'
							buttonText='Generate Bill'
							onButtonClick={() => router.push('/assessment/billing-generation')}
						/>
					)}
					{hasAccess('or-monitoring') && (
						<RegistryCard
							icon={Receipt}
							title='Official Receipt Monitoring'
							description='Manage issued ORs and billing references'
							buttonText='View OR'
							onButtonClick={() => router.push('/assessment/or-monitoring')}
						/>
					)}
					{hasAccess('discounts-penalties') && (
						<RegistryCard
							icon={Percent}
							title='Discounts &amp; Penalties'
							description='Apply early payment discounts and late penalties'
							buttonText='Configure'
							variant='secondary'
							onButtonClick={() => router.push('/assessment/discounts-penalties')}
						/>
					)}
					{hasAccess('view-schedule') && (
						<RegistryCard
							icon={CalendarDays}
							title='Billing Schedules'
							description='Manage annual and quarterly billing cycles'
							buttonText='View Schedules'
							variant='secondary'
							onButtonClick={() => router.push('/assessment/view-schedule')}
						/>
					)}
					{hasAccess('billing-generation') && (
						<RegistryCard
							icon={ClipboardList}
							title='Billing &amp; Assessment Reports'
							description='Generate billing summaries and collection reports'
							buttonText='Generate Reports'
							variant='secondary'
							onButtonClick={() => router.push('/assessment/billing-generation')}
						/>
					)}
				</div>
			</main>
		</div>
	);
}