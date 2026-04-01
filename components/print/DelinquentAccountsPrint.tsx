"use client";

export type DelinquentTaxpayerPrint = {
  id: number;
  full_name: string;
  barangay_name: string;
  years_due: string;
  total_due: string;
  bucket: string;
};

const PRINT_CSS = `
  @media print {
    @page { size: A4 portrait; margin: 12mm 14mm; }
    body { visibility: hidden !important; }
    #delinquent-accounts-print-root,
    #delinquent-accounts-print-root * { visibility: visible !important; }
    #delinquent-accounts-print-root {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 210mm !important;
    }
  }
`;

interface Props {
  data: DelinquentTaxpayerPrint[];
}

const fmt = {
  printedOn: () =>
    new Date().toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
};

export function DelinquentAccountsPrint({ data }: Props) {
  return (
    <>
      <style>{PRINT_CSS}</style>

      {/* A4 print container */}
      <div
        id="delinquent-accounts-print-root"
        className="
          mx-auto box-border
          w-[210mm] min-h-[297mm]
          bg-white text-black font-serif text-[10pt] leading-snug
          border border-black/10
          p-[14mm]
          print:border-none print:p-0
        "
      >
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="text-center border-b-2 border-black pb-3 mb-6">
          <p className="text-[7.5pt] tracking-[0.25em] uppercase font-bold">
            Republic of the Philippines
          </p>
          <p className="text-[8.5pt]">
            Province of Samar — Municipality of Sta. Rita
          </p>
          <p className="text-[9pt] font-bold uppercase tracking-widest mt-0.5">
            Office of the Municipal Treasurer
          </p>
          <h1 className="text-[18pt] font-black uppercase tracking-widest mt-2 mb-0">
            Delinquency Report
          </h1>
          <p className="text-[8pt] italic text-gray-600">
            Official List of Real Property Tax Delinquencies
          </p>
        </div>

        {/* ── SUMMARY SECTION ─────────────────────────────────────────────── */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <p className="text-[8pt] font-bold uppercase text-gray-500">
              Statement Period
            </p>
            <p className="text-[10pt] font-semibold">As of {fmt.printedOn()}</p>
          </div>
          <div className="text-right">
            <p className="text-[8pt] font-bold uppercase text-gray-500">
              Total Delinquents on Page
            </p>
            <p className="text-[10pt] font-bold">{data.length} Accounts</p>
          </div>
        </div>

        {/* ── THE TABLE ─────────────────────────────────────────────────── */}
        <table className="w-full border-collapse border border-black text-[8.5pt] mb-8">
          <thead>
            <tr className="bg-gray-50 font-bold uppercase text-[7pt] tracking-wider">
              <th className="border border-black px-2 py-2 text-left">
                Ref Number
              </th>
              <th className="border border-black px-2 py-2 text-left">
                Taxpayer Name
              </th>
              <th className="border border-black px-2 py-2 text-left">
                Barangay
              </th>
              <th className="border border-black px-2 py-2 text-center whitespace-nowrap">
                Years Due
              </th>
              <th className="border border-black px-2 py-2 text-center whitespace-nowrap">
                Aging
              </th>
              <th className="border border-black px-2 py-2 text-right whitespace-nowrap">
                Amount Due
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border border-black px-2 py-4 text-center italic text-gray-400"
                >
                  No records to display for the current selection.
                </td>
              </tr>
            ) : (
              data.map((account) => (
                <tr
                  key={account.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="border border-black px-2 py-2 font-mono text-[8pt]">
                    TD-{account.id.toString().padStart(5, "0")}
                  </td>
                  <td className="border border-black px-2 py-2 font-semibold capitalize">
                    {account.full_name.toLowerCase()}
                  </td>
                  <td className="border border-black px-2 py-2 text-gray-600">
                    {account.barangay_name}
                  </td>
                  <td className="border border-black px-2 py-2 text-center font-mono text-[8pt]">
                    {account.years_due}
                  </td>
                  <td className="border border-black px-2 py-2 text-center italic">
                    {account.bucket}
                  </td>
                  <td className="border border-black px-2 py-2 text-right font-bold tracking-tight">
                    {account.total_due}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── FOOTER REMARKS ──────────────────────────────────────────────── */}
        <div className="border border-black/20 p-3 mb-10 text-[7.5pt] leading-relaxed text-gray-600">
          <p className="font-bold uppercase mb-1">Notice to the Public:</p>
          <p>
            This list represents the current real property tax delinquencies on
            file as of the date of printing. Taxpayers are encouraged to settle
            their obligations at the Office of the Municipal Treasurer to avoid
            further penalties, interest, and the initiation of legal remedies
            including civil action or warrants of levy.
          </p>
        </div>

        {/* ── SIGNATORIES ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-10 mt-10">
          <div className="text-center">
            <p className="text-[7.5pt] font-bold uppercase mb-8">
              Prepared By:
            </p>
            <div className="relative inline-block w-64 border-t border-black pt-1">
              <p className="text-[9.5pt] font-bold uppercase tracking-wide">
                ________________________
              </p>
              <p className="text-[7pt] text-gray-600 mt-1 uppercase italic">
                Revenue Collection Clerk
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[7.5pt] font-bold uppercase mb-8">
              Attested By:
            </p>
            <div className="relative inline-block w-64 border-t border-black pt-1">
              <p className="text-[9.5pt] font-bold uppercase tracking-wide">
                ________________________
              </p>
              <p className="text-[7pt] text-gray-600 mt-1 uppercase font-bold italic">
                Municipal Treasurer
              </p>
            </div>
          </div>
        </div>

        {/* ── PAGE FOOTER ─────────────────────────────────────────────────── */}
        <div className="mt-16 border-t border-black/10 pt-2 text-center text-[7pt] text-gray-400">
          Sta. Rita Real Property Tax Monitoring System · RPTMS V2.0
          &nbsp;·&nbsp; Printed: {new Date().toLocaleString()}
        </div>
      </div>
    </>
  );
}
