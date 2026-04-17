"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ShieldQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegistryCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  variant?: 'primary' | 'secondary';
  onButtonClick?: () => void;
  href?: string;
  locked?: boolean;
}

export default function RegistryCard({ 
  icon: Icon, 
  title, 
  description, 
  buttonText, 
  variant = 'primary', 
  onButtonClick, 
  href,
  locked = false
}: RegistryCardProps) {
  const router = useRouter();

  const buttonClasses = cn(
    "font-inter w-full py-2 rounded text-[12px] font-medium transition-all active:scale-[0.98]",
    locked 
      ? "bg-blue-50 text-blue-500 border border-blue-200 hover:bg-blue-100 hover:text-blue-700 cursor-pointer" 
      : variant === 'primary' 
        ? "bg-[#0F172A] text-white hover:bg-slate-800 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
        : "bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  );

  return (
    <div className={cn(
      "relative group p-6 rounded-xl border transition-all duration-300 flex flex-col justify-between h-48 overflow-hidden",
      locked 
        ? "bg-slate-50/50 border-slate-200 opacity-80" 
        : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 hover:-translate-y-1"
    )}>
      {/* Background Decal for Locked State */}
      {locked && (
        <div className="absolute top-[-10%] right-[-5%] opacity-[0.03] select-none pointer-events-none">
          <Lock size={120} />
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <Icon className={cn(
            "transition-colors duration-300",
            locked ? "text-slate-300" : "text-[#00154A]"
          )} size={24} />
          {locked && (
            <div className="bg-slate-200/50 p-1 rounded-full">
              <Lock size={12} className="text-slate-400" />
            </div>
          )}
        </div>
        <h3 className={cn(
          "font-inter text-sm font-semibold transition-colors duration-300",
          locked ? "text-slate-400" : "text-[#595a5d]"
        )}>{title}</h3>
        <p className={cn(
          "font-inter text-[12px] mt-1 transition-colors duration-300 leading-snug",
          locked ? "text-slate-300 italic" : "text-[#848794]"
        )}>
          {locked ? "Access restricted to authorized personnel only." : description}
        </p>
      </div>

      <div className="relative z-10">
        {locked ? (
          <button onClick={() => router.push('/request_permission')} className={buttonClasses}>
            <span className="flex items-center justify-center gap-1.5">
              <ShieldQuestion size={13} />
              Request Access
            </span>
          </button>
        ) : href ? (
          <Link href={href} className={cn(buttonClasses, "inline-flex items-center justify-center")}>
            {buttonText}
          </Link>
        ) : (
          <button onClick={onButtonClick} className={buttonClasses}>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
} 