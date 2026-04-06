import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CircleAlert,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";

type HotspotRow = {
  barangay: string;
  delinquentTaxpayers: number;
  totalTaxpayers: number;
  delinquencyRate: number;
  overdueAmount: string;
  riskLevel: "High" | "Medium" | "Low";
};

const hotspotRows: HotspotRow[] = [
  {
    barangay: "Maligaya",
    delinquentTaxpayers: 42,
    totalTaxpayers: 121,
    delinquencyRate: 35,
    overdueAmount: "₱317,000",
    riskLevel: "High",
  },
  {
    barangay: "Bagolibas",
    delinquentTaxpayers: 45,
    totalTaxpayers: 149,
    delinquencyRate: 30,
    overdueAmount: "₱366,000",
    riskLevel: "High",
  },
  {
    barangay: "Cabunga-an",
    delinquentTaxpayers: 29,
    totalTaxpayers: 132,
    delinquencyRate: 22,
    overdueAmount: "₱235,000",
    riskLevel: "Medium",
  },
  {
    barangay: "Anibongan",
    delinquentTaxpayers: 31,
    totalTaxpayers: 176,
    delinquencyRate: 18,
    overdueAmount: "₱308,000",
    riskLevel: "Medium",
  },
  {
    barangay: "Rosal Poblacion",
    delinquentTaxpayers: 24,
    totalTaxpayers: 188,
    delinquencyRate: 13,
    overdueAmount: "₱248,000",
    riskLevel: "Low",
  },
  {
    barangay: "San Roque",
    delinquentTaxpayers: 22,
    totalTaxpayers: 214,
    delinquencyRate: 10,
    overdueAmount: "₱272,000",
    riskLevel: "Low",
  },
];

export default function DelinquencyHotspotsPage() {
  return (
    <div className="w-full">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            Delinquency Hotspots
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Identify barangays with high delinquency rates and overdue RPT
            exposure.
          </p>
        </div>

        <Link href="/barangay">
          <Button
            variant="outline"
            className="font-inter h-9 cursor-pointer text-xs text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Barangay Overview
          </Button>
        </Link>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <ShieldAlert className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            High-Risk Barangays
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">2</p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <CircleAlert className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            Total Delinquent Taxpayers
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            193
          </p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <AlertTriangle className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            Total Overdue Exposure
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            ₱1,746,000
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
            Hotspot Monitoring
          </h2>

          <div className="flex w-full gap-2 sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search barangay"
                className="h-9 pl-8 text-xs"
              />
            </div>
            <Button variant="outline" className="h-9 px-3 text-xs">
              Current Year
            </Button>
          </div>
        </div>

        <TableContainer>
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]">
                  Barangay
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Delinquent
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Total Taxpayers
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Delinquency Rate
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]">
                  Overdue Amount
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Risk Level
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotspotRows.map((row) => (
                <TableRow key={row.barangay} className="hover:bg-gray-50">
                  <TableCell className="px-4 py-3 font-medium text-[#595a5d]">
                    {row.barangay}
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    {row.delinquentTaxpayers}
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    {row.totalTaxpayers}
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.delinquencyRate >= 25
                          ? "bg-rose-50 text-rose-700"
                          : row.delinquencyRate >= 15
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {row.delinquencyRate}%
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {row.overdueAmount}
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.riskLevel === "High"
                          ? "bg-rose-50 text-rose-700"
                          : row.riskLevel === "Medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {row.riskLevel}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </div>
  );
}
