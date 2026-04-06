import Link from "next/link";
import { ArrowLeft, Building2, Home, Search, UsersRound } from "lucide-react";
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

type TaxpayerSummaryRow = {
  barangay: string;
  individualTaxpayers: number;
  corporateTaxpayers: number;
  totalTaxpayers: number;
  registeredProperties: number;
  avgPropertiesPerTaxpayer: number;
};

const summaryRows: TaxpayerSummaryRow[] = [
  {
    barangay: "San Roque",
    individualTaxpayers: 198,
    corporateTaxpayers: 16,
    totalTaxpayers: 214,
    registeredProperties: 326,
    avgPropertiesPerTaxpayer: 1.52,
  },
  {
    barangay: "Rosal Poblacion",
    individualTaxpayers: 172,
    corporateTaxpayers: 16,
    totalTaxpayers: 188,
    registeredProperties: 271,
    avgPropertiesPerTaxpayer: 1.44,
  },
  {
    barangay: "Anibongan",
    individualTaxpayers: 165,
    corporateTaxpayers: 11,
    totalTaxpayers: 176,
    registeredProperties: 249,
    avgPropertiesPerTaxpayer: 1.41,
  },
  {
    barangay: "Bagolibas",
    individualTaxpayers: 143,
    corporateTaxpayers: 6,
    totalTaxpayers: 149,
    registeredProperties: 198,
    avgPropertiesPerTaxpayer: 1.33,
  },
  {
    barangay: "Cabunga-an",
    individualTaxpayers: 126,
    corporateTaxpayers: 6,
    totalTaxpayers: 132,
    registeredProperties: 183,
    avgPropertiesPerTaxpayer: 1.39,
  },
  {
    barangay: "Maligaya",
    individualTaxpayers: 115,
    corporateTaxpayers: 6,
    totalTaxpayers: 121,
    registeredProperties: 164,
    avgPropertiesPerTaxpayer: 1.36,
  },
];

export default function TaxPayerSummaryPage() {
  return (
    <div className="w-full">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            Tax Payer Summary
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            View taxpayer and property distribution per barangay for planning
            and monitoring.
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
            <UsersRound className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">Total Taxpayers</p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            980
          </p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <Home className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            Registered Properties
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            1,391
          </p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-md bg-slate-100 p-2">
            <Building2 className="h-4 w-4 text-[#00154A]" />
          </div>
          <p className="font-inter text-xs text-slate-500">
            Avg Properties per Taxpayer
          </p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            1.42
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-inter text-xs font-semibold uppercase tracking-wide text-[#848794]">
            Barangay Taxpayer Breakdown
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
                  Individual
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Corporate
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
                  Registered Properties
                </TableHead>
                <TableHead
                  align="center"
                  className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#595a5d]"
                >
                  Avg/Taxpayer
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryRows.map((row) => (
                <TableRow key={row.barangay} className="hover:bg-gray-50">
                  <TableCell className="px-4 py-3 font-medium text-[#595a5d]">
                    {row.barangay}
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    {row.individualTaxpayers}
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    {row.corporateTaxpayers}
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    {row.totalTaxpayers}
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    {row.registeredProperties}
                  </TableCell>
                  <TableCell align="center" className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {row.avgPropertiesPerTaxpayer.toFixed(2)}
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
