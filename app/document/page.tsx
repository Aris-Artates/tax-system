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
					{hasAccess('incoming_documents') && (
						<RegistryCard
							icon={Folder}
							title='Incoming Documents'
							description='View and log incoming requests and submitted records'
							buttonText='Open Inbox'
							onButtonClick={() => router.push('/document/incoming_documents')}
						/>
					)}
					{hasAccess('document_register') && (
						<RegistryCard
							icon={FileText}
							title='Document Register'
							description='Create and manage official document registry entries'
							buttonText='Register Document'
							onButtonClick={() => router.push('/document/document_register')}
						/>
					)}
					{hasAccess('routing_and_endorsement') && (
						<RegistryCard
							icon={Send}
							title='Routing &amp; Endorsement'
							description='Forward documents to offices and assign responsible staff'
							buttonText='Route Document'
							onButtonClick={() => router.push('/document/routing_and_endorsement')}
						/>
					)}
					{hasAccess('status_tracking') && (
						<RegistryCard
							icon={ListChecks}
							title='Status Tracking'
							description='Track document progress from submission to completion'
							buttonText='View Status'
							variant='secondary'
							onButtonClick={() => router.push('/document/status_tracking')}
						/>
					)}
					{hasAccess('pending_documents') && (
						<RegistryCard
							icon={Clock3}
							title='Pending Documents'
							description='Monitor overdue and unresolved documents requiring action'
							buttonText='Review Pending'
							variant='secondary'
							onButtonClick={() => router.push('/document/pending_documents')}
						/>
					)}
					{hasAccess('document_alerts') && (
						<RegistryCard
							icon={CircleAlert}
							title='Document Alerts'
							description='Generate reminders for deadlines and pending endorsements'
							buttonText='View Alerts'
							variant='secondary'
							onButtonClick={() => router.push('/document/document_alerts')}
						/>
					)}
				</div>
			</main>
		</div>
	);
}
