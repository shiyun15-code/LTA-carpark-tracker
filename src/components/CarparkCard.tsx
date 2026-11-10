import React from 'react';
import { SingaporeCarpark } from '../types/carpark';
import { Bookmark, Navigation, Zap, ShieldAlert, ArrowUpRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface CarparkCardProps {
  carpark: SingaporeCarpark;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (carpark: SingaporeCarpark) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenCalculator: (carpark: SingaporeCarpark, e: React.MouseEvent) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onOpenCalculator,
}) => {
  // Status text color paired with label
  const statusColor =
    carpark.status === 'Critical' || carpark.status === 'Full'
      ? 'text-red-600 dark:text-red-400'
      : carpark.status === 'Moderate'
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-emerald-600 dark:text-emerald-400';

  const statusBg =
    carpark.status === 'Critical' || carpark.status === 'Full'
      ? 'bg-red-500'
      : carpark.status === 'Moderate'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div
      onClick={() => onSelect(carpark)}
      className={`group relative p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-slate-900 ${
        isSelected
          ? 'border-slate-900 dark:border-emerald-500 shadow-md ring-1 ring-slate-900 dark:ring-emerald-500'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
      }`}
    >
      {/* Quiet 1-line Text Kicker & Favorite Action */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-medium text-slate-700 dark:text-slate-300">{carpark.area}</span>
          <span aria-hidden="true">·</span>
          <span>{carpark.agency}</span>
          <span aria-hidden="true">·</span>
          <span>{carpark.carparkType}</span>
          {carpark.distanceKm !== undefined && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{carpark.distanceKm} km away</span>
            </>
          )}
        </div>

        <button
          onClick={(e) => onToggleFavorite(carpark.id, e)}
          title={isFavorite ? 'Remove from saved' : 'Save carpark'}
          className="p-1 rounded-md text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
        >
          <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Main Title & Address */}
      <div className="mb-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {carpark.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {carpark.address}
        </p>
      </div>

      {/* Lot Numbers & Capacity Bar */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 mb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Available Lots: </span>
            <span className={`text-xl font-bold font-mono tabular-nums ${statusColor}`}>
              {carpark.availableLots}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums"> / {carpark.totalLots}</span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            {carpark.trend === 'filling_fast' && (
              <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400 text-xs font-medium">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Filling fast</span>
              </span>
            )}
            {carpark.trend === 'vacating' && (
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Vacating</span>
              </span>
            )}
            {carpark.trend === 'stable' && (
              <span className="flex items-center gap-0.5 text-slate-500 text-xs">
                <Minus className="w-3.5 h-3.5" />
                <span>Stable</span>
              </span>
            )}
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${statusBg} transition-all duration-300`}
            style={{ width: `${Math.min(carpark.occupancyPercent, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-mono tabular-nums">
          <span>{carpark.occupancyPercent}% Occupied</span>
          <span>Status: {carpark.status}</span>
        </div>
      </div>

      {/* Unboxed Metadata Strip (Rate, Sunday Free, Height, EV) */}
      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Peak Rate:</span>
          <span className="font-semibold font-mono tabular-nums">
            ${carpark.rates.ratePerHalfHour.toFixed(2)} / 30m
          </span>
        </div>

        {carpark.freeParkingRule !== 'None' && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Free Parking:</span>
            <span>{carpark.freeParkingRule}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Clearance:</span>
          <span className="font-mono tabular-nums">{carpark.gantryHeightLimit}m limit</span>
        </div>

        {carpark.evCharging && (
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>EV Charging:</span>
            </span>
            <span className="font-semibold font-mono tabular-nums">
              {carpark.evCharging.available}/{carpark.evCharging.total} bays free
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={(e) => onOpenCalculator(carpark, e)}
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Calculate Rate</span>
        </button>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Directions</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
