'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { BarangayPerformance, STA_RITA_BARANGAY_DATA } from '@/components/BarangayPerformanceData';

const lats = STA_RITA_BARANGAY_DATA.map(b => b.coordinates[0]);
const lngs = STA_RITA_BARANGAY_DATA.map(b => b.coordinates[1]);
const MAP_BOUNDS: [[number, number], [number, number]] = [
  [Math.min(...lats) - 0.01, Math.min(...lngs) - 0.01],
  [Math.max(...lats) + 0.01, Math.max(...lngs) + 0.01]
];

function getPerformanceColor(rate: number): string {
  if (rate >= 80) return '#10b981'; // Emerald-500
  if (rate >= 70) return '#f59e0b'; // Amber-500
  return '#ef4444'; // Red-500
}

function MapRecenter({ coords, bounds }: { coords?: [number, number]; bounds?: [[number, number], [number, number]] }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 14, { animate: true });
    } else if (bounds) {
      map.fitBounds(bounds, { animate: true, padding: [20, 20] });
    }
  }, [coords, bounds, map]);
  return null;
}

interface MapProps {
  onSelectBarangay: (b: BarangayPerformance | null) => void;
  selectedBarangay: BarangayPerformance | null;
  filterTier: 'All' | 'High' | 'Average' | 'At Risk';
}

export default function BarangayPerformanceMap({ onSelectBarangay, selectedBarangay, filterTier }: MapProps) {
  const filteredData = STA_RITA_BARANGAY_DATA.filter(b => {
    if (filterTier === 'All') return true;
    if (filterTier === 'High') return b.collectionRate >= 80;
    if (filterTier === 'Average') return b.collectionRate >= 70 && b.collectionRate < 80;
    if (filterTier === 'At Risk') return b.collectionRate < 70;
    return true;
  });

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner bg-slate-50">
      <MapContainer bounds={MAP_BOUNDS} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter 
          coords={selectedBarangay?.coordinates} 
          bounds={!selectedBarangay ? MAP_BOUNDS : undefined} 
        />

        {filteredData.map((barangay) => {
          const isSelected = selectedBarangay?.name === barangay.name;
          const color = getPerformanceColor(barangay.collectionRate);

          return (
            <CircleMarker
              key={barangay.name}
              center={barangay.coordinates}
              radius={isSelected ? 14 : 10}
              pathOptions={{ 
                color: isSelected ? '#00154A' : color, 
                fillColor: color, 
                fillOpacity: isSelected ? 0.9 : 0.65, 
                weight: isSelected ? 3 : 2 
              }}
              eventHandlers={{
                click: () => onSelectBarangay(barangay),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={isSelected}>
                <span className="font-inter text-[10px] font-bold uppercase tracking-tight">{barangay.name}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}