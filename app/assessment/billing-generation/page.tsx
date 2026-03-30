"use client";

import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  ArrowLeft,
  CalendarDays,
  CalendarIcon,
  FileText,
  Printer,
  Save,
  Search,
  Send,
  ShieldCheck,
  User,
  Wallet,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function BillingGenerationPage() {
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date('2026-03-31'));

  return (
    <div className='w-full'>
      <Link
        href='/assessment'
        className='font-lexend mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700'
      >
        <ArrowLeft className='h-4 w-4' />
        Back to Assessment & Billing
      </Link>

      <header className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='font-lexend text-2xl font-bold text-[#595a5d]'>Billing Generation</h1>
          <p className='font-inter mt-1 text-xs text-slate-400'>
            Treasurer Module - Generate billing statements and notices
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='cursor-pointer font-inter inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50'
          >
            <Printer className='h-4 w-4' />
            Print Preview
          </button>
          <button
            type='button'
            className='cursor-pointer font-inter inline-flex h-10 items-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800'
          >
            <Save className='h-4 w-4' />
            Save Draft Bill
          </button>
        </div>
      </header>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          <Section icon={<Search className='h-5 w-5 text-[#00154A]' />} title='Bill Lookup'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <InputField label='Taxpayer Name' value='Juan Dela Cruz' />
              <InputField label='Tax Declaration No.' value='TD-11-00382' />
              <InputField label='Taxpayer ID' value='TP-2026-0142' />
              <InputField label='Property PIN' value='088-01-001-01-001' />
            </div>
          </Section>

          <Section icon={<CalendarDays className='h-5 w-5 text-[#00154A]' />} title='Billing Details'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <InputField label='Billing Year' value='2026' />
              <InputField label='Quarter' value='1st' />
              <DueDateField value={dueDate} onChange={setDueDate} />
              <InputField label='Billing Reference No.' value='BILL-2026-000124' />
            </div>
          </Section>

          <Section icon={<Wallet className='h-5 w-5 text-[#00154A]' />} title='Amount Breakdown'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <InputField label='Basic Tax' value='20,000.00' />
              <InputField label='SEF Tax' value='10,000.00' />
              <InputField label='Discount' value='0.00' />
              <InputField label='Penalty' value='0.00' />
            </div>
            <div className='mt-6 rounded-md border border-gray-200 bg-gray-50 p-4'>
              <h3 className='font-inter mb-3 text-xs font-semibold uppercase tracking-wide text-[#595a5d]'>
                Computed Billing Total
              </h3>
              <div className='space-y-2'>
                <SummaryRow label='Subtotal' value='PHP 30,000.00' />
                <SummaryRow label='Adjustments' value='PHP 0.00' />
                <div className='border-t border-gray-200 pt-2'>
                  <SummaryRow label='Amount Due' value='PHP 30,000.00' bold />
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className='space-y-6'>
          <section className='rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm text-[#00154A]'>
            <Accordion type='multiple' className='w-full'>
              {/* Billing Summary */}
              <AccordionItem value='summary' className='border-b border-gray-100'>
                <AccordionTrigger className='cursor-pointer px-6 py-3 hover:no-underline'>
                  <div className='flex items-center gap-2.5 text-left'>
                    <div className='rounded-md bg-slate-100 p-1.5'>
                      <FileText className='h-4 w-4 text-[#00154A]' />
                    </div>
                    <div>
                      <h2 className='font-inter text-xs font-semibold text-[#595a5d]'>Billing Summary</h2>
                      <p className='font-inter text-[10px] text-slate-400'>Review statement details</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-6 pb-6 pt-0'>
                  <div className='space-y-3 pt-4 border-t border-slate-50'>
                    <SummaryRow label='Taxpayer' value='Juan Dela Cruz' />
                    <SummaryRow label='Property Class' value='Commercial' />
                    <SummaryRow label='Tax Year' value='2026' />
                    <SummaryRow label='Quarter' value='1st' />
                    <SummaryRow label='Reference No.' value='BILL-2026-000124' />
                    <SummaryRow label='Status' value='Draft' />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Generation Actions */}
              <AccordionItem value='actions' className='border-b border-gray-100'>
                <AccordionTrigger className='cursor-pointer px-6 py-3 hover:no-underline'>
                  <div className='flex items-center gap-2.5 text-left'>
                    <div className='rounded-md bg-slate-100 p-1.5'>
                      <ShieldCheck className='h-4 w-4 text-[#00154A]' />
                    </div>
                    <div>
                      <h2 className='font-inter text-xs font-semibold text-[#595a5d]'>Generation Actions</h2>
                      <p className='font-inter text-[10px] text-slate-400'>Output and delivery</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-6 pb-6 pt-0'>
                  <div className='space-y-2 pt-4 border-t border-slate-50'>
                    <button
                      type='button'
                      className='cursor-pointer font-inter inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800'
                    >
                      <FileText className='h-4 w-4' />
                      Generate Statement
                    </button>
                    <button
                      type='button'
                      className='cursor-pointer font-inter inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-gray-50'
                    >
                      <Send className='h-4 w-4' />
                      Send to Taxpayer
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Required Checks */}
              <AccordionItem value='checks' className='border-none'>
                <AccordionTrigger className='cursor-pointer px-6 py-3 hover:no-underline'>
                  <div className='flex items-center gap-2.5 text-left'>
                    <div className='rounded-md bg-slate-100 p-1.5'>
                      <User className='h-4 w-4 text-[#00154A]' />
                    </div>
                    <div>
                      <h2 className='font-inter text-xs font-semibold text-[#595a5d]'>Required Checks</h2>
                      <p className='font-inter text-[10px] text-slate-400'>Pre-release verification</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-6 pb-6 pt-0'>
                  <ul className='space-y-2 font-inter text-xs text-slate-500 pt-4 border-t border-slate-50'>
                    <li className='flex items-start gap-2'>
                      <span className='mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400' />
                      Assessment values are finalized
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400' />
                      Due date follows approved schedule
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400' />
                      Billing notice ready for release
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
      <div className='mb-4 flex items-center gap-2'>
        <div className='rounded-md bg-slate-100 p-2'>{icon}</div>
        <h2 className='font-inter text-sm font-semibold text-[#848794]'>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InputField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className='font-inter text-xs font-medium text-slate-600'>{label}</label>
      <div className='mt-1 flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-slate-200'>
        <input defaultValue={value} className='w-full bg-transparent font-inter text-sm text-slate-900 outline-none' />
      </div>
    </div>
  );
}

function DueDateField({ value, onChange }: { value?: Date; onChange: (date?: Date) => void }) {
  return (
    <div>
      <label className='font-inter text-xs font-medium text-slate-600'>Due Date</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            className='font-inter mt-1 h-10.5 w-full justify-start rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm font-normal text-slate-900 shadow-none hover:bg-gray-50 cursor-pointer'
          >
            <CalendarIcon className='mr-2 h-4 w-4 text-slate-400' />
            {<span className='text-slate-400'>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={value}
            onSelect={onChange}
            captionLayout='dropdown'
            fromYear={2020}
            toYear={2035}
            initialFocus
            className='rounded-lg border bg-white'
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className='flex items-center justify-between gap-4'>
      <span className='font-inter text-xs text-slate-500'>{label}</span>
      <span className={`font-inter text-xs ${bold ? 'font-bold text-[#595a5d]' : 'font-medium text-slate-900'}`}>
        {value}
      </span>
    </div>
  );
}
