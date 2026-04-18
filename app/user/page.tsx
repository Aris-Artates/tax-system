"use client";

import RegistryCard from '@/components/RegistryCard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import {
	UsersRound,
	UserRoundPlus,
	Shield,
	KeyRound,
	Activity,
	Settings,
	ShieldCheck,
} from 'lucide-react';

export default function UserRoleManagementPage() {
	const router = useRouter();
	const { permissions, user, isLoading } = useAuth();
	const { canEdit, isSuperAdmin } = usePermission("user");

	const hasAccess = (card: any) => {
		if (isSuperAdmin) return true;
		const pm = permissions['user'];
		if (!pm) return false;

		// Determine if this card needs Edit or just View
		const needsEdit = ['create', 'manage', 'settings'].includes(card.slug);
		
		if (needsEdit && !pm.can_edit) return false;
		if (!pm.can_view) return false;

		// Check tab-level if applicable
		if (pm.tabs && Object.keys(pm.tabs).length > 0) {
			const tabPerm = pm.tabs[card.slug];
			if (!tabPerm) return false;
			if (needsEdit && !tabPerm.can_edit) return false;
			return tabPerm.can_view;
		}

		return true;
	};

	// Super Admin exclusive card


	const allCards = [
		{
			slug: 'view',
			icon: UsersRound,
			title: 'User Accounts',
			description: 'Manage system users from Assessor, Treasurer, and Admin',
			buttonText: 'View Users',
			path: '/user/view'
		},
		{
			slug: 'create',
			icon: UserRoundPlus,
			title: 'Add New User',
			description: 'Create new user accounts with assigned roles',
			buttonText: 'Create User',
			path: '/user/create'
		},
		{
			slug: 'manage',
			icon: Shield,
			title: 'Role Management',
			description: 'Define roles and access permissions per module',
			buttonText: 'Manage Roles',
			path: '/user/manage'
		},
		{
			slug: 'settings',
			icon: KeyRound,
			title: 'Permission Settings',
			description: 'Fine-grained access control for system features',
			buttonText: 'Configure Permissions',
			path: '/user/settings/permission'
		},
		{
			slug: 'activity',
			icon: Activity,
			title: 'User Activity Logs',
			description: 'Track logins, actions, and system usage',
			buttonText: 'View Logs',
			path: '/user/activity/logs'
		},
		{
			slug: 'settings', // Use 'settings' as multiple cards might map to it
			icon: Settings,
			title: 'Security Settings',
			description: 'Password policies, session control, and MFA',
			buttonText: 'Security Options',
			path: '/user/settings/security'
		},
		// Super Admin only: Access Requests review panel
		...(isSuperAdmin ? [{
			slug: 'access-requests',
			icon: ShieldCheck,
			title: 'Access Requests',
			description: 'Review and manage permission requests from users',
			buttonText: 'Review Requests',
			path: '/user/access-requests'
		}] : [])
	];

	const sortedCards = allCards
		.map(card => ({ ...card, locked: !hasAccess(card) }))
		.sort((a, b) => (a.locked === b.locked ? 0 : a.locked ? 1 : -1));

	return (
		<div className='flex'>
			<main className='flex-1'>
				<header className='mb-10'>
					<h1 className={`font-lexend text-2xl font-bold text-[#595a5d]`}>
						User Role &amp; Management
					</h1>
					<p className={`font-inter mt-1 text-xs text-slate-400`}>
						System Administrator Module Access Control and Accountability
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
							onButtonClick={() => router.push(card.path)}
							locked={card.locked}
							variant={idx < 3 ? 'primary' : 'secondary'}
						/>
					))}
				</div>
			</main>
		</div>
	);
}
