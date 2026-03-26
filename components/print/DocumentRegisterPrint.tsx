"use client";

export interface DocumentPrintData {
  refNumber: string;
  date: string;
  subject: string;
  category: string;
  origin: string;
  status: "Received" | "Pending" | "Approved" | "Archived";
  // TODO: replace dummy fields below with real data fields
  remarks?: string;
  receivingOfficer?: string;
  approvingOfficer?: string;
}

const PRINT_CSS = `
  @media print {
    @page { size: A4 portrait; margin: 12mm 14mm; }
    body { visibility: hidden !important; }
    #doc-register-print-root,
    #doc-register-print-root * { visibility: visible !important; }
    #doc-register-print-root {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 210mm !important;
    }
  }
`;

interface Props {
  data: DocumentPrintData;
}

const fmt = {
  date: (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  },
  printedOn: () =>
    new Date().toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
};

export function DocumentRegisterPrint({ data }: Props) {
  const statusColors: Record<DocumentPrintData["status"], string> = {
    Approved: "border-black bg-black text-white",
    Pending: "border-black",
    Received: "border-black",
    Archived: "border-black bg-gray-300",
  };

  return (
    <>
      <style>{PRINT_CSS}</style>

      {/* A4 print container */}
      <div
        id="doc-register-print-root"
        className="
          mx-auto box-border
          w-[210mm] min-h-[297mm]
          bg-white text-black font-serif text-[10pt] leading-snug
          border border-black
          p-[14mm]
          print:border-none print:p-0
        "
      >
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <p className="text-[7.5pt] tracking-[0.25em] uppercase font-bold">
            Republic of the Philippines
          </p>
          {/* TODO: replace with real province / municipality */}
          <p className="text-[8.5pt]">Province of Samar — Municipality of Sta. Rita</p>
          <p className="text-[9pt] font-bold uppercase tracking-widest mt-0.5">
            {/* TODO: replace with real office name */}
            Office of the Municipal Treasurer
          </p>
          <h1 className="text-[18pt] font-black uppercase tracking-[0.15em] mt-1 mb-0">
            Document Register
          </h1>
          <p className="text-[7.5pt] italic text-gray-600">
            Official Incoming / Outgoing Document Record
          </p>
        </div>

        {/* ── SECTION I — DOCUMENT IDENTIFIERS ────────────────────────────── */}
        <SectionHeader label="I. Document Identification" />
        <div className="border border-black">
          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black">
              <Cell label="Reference Number" value={data.refNumber} mono />
            </div>
            <div className="flex-1 border-r border-black">
              <Cell label="Date Received" value={fmt.date(data.date)} />
            </div>
            <div className="flex items-center px-3 gap-2">
              <p className="text-[6.5pt] font-bold text-gray-500 uppercase tracking-wider">
                Status
              </p>
              <span
                className={`text-[8pt] font-bold uppercase border px-2 py-0.5 tracking-wide ${statusColors[data.status]}`}
              >
                {data.status}
              </span>
            </div>
          </div>
          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black">
              <Cell label="Category" value={data.category} />
            </div>
            <div className="flex-1">
              <Cell label="Origin / Sender" value={data.origin} />
            </div>
          </div>
          <div>
            <Cell label="Subject / Title" value={data.subject} />
          </div>
        </div>

        {/* ── SECTION II — DOCUMENT DESCRIPTION ───────────────────────────── */}
        <SectionHeader label="II. Description / Summary" />
        <div className="border border-black px-3 py-2 min-h-[30mm]">
          {/* TODO: replace with actual description field when available */}
          <p className="text-[8pt] italic text-gray-400">
            [No description on file — to be filled upon full data integration]
          </p>
        </div>

        {/* ── SECTION III — ROUTING / ACTION ──────────────────────────────── */}
        <SectionHeader label="III. Routing &amp; Action" />
        <table className="w-full border-collapse border border-black text-[8.5pt] mb-3">
          <thead>
            <tr>
              {["Action Taken", "Forwarded To", "Date Forwarded", "Remarks"].map(
                (h) => (
                  <th
                    key={h}
                    className="border border-black px-2 py-1 text-center text-[7.5pt] font-bold uppercase bg-gray-100 leading-tight"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {/* TODO: replace with real routing log rows when available */}
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                <td className="border border-black px-2 py-3" />
                <td className="border border-black px-2 py-3" />
                <td className="border border-black px-2 py-3" />
                <td className="border border-black px-2 py-3" />
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── SECTION IV — REMARKS ────────────────────────────────────────── */}
        <SectionHeader label="IV. Remarks / Notes" />
        <div className="border border-black px-3 py-2 min-h-[20mm] mb-4">
          {data.remarks ? (
            <p className="text-[9pt]">{data.remarks}</p>
          ) : (
            /* TODO: replace with actual remarks field */
            <p className="text-[8pt] italic text-gray-400">No additional remarks on file.</p>
          )}
        </div>

        {/* ── CERTIFICATION BLOCK ──────────────────────────────────────────── */}
        <div className="border border-black px-3 py-2 mb-4 text-[7.5pt] italic leading-relaxed">
          I hereby certify that the document described herein has been duly received and
          registered in accordance with existing office procedures and guidelines.
          The foregoing information is true and correct to the best of my knowledge and belief.
        </div>

        {/* ── SIGNATORIES ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 text-[8.5pt] mt-1">
          <SignatoryBox
            title="Received By"
            /* TODO: replace with actual receiving officer name */
            nameLine={data.receivingOfficer ?? "________________________"}
            subLine="Signature over Printed Name"
            roleLabel="Receiving Officer"
          />
          <SignatoryBox
            title="Reviewed By"
            nameLine="________________________"
            subLine="Signature over Printed Name"
            roleLabel="Section Head"
          />
          <SignatoryBox
            title="Approved By"
            /* TODO: replace with actual approving officer name */
            nameLine={data.approvingOfficer ?? "________________________"}
            subLine="Signature over Printed Name"
            roleLabel="Municipal Treasurer"
            boldRole
          />
        </div>

        {/* ── DOCUMENT FOOTER ──────────────────────────────────────────────── */}
        <div className="mt-4 border-t border-black pt-1 text-center text-[7pt] text-gray-500">
          {/* TODO: update office name */}
          Office of the Municipal Treasurer · Sta. Rita, Samar &nbsp;·&nbsp;
          <strong>{data.refNumber}</strong> &nbsp;·&nbsp;
          Printed: {fmt.printedOn()}
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      className="bg-black text-white text-[7.5pt] font-bold uppercase tracking-widest px-2 py-0.5 mt-2"
      dangerouslySetInnerHTML={{ __html: label }}
    />
  );
}

function Cell({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="px-2 py-1.5">
      <p className="text-[6.5pt] font-bold text-gray-500 uppercase tracking-wider leading-none mb-0.5">
        {label}
      </p>
      <p className={`text-[9.5pt] font-semibold leading-snug ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function SignatoryBox({
  title,
  nameLine,
  subLine,
  roleLabel,
  boldRole = false,
}: {
  title: string;
  nameLine: string;
  subLine: string;
  roleLabel: string;
  boldRole?: boolean;
}) {
  return (
    <div className="border border-black p-2 text-center">
      <p className="text-[7.5pt] font-bold uppercase tracking-wide mb-5">{title}</p>
      <div className="border-t border-black pt-1 mt-2">
        <p className="text-[8.5pt] font-semibold truncate">{nameLine}</p>
        <p className="text-[7pt] text-gray-600 mt-0.5">{subLine}</p>
        <p className={`text-[7.5pt] mt-0.5 ${boldRole ? "font-bold" : "italic"}`}>
          {roleLabel}
        </p>
        <p className="text-[7.5pt] mt-2">Date: ____________________</p>
      </div>
    </div>
  );
}
