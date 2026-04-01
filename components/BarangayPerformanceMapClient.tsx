"use client";

import dynamic from "next/dynamic";
import type { BarangayPerformance } from "@/components/BarangayPerformanceData";

const BarangayPerformanceMap = dynamic(
  () => import("@/components/BarangayPerformanceMap"),
  {
    ssr: false,
  },
);

interface MapClientProps {
  onSelectBarangay: (b: BarangayPerformance | null) => void;
  selectedBarangay: BarangayPerformance | null;
  filterTier: "All" | "High" | "Average" | "At Risk";
}

export default function BarangayPerformanceMapClient(props: MapClientProps) {
  return <BarangayPerformanceMap {...props} />;
}
