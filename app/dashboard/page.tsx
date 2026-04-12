"use client";

import React, { useState } from "react";
import AnalyticsCard from "@/components/AnalyticsCard";
import MonthlyCollectionComponent from "@/components/MonthlyCollectionComponent";
import { useRouter } from "next/navigation";
import { GenerateReportModal } from "@/components/GenerateReportModal";

export default function Dashboard() {
  const router = useRouter();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, any>>({});
  const [roleId, setRoleId] = useState<number | null>(null);

  React.useEffect(() => {
    async function loadSession() {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data.user) {
        setRoleId(Number(data.user.role_id));
        setPermissions(data.permissions || {});
      }
    }
    loadSession();
  }, []);

  const hasDelinquencyAccess = roleId === 1 || permissions["Taxpayer Records"]?.can_view;

  return (
    <main>
      <div className="w-full mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`font-lexend gi text-2xl font-bold text-[#595a5d]`}>
            Dashboard Overview
          </h1>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className={`font-inter bg-[#0f1729] text-[#9fa2aa] px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 transition-colors cursor-pointer`}
          >
            Generate Report
          </button>
        </div>
        <AnalyticsCard />
      </div>

      {/* Main Container */}

      <div className="w-full flex flex-col md:flex-row gap-4 m-0 bg-[#f0f4f7]">
        <MonthlyCollectionComponent />

        {/* Right Card: Delinquent Accounts Stats */}
        <div className="bg-white border border-gray-200 p-8 flex flex-col mx-auto md:w-3/5 shadow-sm rounded-sm">
          <h2 className={`font-inter text-[#80838f] text-sm font-bold mb-6`}>
            Delinquent Accounts
          </h2>

          <ul className="text-gray-500 text-sm space-y-4">
            <li className={`font-inter text-[#989ba6] flex items-center`}>
              <span className="text-gray-800 text-lg leading-none mr-2">•</span>
              1,245 properties overdue
            </li>
            <li className={`font-inter text-[#989ba6] flex items-center`}>
              <span className="text-gray-800 text-lg leading-none mr-2">•</span>
              $320M unpaid taxes
            </li>
            <li className={`font-inter text-[#989ba6] flex items-center`}>
              <span className="text-gray-800 text-lg leading-none mr-2">•</span>
              18% delinquency rate
            </li>
          </ul>

          <div className="mt-10">
            <button
              disabled={!hasDelinquencyAccess}
              onClick={() => router.push("/taxpayers/view-delinquencies")}
              className={`font-inter w-full text-xs font-semibold py-2 px-4 rounded-sm transition-all shadow-sm ${
                hasDelinquencyAccess 
                  ? "bg-[#0f1729] hover:bg-slate-800 text-[#949ba3] cursor-pointer" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed grayscale"
              }`}
            >
              {hasDelinquencyAccess ? "View Delinquencies" : "Access Restricted"}
            </button>
          </div>
        </div>
      </div>

      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onExport={(format, config) => {
          console.log("Export triggered:", format, config);
          // In a real app, this would trigger an API call to download the PDF/CSV
        }}
      />
    </main>
  );
}
