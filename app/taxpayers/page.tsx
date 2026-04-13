"use client";

import { useRouter } from "next/navigation";
import RegistryCard from "@/components/RegistryCard";
import { useAuth } from "@/context/AuthContext";
import {
  House,
  TriangleAlert,
  UserPlus,
  UsersRound,
  Wallet,
  FileText,
} from "lucide-react";

export default function TaxPayersPage() {
  const router = useRouter();
  const { permissions, user } = useAuth();

  const hasAccess = (tab: string) => {
    if (Number(user?.role_id) === 1) return true;
    const pm = permissions['taxpayers'];
    if (!pm) return false;
    if (!pm.tabs || Object.keys(pm.tabs).length === 0) return pm.can_view;
    return pm.tabs[tab]?.can_view;
  };

  return (
    <div className="flex">
      <main className="flex-1">
        <header className="mb-10">
          <h1 className={`font-lexend text-2xl font-bold text-[#595a5d]`}>
            Taxpayer Records
          </h1>
          <p className={`font-inter mt-1 text-xs text-slate-400`}>
            Unified Taxpayer Profiles - Assessor &amp; Treasurer Module
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hasAccess('list') && (
            <RegistryCard
              icon={UsersRound}
              title="Taxpayer Master List"
              description="View and manage all registered taxpayers"
              buttonText="Open Taxpayer List"
              onButtonClick={() => router.push("/taxpayers/list")}
            />
          )}
          {hasAccess('register') && (
            <RegistryCard
              icon={UserPlus}
              title="Register New Taxpayer"
              description="Create a new taxpayer profile"
              buttonText="Add Taxpayer"
              onButtonClick={() => router.push("/taxpayers/register")}
            />
          )}
          {hasAccess('linked-properties') && (
            <RegistryCard
              icon={House}
              title="Linked Properties"
              description="View all properties owned by a taxpayer"
              buttonText="View Properties"
              onButtonClick={() => router.push("/taxpayers/linked-properties")}
            />
          )}
          {hasAccess('payments') && (
            <RegistryCard
              icon={Wallet}
              title="Payment History"
              description="Track payments and official receipts"
              buttonText="View Payments"
              variant="secondary"
              onButtonClick={() => router.push("/taxpayers/payments")}
            />
          )}
          {hasAccess('view-delinquencies') && (
            <RegistryCard
              icon={TriangleAlert}
              title="Delinquent Accounts"
              description="Taxpayers with unpaid or overdue RPT"
              buttonText="View Delinquencies"
              variant="secondary"
              onButtonClick={() => router.push("/taxpayers/view-delinquencies")}
            />
          )}
          {hasAccess('records') && (
            <RegistryCard
              icon={FileText}
              title="Certifications &amp; Records"
              description="Issue certifications and official records"
              buttonText="Generate Certificate"
              variant="secondary"
              onButtonClick={() => router.push("/taxpayers/records")}
            />
          )}
        </div>
      </main>
    </div>
  );
}
