import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Search,
  TrendingUp,
  Trophy,
  Users,
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
} from "@/components/Table";

type RankingRow = {
  rank: number;
  barangay: string;
  collectionRate: number;
  totalCollected: string;
  taxpayers: number;
  movement: "Up" | "No Change" | "Down";
};

const rankingRows: RankingRow[] = [
  {
    rank: 1,
    barangay: "San Roque",
    collectionRate: 89,
    totalCollected: "₱1,548,000",
    taxpayers: 214,
    movement: "Up",
  },
  {
    rank: 2,
    barangay: "Rosal Poblacion",
    collectionRate: 84,
    totalCollected: "₱1,212,000",
    taxpayers: 188,
    movement: "Up",
  },
  {
    rank: 3,
    barangay: "Anibongan",
    collectionRate: 78,
    totalCollected: "₱1,032,000",
    taxpayers: 176,
    movement: "No Change",
  },
  {
    rank: 4,
    barangay: "Cabunga-an",
    collectionRate: 76,
    totalCollected: "₱745,000",
    taxpayers: 132,
    movement: "Up",
  },
  {
    rank: 5,
    barangay: "Bagolibas",
    collectionRate: 68,
    totalCollected: "₱744,000",
    taxpayers: 149,
    movement: "Down",
  },
  {
    rank: 6,
    barangay: "Maligaya",
    collectionRate: 65,
    totalCollected: "₱588,000",
    taxpayers: 121,
    movement: "Down",
  },
];

export default function BarangayRankingPage() {
  return (
    <div className="w-full">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            Barangay Ranking
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Rank barangays by RPT collection efficiency and compliance
            performance.
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
            <Trophy className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            Top Performing Barangay
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            San Roque
          </p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <TrendingUp className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            Average Collection Rate
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            76.67%
          </p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <Users className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">Ranked Barangays</p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">6</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
            Performance Ranking
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
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Rank
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]">
                  Barangay
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Collection Rate
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]">
                  Total Collected
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Taxpayers
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Movement
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankingRows.map((row) => (
                <TableRow key={row.barangay} className="hover:bg-gray-50">
                  <TableCell align="center" className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.rank <= 3
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {row.rank <= 3 && <Award className="mr-1 h-3 w-3" />}#
                      {row.rank}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-[#595a5d]">
                    {row.barangay}
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.collectionRate >= 80
                          ? "bg-emerald-50 text-emerald-700"
                          : row.collectionRate >= 70
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {row.collectionRate}%
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {row.totalCollected}
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    {row.taxpayers}
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.movement === "Up"
                          ? "bg-blue-50 text-blue-700"
                          : row.movement === "No Change"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {row.movement}
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
