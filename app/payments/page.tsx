"use client";

import { useRouter } from 'next/navigation';
import RegistryCard from '@/components/RegistryCard';
import { useAuth } from '@/context/AuthContext';
import {
    WalletCards,
    ReceiptText,
    CreditCard,
    ListChecks,
    CircleAlert,
    FileText,
} from 'lucide-react';

export default function PaymentsMonitoringPage() {
    const router = useRouter();
    const { permissions, user } = useAuth();

    const hasAccess = (tab: string) => {
        if (Number(user?.role_id) === 1) return true;
        const pm = permissions['payments'];
        if (!pm) return false;
        if (!pm.tabs || Object.keys(pm.tabs).length === 0) return pm.can_view;
        return pm.tabs[tab]?.can_view;
    };

    const allCards = [
        {
            slug: 'payment',
            icon: WalletCards,
            title: 'Record Payment',
            description: 'Post RPT payments and update taxpayer balances',
            buttonText: 'New Payment',
            path: '/payments/payment'
        },
        {
            slug: 'receipt',
            icon: ReceiptText,
            title: 'Official Receipt Issuance',
            description: 'Issue and manage official receipts',
            buttonText: 'Issue OR',
            path: '/payments/receipt'
        },
        {
            slug: 'channels',
            icon: CreditCard,
            title: 'Payment Channels',
            description: 'Manage cash, bank, and online payment methods',
            buttonText: 'Configure',
            path: '/payments/channels'
        },
        {
            slug: 'logs',
            icon: ListChecks,
            title: 'OR & Payment Logs',
            description: 'View chronological payment and OR records',
            buttonText: 'View Logs',
            path: '/payments/logs'
        },
        {
            slug: 'voided',
            icon: CircleAlert,
            title: 'Unapplied/Voided OR',
            description: 'Monitor voided or unapplied receipts',
            buttonText: 'Review',
            path: '/payments/voided'
        },
        {
            slug: 'reports',
            icon: FileText,
            title: 'Collection Reports',
            description: 'Generate daily, monthly, and annual collection reports',
            buttonText: 'Generate Reports',
            path: '/payments/reports'
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
                        Payments &amp; OR Monitoring
                    </h1>
                    <p className={`font-inter mt-1 text-xs text-slate-400`}>
                        Treasurer Module - Real-Time Payment and Official Receipt Tracking
                    </p>
                </header>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
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