'use client';

import React from 'react';

export interface ReportRow {
  [key: string]: string | number | null | undefined;
}

interface Props {
  data: {
    title: string;
    subtitle: string;
    rows: ReportRow[];
  };
  type: string;
}

const fmt = {
  currency: (v: any) => 
    typeof v === 'number' 
      ? v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : v || '—',
  number: (v: any) =>
    typeof v === 'number'
      ? v.toLocaleString('en-PH')
      : v || '—',
};

export function GeneralReportPrint({ data, type }: Props) {
  const isLandscape = type === 'assessment-roll' || type === 'delinquency-report';

  const PRINT_CSS = `
    @media print {
      @page { 
        size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'}; 
        margin: 10mm; 
      }
      body { visibility: hidden !important; }
      #report-print-root,
      #report-print-root * { visibility: visible !important; }
      #report-print-root {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
      }
    }
  `;

  // Define columns based on report type
  let columns: { header: string; key: string; align?: 'left' | 'right' | 'center' }[] = [];

  if (type === 'assessment-roll') {
    columns = [
      { header: 'TD Number', key: 'td' },
      { header: 'PIN', key: 'pin' },
      { header: 'Owner Name', key: 'owner' },
      { header: 'Class', key: 'class', align: 'center' },
      { header: 'Area (sqm)', key: 'area', align: 'right' },
      { header: 'Market Value', key: 'market', align: 'right' },
      { header: 'Assessed Value', key: 'assessed', align: 'right' },
    ];
  } else if (type === 'summary-list') {
    columns = [
      { header: 'Classification', key: 'class' },
      { header: 'TD Number', key: 'td' },
      { header: 'Owner Name', key: 'owner' },
      { header: 'Market Value', key: 'market', align: 'right' },
      { header: 'Assessed Value', key: 'assessed', align: 'right' },
    ];
  } else if (type === 'barangay-summary') {
    columns = [
      { header: 'Barangay', key: 'barangay' },
      { header: 'Property Count', key: 'count', align: 'center' },
      { header: 'Total Market Value', key: 'market', align: 'right' },
      { header: 'Total Assessed Value', key: 'assessed', align: 'right' },
    ];
  } else if (type === 'delinquency-report') {
    columns = [
      { header: 'TD Number', key: 'td' },
      { header: 'Owner Name', key: 'owner' },
      { header: 'Barangay', key: 'barangay' },
      { header: 'Market Value', key: 'market', align: 'right' },
      { header: 'Assessed Value', key: 'assessed', align: 'right' },
      { header: 'Total Due (₱)', key: 'due', align: 'right' },
    ];
  }

  // Calculate totals for numerical columns
  const totals: Record<string, number> = {};
  columns.forEach(col => {
    if (col.align === 'right' || col.key === 'count') {
      totals[col.key] = data.rows.reduce((sum, row) => sum + (Number(row[col.key]) || 0), 0);
    }
  });

  return (
    <>
      <style>{PRINT_CSS}</style>
      <div
        id="report-print-root"
        className={`mx-auto bg-white text-black p-8 font-serif ${isLandscape ? 'w-[297mm]' : 'w-[210mm]'}`}
      >
        {/* HEADER */}
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <p className="text-sm font-bold uppercase tracking-widest">Republic of the Philippines</p>
          <p className="text-base text-gray-800">Province of Samar — Municipality of Sta. Rita</p>
          <p className="text-sm font-bold uppercase mt-1">Office of the Municipal Assessor</p>
          <h1 className="text-2xl font-black uppercase tracking-widest mt-4 underline decoration-2 underline-offset-4">
            {data.title}
          </h1>
          <p className="text-xs italic mt-2 text-gray-600">{data.subtitle}</p>
        </div>

        {/* DATA TABLE */}
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-2 py-2 text-center w-10">#</th>
              {columns.map((col, idx) => (
                <th key={idx} className={`border border-black px-2 py-2 uppercase font-bold text-[10px] ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.length > 0 ? (
              data.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border border-black hover:bg-gray-50">
                  <td className="border border-black px-2 py-1.5 text-center text-gray-500">{rowIndex + 1}</td>
                  {columns.map((col, colIndex) => {
                    const val = row[col.key];
                    const isNumeric = col.align === 'right' || col.key === 'count';
                    return (
                      <td key={colIndex} className={`border border-black px-2 py-1.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                        {isNumeric ? (col.key === 'count' ? fmt.number(val) : fmt.currency(val)) : (val || '—')}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="border border-black px-4 py-8 text-center italic text-gray-400">
                  No records found for the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
          {data.rows.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 font-bold border-t-2 border-black">
                <td colSpan={1} className="border border-black px-2 py-2 text-center">TOTAL</td>
                {columns.map((col, idx) => (
                  <td key={idx} className={`border border-black px-2 py-2 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                    {totals[col.key] !== undefined 
                      ? (col.key === 'count' ? fmt.number(totals[col.key]) : `₱ ${fmt.currency(totals[col.key])}`) 
                      : ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>

        {/* FOOTER / SIGNATORIES */}
        <div className="mt-12 grid grid-cols-2 gap-20">
          <div className="text-center">
            <p className="text-xs mb-10 uppercase font-bold text-gray-600">Prepared By:</p>
            <div className="border-t border-black pt-1">
              <p className="text-sm font-bold uppercase">________________________</p>
              <p className="text-[10px] text-gray-500 mt-1 italic">Administrative Aide / Staff</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs mb-10 uppercase font-bold text-gray-600">Certified Correct:</p>
            <div className="border-t border-black pt-1">
              <p className="text-sm font-bold uppercase">________________________</p>
              <p className="text-[10px] text-gray-500 mt-1 italic font-bold">Municipal Assessor</p>
            </div>
          </div>
        </div>

        <div className="mt-20 text-[8px] text-gray-400 text-center uppercase tracking-widest border-t border-gray-100 pt-4">
          LGU Sta. Rita, Samar · Office of the Municipal Assessor · Printed on {new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}
        </div>
      </div>
    </>
  );
}
