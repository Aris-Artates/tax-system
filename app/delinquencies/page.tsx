"use client";

import RegistryCard from "@/components/RegistryCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import {
  CircleAlert,
  Clock3,
  FileWarning,
  Send,
  BellRing,
  FileText,
} from "lucide-react";

export default function DeliquenciesNoticesPage() {
  const router = useRouter();
  const { permissions, user } = useAuth();

  const hasAccess = (tab: string) => {
    if (Number(user?.role_id) === 1) return true;
    const pm = permissions['delinquencies'];
    if (!pm) return false;
    if (!pm.tabs || Object.keys(pm.tabs).length === 0) return pm.can_view;
    return pm.tabs[tab]?.can_view;
  };

  return (
    <div className="flex">
      <main className="flex-1">
        <header className="mb-10">
          <h1 className={`font-lexend text-2xl font-bold text-[#595a5d]`}>
            Delinquencies &amp; Notices
          </h1>
          <p className={`font-inter mt-1 text-xs text-slate-400`}>
            Enforcement &amp; Compliance Module Monitoring Overdue RPT Accounts
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hasAccess('delinquent_accounts') && (
            <RegistryCard
              icon={CircleAlert}
              title="Delinquent Accounts"
              description="List of taxpayers with unpaid RPT obligations"
              buttonText="View Accounts"
              onButtonClick={() =>
                router.push("/delinquencies/delinquent_accounts")
              }
            />
          )}
          {hasAccess('aging_of_delinquencies') && (
            <RegistryCard
              icon={Clock3}
              title="Aging of Delinquencies"
              description="1,2,5+ year delinquency classification"
              buttonText="View Aging"
              onButtonClick={() =>
                router.push("/delinquencies/aging_of_delinquencies")
              }
            />
          )}
          {hasAccess('notice_generation') && (
            <RegistryCard
              icon={FileWarning}
              title="Notice Generation"
              description="Auto-generate demand and delinquency notices"
              buttonText="Generate Notices"
              onButtonClick={() =>
                router.push("/delinquencies/notice_generation")
              }
            />
          )}
          {hasAccess('notice_distribution') && (
            <RegistryCard
              icon={Send}
              title="Notice Distribution"
              description="Track released, served, and acknowledged notices"
              buttonText="Track Distribution"
              variant="secondary"
              onButtonClick={() =>
                router.push("/delinquencies/notice_distribution")
              }
            />
          )}
          {hasAccess('reminder_alerts') && (
            <RegistryCard
              icon={BellRing}
              title="Reminders &amp; Alerts"
              description="Automated reminders for taxpayers and staff"
              buttonText="Configure Alerts"
              variant="secondary"
              onButtonClick={() => router.push("/delinquencies/reminder_alerts")}
            />
          )}
          {hasAccess('delinquency_reports') && (
            <RegistryCard
              icon={FileText}
              title="Delinquency Reports"
              description="Generate enforcement and compliance reports"
              buttonText="Generate Reports"
              variant="secondary"
              onButtonClick={() =>
                router.push("/delinquencies/delinquency_reports")
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}
