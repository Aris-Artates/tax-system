import Link from "next/link";
import {
  ArrowLeft,
  CircleDollarSign,
  HandCoins,
  Percent,
  Search,
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

type CollectionRow = {
  barangay: string;
  taxpayers: number;
  assessed: string;
  collected: string;
  rate: number;
  trend: "Up" | "Steady" | "Down";
};

const rows: CollectionRow[] = [
  {
    barangay: "San Roque",
    taxpayers: 214,
    assessed: "₱1,820,000",
    collected: "₱1,548,000",
    rate: 85,
    trend: "Up",
  },
  {
    barangay: "Anibongan",
    taxpayers: 176,
    assessed: "₱1,340,000",
    collected: "₱1,032,000",
    rate: 77,
    trend: "Steady",
  },
  {
    barangay: "Bagolibas",
    taxpayers: 149,
    assessed: "₱1,110,000",
    collected: "₱744,000",
    rate: 67,
    trend: "Down",
  },
  {
    barangay: "Cabunga-an",
    taxpayers: 132,
    assessed: "₱980,000",
    collected: "₱745,000",
    rate: 76,
    trend: "Up",
  },
  {
    barangay: "Maligaya",
    taxpayers: 121,
    assessed: "₱905,000",
    collected: "₱588,000",
    rate: 65,
    trend: "Down",
  },
  {
    barangay: "Rosal Poblacion",
    taxpayers: 188,
    assessed: "₱1,460,000",
    collected: "₱1,212,000",
    rate: 83,
    trend: "Up",
  },
];

export default function CollectionPerformancePage() {
  return (
    <div className="w-full">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            Collection Performance
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            RPT collections per barangay with current-period performance
            indicators.
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
            <CircleDollarSign className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">Total Assessed</p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            ₱7,615,000
          </p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <HandCoins className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">Total Collected</p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            ₱5,869,000
          </p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <Percent className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            Overall Collection Rate
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            77.07%
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
            Barangay Collection Details
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
                <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]">
                  Taxpayers
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]">
                  Assessed
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]">
                  Collected
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Rate
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Trend
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.barangay} className="hover:bg-gray-50">
                  <TableCell className="px-4 py-3 font-medium text-[#595a5d]">
                    {row.barangay}
                  </TableCell>
                  <TableCell className="px-4 py-3">{row.taxpayers}</TableCell>
                  <TableCell className="px-4 py-3">{row.assessed}</TableCell>
                  <TableCell className="px-4 py-3">{row.collected}</TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.rate >= 80
                          ? "bg-emerald-50 text-emerald-700"
                          : row.rate >= 70
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {row.rate}%
                    </span>
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.trend === "Up"
                          ? "bg-blue-50 text-blue-700"
                          : row.trend === "Steady"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {row.trend}
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
