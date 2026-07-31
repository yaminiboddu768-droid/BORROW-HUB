'use client';

import React, { useState } from 'react';
import { NeighbourhoodItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Navigation } from 'lucide-react';

interface RadarVisualProps {
  items: NeighbourhoodItem[];
  radiusKm: number;
  onSelectItem?: (item: NeighbourhoodItem) => void;
}

export const RadarVisual: React.FC<RadarVisualProps> = ({
  items,
  radiusKm,
  onSelectItem,
}) => {
  const [hoveredItem, setHoveredItem] = useState<NeighbourhoodItem | null>(null);

  // Maximum radar display range in km
  const maxRadarKm = 5.0;

  // Calculate position (angle and radius % from center) deterministically based on item id & distance
  const getItemCoords = (item: NeighbourhoodItem, index: number) => {
    // Spread items in a circle around center
    const angle = (index * (360 / Math.max(items.length, 1)) + 45) * (Math.PI / 180);
    // Normalized distance ratio from center (0 = center, 1 = maxRadarKm)
    const normDist = Math.min(item.distanceKm / maxRadarKm, 0.95);
    // Percentage radius from center (0% to 42% max boundary)
    const radiusPct = normDist * 40;

    const x = 50 + radiusPct * Math.cos(angle);
    const y = 50 + radiusPct * Math.sin(angle);

    const isInRange = item.distanceKm <= radiusKm;

    return { x, y, isInRange };
  };

  const inRangeCount = items.filter((i) => i.distanceKm <= radiusKm).length;

  return (
    <div className="bg-ink text-paper p-6 rounded-3xl border-2 border-moss/40 shadow-xl space-y-4 relative overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-paper/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-moss animate-pulse" />
          <h3 className="font-display font-bold text-base text-paper">
            Neighbourhood Radar Tracker
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="moss" size="sm">
            {inRangeCount} items in {radiusKm}km range
          </Badge>
        </div>
      </div>

      {/* Radar Map Canvas */}
      <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-ink via-ink/95 to-[#131e21] rounded-2xl border border-paper/15 flex items-center justify-center overflow-hidden shadow-inner">
        {/* Radar Sweeping Animation Beam */}
        <div className="absolute w-[300px] h-[300px] rounded-full border border-moss/10 pointer-events-none" />
        
        {/* Ring 1 (1 km) */}
        <div
          className={`absolute rounded-full border transition-all duration-300 pointer-events-none ${
            radiusKm >= 1.0 ? 'border-moss/50 bg-moss/5' : 'border-paper/10'
          }`}
          style={{ width: `${(1.0 / maxRadarKm) * 80}%`, height: `${(1.0 / maxRadarKm) * 80}%` }}
        >
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-data text-paper/40">1 km</span>
        </div>

        {/* Ring 2 (2.5 km) */}
        <div
          className={`absolute rounded-full border transition-all duration-300 pointer-events-none ${
            radiusKm >= 2.5 ? 'border-moss/40 bg-moss/5' : 'border-paper/10'
          }`}
          style={{ width: `${(2.5 / maxRadarKm) * 80}%`, height: `${(2.5 / maxRadarKm) * 80}%` }}
        >
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-data text-paper/40">2.5 km</span>
        </div>

        {/* Ring 3 (5 km Max Boundary) */}
        <div
          className={`absolute rounded-full border transition-all duration-300 pointer-events-none ${
            radiusKm >= 5.0 ? 'border-moss/30 bg-moss/5' : 'border-paper/10'
          }`}
          style={{ width: `80%`, height: `80%` }}
        >
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-data text-paper/40">5.0 km</span>
        </div>

        {/* Radar Axis Crosshairs */}
        <div className="absolute w-full h-[1px] bg-paper/10 pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-paper/10 pointer-events-none" />

        {/* Radar Center Pin */}
        <div className="absolute z-20 w-7 h-7 rounded-full bg-marigold text-ink flex items-center justify-center font-bold font-data text-xs shadow-lg ring-4 ring-marigold/30">
          You
        </div>

        {/* Radar Item Dots */}
        {items.map((item, index) => {
          const { x, y, isInRange } = getItemCoords(item, index);
          const isHovered = hoveredItem?.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem?.(item)}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div
                className={`relative rounded-full transition-all duration-300 ${
                  isInRange
                    ? isHovered
                      ? 'w-5 h-5 bg-marigold shadow-lg ring-4 ring-marigold/40 scale-125'
                      : 'w-4 h-4 bg-moss shadow-md ring-2 ring-moss/50'
                    : 'w-3 h-3 bg-slate/40 border border-paper/30 opacity-50'
                }`}
              />

              {/* Hover Tooltip Popup */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-paper text-ink p-2.5 rounded-xl shadow-xl border border-ink/20 z-50 pointer-events-none animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between text-xs font-bold font-display">
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] font-data text-slate">
                    <span className="text-moss font-semibold">${item.pricePerDay}/day</span>
                    <span>{item.distanceKm} km away</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-paper/70 font-data border-t border-paper/10 pt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-moss inline-block" />
            <span>In range ({radiusKm}km)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate/40 inline-block" />
            <span>Out of range</span>
          </div>
        </div>
        <span>Hover dots to inspect</span>
      </div>
    </div>
  );
};
