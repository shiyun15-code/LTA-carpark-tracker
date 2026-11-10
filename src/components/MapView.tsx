import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { SingaporeCarpark, AreaFilterOption } from '../types/carpark';
import { SINGAPORE_AREAS } from '../services/carparkData';
import { Navigation, MapPin, Zap, ExternalLink, Filter, Layers } from 'lucide-react';

interface MapViewProps {
  carparks: SingaporeCarpark[];
  selectedCarpark: SingaporeCarpark | null;
  onSelectCarpark: (carpark: SingaporeCarpark) => void;
  onOpenCalculator: (carpark: SingaporeCarpark) => void;
  isDark: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  onOpenCalculator,
  isDark,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'abundant' | 'critical' | 'ev'>('all');

  // Filter carparks for map
  const filteredCarparks = carparks.filter((c) => {
    if (activeFilter === 'abundant') return c.status === 'Abundant';
    if (activeFilter === 'critical') return c.status === 'Critical' || c.status === 'Full';
    if (activeFilter === 'ev') return c.evCharging !== null && c.evCharging.available > 0;
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [1.325, 103.835],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      // CartoDB Positron (light) or CartoDB Dark Matter (dark)
      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    filteredCarparks.forEach((carpark) => {
      // Determine marker color
      let badgeBg = '#10b981'; // emerald-500
      let textColor = '#ffffff';

      if (carpark.status === 'Critical' || carpark.status === 'Full') {
        badgeBg = '#ef4444'; // red-500
      } else if (carpark.status === 'Moderate') {
        badgeBg = '#f59e0b'; // amber-500
      }

      if (activeFilter === 'ev' && carpark.evCharging) {
        badgeBg = '#0284c7'; // sky-600
      }

      const isSelected = selectedCarpark?.id === carpark.id;

      // Custom HTML Marker showing live lot count
      const customIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: ${badgeBg};
            color: ${textColor};
            font-weight: 700;
            font-size: 11px;
            font-family: 'JetBrains Mono', monospace;
            padding: 2px 7px;
            border-radius: 9999px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
            border: 2px solid ${isSelected ? '#1e293b' : '#ffffff'};
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: transform 0.15s ease-in-out;
            white-space: nowrap;
            cursor: pointer;
          ">
            <span>${carpark.availableLots}</span>
            ${carpark.evCharging && carpark.evCharging.available > 0 ? `<span style="margin-left: 3px; font-size: 9px;">⚡</span>` : ''}
          </div>
        `,
        iconSize: [40, 24],
        iconAnchor: [20, 12],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([carpark.coordinates.lat, carpark.coordinates.lng], {
        icon: customIcon,
      });

      // Bind custom popup
      const popupHtml = `
        <div style="padding: 14px; min-width: 240px; max-width: 280px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">
            ${carpark.area} · ${carpark.agency}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; line-height: 1.25;">
            ${carpark.name}
          </div>
          <div style="font-size: 12px; color: #475569; margin-bottom: 10px;">
            ${carpark.address}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 8px 10px; background-color: #f1f5f9; border-radius: 6px; margin-bottom: 10px;">
            <div>
              <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Available Lots</div>
              <div style="font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: ${
                carpark.status === 'Critical' ? '#dc2626' : carpark.status === 'Moderate' ? '#d97706' : '#16a34a'
              };">
                ${carpark.availableLots} <span style="font-size: 11px; font-weight: 400; color: #64748b;">/ ${carpark.totalLots}</span>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Height Limit</div>
              <div style="font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: #334155;">
                ${carpark.gantryHeightLimit}m
              </div>
            </div>
          </div>

          <div style="font-size: 11px; color: #334155; margin-bottom: 10px; padding: 4px 0; border-top: 1px dashed #e2e8f0; border-bottom: 1px dashed #e2e8f0;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Rate:</span>
              <span style="font-weight: 600;">$${carpark.rates.ratePerHalfHour.toFixed(2)}/30m</span>
            </div>
            ${carpark.evCharging ? `
              <div style="display: flex; justify-content: space-between; margin-top: 2px;">
                <span style="color: #64748b;">EV Charging:</span>
                <span style="font-weight: 600; color: #0284c7;">${carpark.evCharging.available}/${carpark.evCharging.total} bays free</span>
              </div>
            ` : ''}
          </div>

          <div style="display: flex; gap: 6px;">
            <button id="popup-btn-${carpark.id}" style="
              flex: 1;
              background-color: #0f172a;
              color: white;
              font-size: 11px;
              font-weight: 600;
              padding: 6px 10px;
              border-radius: 6px;
              border: none;
              cursor: pointer;
            ">
              View Details
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}" 
               target="_blank" 
               rel="noopener noreferrer"
               style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 6px 10px;
                background-color: #e2e8f0;
                color: #0f172a;
                border-radius: 6px;
                text-decoration: none;
                font-size: 11px;
                font-weight: 600;
              ">
              Directions
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectCarpark(carpark);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${carpark.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectCarpark(carpark);
          };
        }
      });

      marker.addTo(markersGroupRef.current!);
    });
  }, [filteredCarparks, selectedCarpark, activeFilter, onSelectCarpark]);

  // Center on selected carpark if triggered from outside
  useEffect(() => {
    if (selectedCarpark && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedCarpark.coordinates.lat, selectedCarpark.coordinates.lng],
        16,
        { duration: 0.8 }
      );
    }
  }, [selectedCarpark]);

  // Jump to Singapore Area
  const handleAreaSelect = (area: AreaFilterOption) => {
    setSelectedAreaId(area.id);
    if (mapInstanceRef.current && area.coordinates && area.zoom) {
      mapInstanceRef.current.flyTo([area.coordinates.lat, area.coordinates.lng], area.zoom, {
        duration: 0.8,
      });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[500px] flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Map Control Bar - Area Quick Jumps & Availability Toggles */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Quick Area Jump Selector */}
        <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto max-w-full">
          <div className="flex items-center gap-1 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Area:</span>
          </div>

          {SINGAPORE_AREAS.slice(0, 6).map((area) => (
            <button
              key={area.id}
              onClick={() => handleAreaSelect(area)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedAreaId === area.id
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {area.label}
            </button>
          ))}

          {/* Overflow select for more areas */}
          <select
            value={selectedAreaId}
            onChange={(e) => {
              const found = SINGAPORE_AREAS.find((a) => a.id === e.target.value);
              if (found) handleAreaSelect(found);
            }}
            className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
          >
            <option value="more" disabled>More Areas...</option>
            {SINGAPORE_AREAS.slice(6).map((area) => (
              <option key={area.id} value={area.id}>
                {area.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Badges on Map */}
        <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 flex items-center gap-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-700 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({carparks.length})
          </button>

          <button
            onClick={() => setActiveFilter('abundant')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'abundant'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Lots &gt;30%</span>
          </button>

          <button
            onClick={() => setActiveFilter('critical')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'critical'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Filling Fast</span>
          </button>

          <button
            onClick={() => setActiveFilter('ev')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'ev'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>EV Chargers</span>
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-6 left-4 z-20 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
        <div className="font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Lot Availability Legend</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>&gt;30% Lots</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>10-30% Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>&lt;10% Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sky-500 font-bold">⚡</span>
            <span>EV Charging</span>
          </div>
        </div>
      </div>

      {/* The Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
};
