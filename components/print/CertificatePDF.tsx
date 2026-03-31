'use client';

import React from 'react';
import { format } from 'date-fns';

interface CertificateProps {
  taxpayerName: string;
  tin: string;
  ownerAddress: string;
  certType: string;
  purpose: string;
  relatedTd?: string;
  remarks?: string;
  orNumber: string;
  amountPaid: string;
  paymentDate?: Date;
}

export function CertificatePDF({
  taxpayerName,
  tin,
  ownerAddress,
  certType,
  purpose,
  relatedTd,
  remarks,
  orNumber,
  amountPaid,
  paymentDate,
}: CertificateProps) {
  const dateStr = format(new Date(), 'MMMM dd, yyyy');
  const formattedPaymentDate = paymentDate ? format(paymentDate, 'MMMM dd, yyyy') : 'N/A';

  const getCertTitle = (type: string) => {
    switch (type) {
      case 'tax-clearance':
        return 'Tax Clearance';
      case 'no-improvement':
        return 'Certificate of No Improvement';
      case 'property-holdings':
        return 'Certificate of Property Holdings';
      case 'ctc-td':
        return 'Certified True Copy of Tax Declaration';
      case 'non-delinquency':
        return 'Certificate of Non-Delinquency';
      default:
        return 'Certification';
    }
  };

  const PRINT_CSS = `
    @media print {
      @page { 
        size: A4 portrait; 
        margin: 20mm; 
      }
      body { visibility: hidden !important; }
      #certificate-print-root,
      #certificate-print-root * { visibility: visible !important; }
      #certificate-print-root {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
      }
    }
  `;

  return (
    <>
      <style>{PRINT_CSS}</style>
      <div
        id="certificate-print-root"
        className="mx-auto w-[210mm] min-h-[297mm] bg-white p-[20mm] text-black font-serif leading-relaxed"
      >
        {/* HEADER */}
        <div className="text-center mb-12 border-b-2 border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Republic of the Philippines</p>
          <p className="text-sm font-semibold text-slate-800">Province of Samar</p>
          <p className="text-sm font-semibold text-slate-800 uppercase">Municipality of Sta. Rita</p>
          <div className="mt-4 inline-block border-y-2 border-slate-900 py-1 px-4">
            <p className="text-base font-bold uppercase tracking-widest text-slate-900">Office of the Municipal Treasurer</p>
          </div>
        </div>

        {/* TITLE */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-black uppercase tracking-[0.1em] underline decoration-2 underline-offset-8">
            {getCertTitle(certType)}
          </h1>
        </div>

        {/* BODY */}
        <div className="space-y-6 text-base text-slate-900">
          <p className="font-bold mb-8">TO WHOM IT MAY CONCERN:</p>

          <p className="indent-12 text-justify">
            THIS IS TO CERTIFY that <span className="font-bold underline decoration-1 decoration-slate-400">{taxpayerName || '____________________'}</span>, 
            with Tax Identification Number (TIN) <span className="font-bold underline decoration-1 decoration-slate-400">{tin || '____________________'}</span> and 
            residing at <span className="font-bold underline decoration-1 decoration-slate-400">{ownerAddress || '____________________'}</span>, 
            has requested for this certification from this office.
          </p>

          {relatedTd && (
            <p className="indent-12 text-justify">
              This certification is specifically issued for the property covered by Tax Declaration No. 
              <span className="font-bold"> {relatedTd}</span>.
            </p>
          )}

          <p className="indent-12 text-justify">
            This certification is issued upon the request of the above-named party for 
            <span className="font-bold underline decoration-1 decoration-slate-400"> {purpose || 'record purposes'}</span>.
          </p>

          {remarks && (
            <div className="mt-8 p-4 bg-slate-50 border-l-4 border-slate-300 italic">
              <p className="font-bold not-italic mb-1 text-xs uppercase tracking-wider text-slate-500">Additional Remarks:</p>
              <p className="text-sm">{remarks}</p>
            </div>
          )}

          <p className="pt-8">
            Issued this <span className="font-bold">{dateStr}</span> at Sta. Rita, Samar, Philippines.
          </p>
        </div>

        {/* SIGNATURE */}
        <div className="mt-24 flex justify-end">
          <div className="w-64 text-center">
            <div className="border-t-2 border-slate-900 pt-2">
              <p className="text-base font-bold uppercase">NAME OF TREASURER</p>
              <p className="text-xs italic text-slate-600">Municipal Treasurer</p>
            </div>
          </div>
        </div>

        {/* PAYMENT INFO - FOOTER */}
        <div className="mt-auto pt-20 border-t border-slate-100 flex justify-between text-[10px] text-slate-400 uppercase tracking-widest">
          <div className="space-y-1">
            <p>O.R. No.: <span className="text-slate-600 font-bold">{orNumber || '__________'}</span></p>
            <p>Amount Paid: <span className="text-slate-600 font-bold">PHP {amountPaid || '0.00'}</span></p>
            <p>Date Paid: <span className="text-slate-600 font-bold">{formattedPaymentDate}</span></p>
          </div>
          <div className="text-right self-end">
            <p>LGU STA. RITA, SAMAR · RPTA SYSTEM</p>
          </div>
        </div>
      </div>
    </>
  );
}
