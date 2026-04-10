"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When pathname changes, start the loader
    setLoading(true);
    setProgress(30);

    const timer = setTimeout(() => {
      setProgress(100);
      const timer2 = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer2);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 pointer-events-none">
      <div
        className="h-full bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div className="absolute right-0 h-full w-[100px] bg-white/20 blur-xs -translate-y-full" />
    </div>
  );
}
