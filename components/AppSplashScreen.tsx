"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function AppSplashScreen() {
  const [taxCollecting, setTaxCollecting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTaxCollecting(true);
    }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-9999 flex min-h-dvh items-center justify-center overflow-hidden bg-linear-to-b from-sky-950 via-cyan-900 to-teal-900 px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-84 w-84 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-120 w-120 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <div className="relative flex items-center justify-center">
          <div
            className={`absolute h-56 w-56 rounded-full blur-2xl transition-all duration-1000 ${
              taxCollecting ? "bg-emerald-300/20" : "bg-teal-400/20"
            }`}
          />

          <div className="logo-wrap relative h-20 w-20 sm:h-28 sm:w-28">
            <Image
              src="/img/sta.rita_logo.png"
              alt="Municipality of Sta. Rita logo"
              fill
              priority
              sizes="(max-width:640px) 80px,112px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="relative mt-1 mb-6 flex flex-col items-center" aria-hidden="true">
          {/* Animated Coins */}
          <div className="relative mt-4 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={`coin-${i}`}
                className={`animate-coin-stack h-6 w-6 rounded-full border-2 ${
                  taxCollecting 
                    ? "border-yellow-400/80 bg-yellow-300/30" 
                    : "border-slate-400/50 bg-slate-300/20"
                }`}
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  transform: `translateY(-${i * 2}px)`
                }}
              >
                <span className="flex h-full items-center justify-center text-[10px] font-bold text-yellow-200">
                  ₱
                </span>
              </div>
            ))}
          </div>

          {/* Tax Document Icon */}
          <svg width="48" height="48" viewBox="0 0 48 48" className="mt-2">
            <rect
              x="8"
              y="4"
              width="32"
              height="36"
              rx="4"
              fill={taxCollecting ? "rgba(16,185,129,0.15)" : "rgba(148,163,184,0.12)"}
              stroke={taxCollecting ? "#10b981" : "rgba(148,163,184,0.45)"}
              strokeWidth="1.5"
              className="transition-all duration-700"
            />
            {/* Document Lines */}
            <line
              x1="16"
              y1="14"
              x2="32"
              y2="14"
              stroke={taxCollecting ? "#10b981" : "rgba(148,163,184,0.45)"}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="16"
              y1="22"
              x2="32"
              y2="22"
              stroke={taxCollecting ? "#10b981" : "rgba(148,163,184,0.45)"}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="16"
              y1="30"
              x2="26"
              y2="30"
              stroke={taxCollecting ? "#10b981" : "rgba(148,163,184,0.45)"}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Tax Stamp */}
            {taxCollecting && (
              <circle
                cx="34"
                cy="28"
                r="6"
                fill="rgba(245,158,11,0.2)"
                stroke="#f59e0b"
                strokeWidth="1.5"
                className="animate-pulse"
              />
            )}
          </svg>
        </div>

        <p className="font-inter text-xs uppercase tracking-[0.22em] text-emerald-200/70">
          Municipality of Sta. Rita, Samar
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-100">
          Real Property Tax Monitoring System
        </h1>
        <p
          className={`font-inter mt-2 text-sm italic transition-colors duration-700 ${
            taxCollecting ? "text-emerald-200/80" : "text-teal-100/70"
          }`}
        >
          Efficient Tax Collection • Transparent Governance • Community Development
        </p>
      </div>

      <div className="font-inter absolute bottom-8 text-xs text-emerald-200/55">
        Sta. Rita LGU • Real Property Tax System v1.0
      </div>

      <style jsx>{`
        .logo-wrap {
          animation: logo-float 2.8s ease-in-out infinite;
        }

        @keyframes logo-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }

        @keyframes coin-stack {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-15px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.8;
          }
        }

        .animate-coin-stack {
          animation: coin-stack 1.5s ease-in-out infinite;
        }

        @keyframes document-wave {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        .animate-document-wave {
          animation: document-wave 2s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .logo-wrap {
            height: 5rem;
            width: 5rem;
          }
        }
      `}</style>
    </div>
  );
}