'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/Button';
import { formatRupee, getItemImage, getCategoryFallbackImage } from '@/lib/format';
import { Navigation, Crosshair } from 'lucide-react';
import { useTheme } from 'next-themes';

interface InteractiveMapProps {
  items: any[];
  onOpenRequest: (item: any) => void;
  radiusKm: number;
}

// Fallback location if geolocation is denied (Default to a central location, e.g. London or user's preference)
const DEFAULT_CENTER: [number, number] = [51.505, -0.09]; 

// Helper to generate consistent demo coordinates
const generateDemoCoords = (itemId: string, distanceKm: number, center: [number, number]) => {
  // Use a simple hash of the ID to get a deterministic angle
  let hash = 0;
  for (let i = 0; i < itemId.length; i++) {
    hash = itemId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Seed a pseudo-random angle (0 to 360)
  const angle = Math.abs(hash) % 360 * (Math.PI / 180);
  
  // 1 degree of latitude is ~111km
  const latOffset = (distanceKm * Math.cos(angle)) / 111.32;
  const lngOffset = (distanceKm * Math.sin(angle)) / (111.32 * Math.cos(center[0] * (Math.PI / 180)));

  return [center[0] + latOffset, center[1] + lngOffset] as [number, number];
};

// SVG icons mapping
const getIconSvg = (category: string) => {
  const colors = {
    TOOLS: '#4ade80',     // Green
    ELECTRONICS: '#3b82f6', // Blue
    BOOKS: '#facc15',     // Yellow
    FURNITURE: '#f97316', // Orange
    VEHICLES: '#a855f7',  // Purple
    SPORTS: '#ec4899',    // Pink
    DEFAULT: '#94a3b8'    // Slate
  };
  
  const color = colors[category as keyof typeof colors] || colors.DEFAULT;

  return `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `;
};

const createCustomIcon = (category: string) => {
  return L.divIcon({
    html: `<div class="w-10 h-10 bg-white rounded-full shadow-lg border-2 border-white flex items-center justify-center transform transition-transform hover:scale-110 hover:z-50">${getIconSvg(category)}</div>`,
    className: 'custom-leaflet-icon bg-transparent',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Component to handle map re-centering and radar animation
const MapController = ({ center, radiusKm }: { center: [number, number], radiusKm: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5, easeLinearity: 0.25 });
  }, [center, map]);

  return (
    <>
      <Circle 
        center={center} 
        radius={radiusKm * 1000} 
        pathOptions={{ 
          color: '#A8C93B', 
          fillColor: '#A8C93B', 
          fillOpacity: 0.05,
          weight: 1,
          dashArray: '4, 4'
        }} 
      />
      {/* Radar Sweep Effect center dot */}
      <Circle 
        center={center} 
        radius={50} 
        pathOptions={{ color: '#A8C93B', fillColor: '#A8C93B', fillOpacity: 0.8 }} 
      />
    </>
  );
};

export default function InteractiveMap({ items, onOpenRequest, radiusKm }: InteractiveMapProps) {
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const { theme } = useTheme();
  
  // Memoize generated coordinates so they don't change on re-render
  const coordsMap = useRef<Map<string, [number, number]>>(new Map());

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          setLocationDenied(false);
        },
        (error) => {
          console.warn("Geolocation denied or failed:", error);
          setCenter(DEFAULT_CENTER);
          setLocationDenied(true);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setCenter(DEFAULT_CENTER);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const mapItems = useMemo(() => {
    if (!center) return [];
    
    return items.map(item => {
      let latlng: [number, number];
      if (item.latitude && item.longitude) {
        latlng = [item.latitude, item.longitude];
      } else {
        if (!coordsMap.current.has(item.id)) {
          coordsMap.current.set(item.id, generateDemoCoords(item.id, item.distanceKm || (Math.random() * radiusKm), center));
        }
        latlng = coordsMap.current.get(item.id)!;
      }
      return { ...item, latlng };
    });
  }, [items, center, radiusKm]);

  if (!center) {
    return (
      <div className="w-full h-[600px] bg-ink/5 rounded-3xl flex items-center justify-center border border-ink/10">
        <div className="flex flex-col items-center text-slate">
          <Navigation className="w-8 h-8 animate-bounce mb-2 text-moss" />
          <p className="font-display font-medium">Acquiring GPS Signal...</p>
        </div>
      </div>
    );
  }

  // Dark mode tile layer (CartoDB Dark Matter) vs Light mode (CartoDB Positron)
  const tileUrl = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-lg border border-ink/10 z-0 bg-[#e5e7eb] dark:bg-[#1a1a1a]">
      
      {locationDenied && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-ink text-paper px-4 py-2 rounded-full text-xs font-display shadow-xl flex items-center gap-2">
          <span>Location access denied. Showing demo area.</span>
          <button onClick={getUserLocation} className="text-marigold underline font-bold">Retry</button>
        </div>
      )}

      <button 
        onClick={getUserLocation}
        className="absolute bottom-6 right-6 z-[1000] bg-white text-ink p-3 rounded-full shadow-xl hover:bg-slate-50 transition-colors border border-slate-200"
        title="Locate Me"
      >
        <Crosshair className="w-6 h-6 text-moss" />
      </button>

      {/* Embedded CSS for custom styling to ensure premium feel */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .leaflet-popup-content {
          margin: 0;
          width: 280px !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
        .cluster-icon {
          background-color: rgba(168, 201, 59, 0.9); /* moss */
          color: white;
          border-radius: 50%;
          font-weight: bold;
          border: 3px solid white;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* Radar Sweep Animation */
        .radar-sweep {
          position: absolute;
          top: 50%; left: 50%;
          width: 200px; height: 200px;
          margin: -100px 0 0 -100px;
          border-radius: 50%;
          border: 2px solid rgba(168, 201, 59, 0.5);
          animation: radar 3s infinite linear;
          pointer-events: none;
          z-index: 400;
        }
        @keyframes radar {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}} />

      <div className="radar-sweep" />

      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url={tileUrl}
        />
        
        <MapController center={center} radiusKm={radiusKm} />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster: any) => {
            return L.divIcon({
              html: `<div class="cluster-icon w-10 h-10 flex items-center justify-center"><span>${cluster.getChildCount()}</span></div>`,
              className: 'custom-cluster bg-transparent',
              iconSize: [40, 40]
            });
          }}
        >
          {mapItems.map((item) => (
            <Marker 
              key={item.id} 
              position={item.latlng}
              icon={createCustomIcon(item.category)}
            >
              <Popup closeButton={false}>
                <div className="flex flex-col bg-white text-ink">
                  {/* Image Header */}
                  <div className="h-32 w-full bg-slate-100 relative">
                    <img 
                      src={getItemImage(item)} 
                      alt={item.name} 
                      onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(item?.category, item?.name); }}
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2 right-2 bg-moss text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      {item.distanceKm} km
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-display font-bold text-base leading-tight truncate">{item.name}</h3>
                      <div className="flex items-center justify-between mt-1 text-xs text-slate">
                        <span>{item.category}</span>
                        <span className="text-amber-500 font-bold">★ {item.owner?.averageRating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 border-y border-slate-100 py-2">
                      <div>
                        <span className="text-[9px] uppercase text-slate block">Daily Rate</span>
                        <span className="font-bold text-moss">{formatRupee(item.pricePerDay)}</span>
                      </div>
                      {item.marketPrice && (
                        <div>
                          <span className="text-[9px] uppercase text-slate block">Value</span>
                          <span className="font-bold text-ink">{formatRupee(item.marketPrice)}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="primary" 
                      className="w-full text-xs h-8"
                      onClick={(e) => {
                         // Leaflet popup context might need stopPropagation depending on setup
                         e.stopPropagation(); 
                         onOpenRequest(item);
                      }}
                    >
                      Request to Owner
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
