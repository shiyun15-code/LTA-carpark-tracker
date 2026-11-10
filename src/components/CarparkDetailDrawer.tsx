import React, { useState } from 'react';
import { SingaporeCarpark } from '../types/carpark';
import { calculateEstimatedParkingFee } from '../services/carparkService';
import {
  X,
  Navigation,
  Bookmark,
  Zap,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  DollarSign,
  Car,
  Compass,
} from 'lucide-react';

interface CarparkDetailDrawerProps {
  carpark: SingaporeCarpark | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const CarparkDetailDrawer: React.FC<CarparkDetailDrawerProps> = ({
  carpark,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  if (!carpark) return null;

  // State for parking fee calculator inside drawer
  const [parkingDurationMins, setParkingDurationMins] = useState<number>(120); // 2 hours default
  const [isSundayFee, setIsSundayFee] = useState<boolean>(false);

  // State for vehicle height checker
  const [userVehicleHeight, setUserVehicleHeight] = useState<number>(1.8);

  const feeCalc = calculateEstimatedParkingFee(carpark, parkingDurationMins, isSundayFee);

  const isHeightSafe = userVehicleHeight <= carpark.gantryHeightLimit;
  const heightMargin = Math.round((carpark.gantryHeightLimit - userVehicleHeight) * 100) / 100;

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-1.5">
              <span>{carpark.area}</span>
              <span aria-hidden="true">·</span>
              <span>{carpark.agency}</span>
              <span aria-hidden="true">·</span>
              <span>{carpark.carparkType}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">ID: {carpark.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {carpark.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {carpark.address} (S{carpark.postalCode})
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => onToggleFavorite(carpark.id, e)}
              className="p-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isFavorite ? 'Remove from saved' : 'Save carpark'}
            >
              <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Live Lot Gauge Box */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                  Real-Time Car Lots
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-extrabold font-mono tabular-nums ${statusColor}`}>
                    {carpark.availableLots}
                  </span>
                  <span className="text-sm font-mono tabular-nums text-slate-500">
                    / {carpark.totalLots} total lots
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Occupancy
                </div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200 mt-1">
                  {carpark.occupancyPercent}%
                </div>
              </div>
            </div>

            {/* Visual Capacity Bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full ${statusBg} transition-all duration-500`}
                style={{ width: `${Math.min(carpark.occupancyPercent, 100)}%` }}
              />
            </div>

            {/* Velocity and Last Updated */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5">
                {carpark.trend === 'filling_fast' && (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Filling fast</span>
                  </span>
                )}
                {carpark.trend === 'vacating' && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Lots vacating</span>
                  </span>
                )}
                {carpark.trend === 'stable' && (
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Minus className="w-3.5 h-3.5" />
                    <span>Lot count stable</span>
                  </span>
                )}
              </div>
              <div>Updated {carpark.lastUpdated}</div>
            </div>
          </div>

          {/* Vehicle Lot Breakdown Matrix */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Available Lots by Vehicle Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-xs text-slate-500 dark:text-slate-400">Car Lots (C)</div>
                <div className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                  {carpark.availableLots}{' '}
                  <span className="text-xs font-normal text-slate-500">/ {carpark.totalLots}</span>
                </div>
              </div>

              {carpark.lotBreakdown.motorcycles && (
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Motorcycles (Y)</div>
                  <div className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                    {carpark.lotBreakdown.motorcycles.available}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      / {carpark.lotBreakdown.motorcycles.total}
                    </span>
                  </div>
                </div>
              )}

              {carpark.evCharging ? (
                <div className="p-3 rounded-lg border border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20">
                  <div className="text-xs text-sky-700 dark:text-sky-300 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>EV Chargers</span>
                  </div>
                  <div className="text-base font-bold font-mono tabular-nums text-sky-900 dark:text-sky-200 mt-1">
                    {carpark.evCharging.available}{' '}
                    <span className="text-xs font-normal text-sky-600 dark:text-sky-400">
                      / {carpark.evCharging.total} bays
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="text-xs text-slate-500 dark:text-slate-400">EV Charging</div>
                  <div className="text-xs text-slate-400 mt-1">No chargers installed</div>
                </div>
              )}
            </div>
          </div>

          {/* Parking Tariff Table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Official Parking Rates & Tariffs
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              <div className="p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
                <span className="font-medium text-slate-600 dark:text-slate-300">Weekday Daytime</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono text-right">
                  {carpark.rates.weekdayDay}
                </span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="font-medium text-slate-600 dark:text-slate-300">Weekday Evening / Night</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono text-right">
                  {carpark.rates.weekdayNight}
                </span>
              </div>
              <div className="p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
                <span className="font-medium text-slate-600 dark:text-slate-300">Saturdays</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono text-right">
                  {carpark.rates.saturday}
                </span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="font-medium text-slate-600 dark:text-slate-300">Sundays & Public Holidays</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-right">
                  {carpark.rates.sundayAndPh}
                </span>
              </div>
              <div className="p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
                <span className="font-medium text-slate-600 dark:text-slate-300">Grace Period</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {carpark.rates.gracePeriodMinutes} minutes
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Fee Estimator */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Estimated Parking Fee Calculator</span>
              </h3>
              <div className="text-xs text-slate-500 font-mono tabular-nums">
                {Math.floor(parkingDurationMins / 60)}h {parkingDurationMins % 60}m
              </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-2 mb-3">
              <input
                type="range"
                min="10"
                max="480"
                step="15"
                value={parkingDurationMins}
                onChange={(e) => setParkingDurationMins(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>15 mins</span>
                <span>2 hours</span>
                <span>4 hours</span>
                <span>8 hours</span>
              </div>
            </div>

            {/* Sunday toggle */}
            <div className="flex items-center justify-between text-xs mb-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-300">Parking on Sunday / Public Holiday?</span>
              <button
                onClick={() => setIsSundayFee(!isSundayFee)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  isSundayFee
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {isSundayFee ? 'Yes (Sunday/PH)' : 'No (Weekday)'}
              </button>
            </div>

            {/* Result Box */}
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  Estimated Fee
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {feeCalc.breakdown}
                </div>
              </div>
              <div className="text-2xl font-black font-mono tabular-nums text-emerald-900 dark:text-emerald-200">
                ${feeCalc.estimatedFee.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Gantry Height Clearance Tester */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Gantry Height Clearance Check</span>
              </h3>
              <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Limit: {carpark.gantryHeightLimit}m
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Verify if your SUV, MPV, van, or vehicle with a roof box clears the gantry.
            </p>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                Your Vehicle Height:
              </span>
              <div className="flex items-center gap-1">
                {[1.6, 1.8, 1.95, 2.1, 2.2].map((height) => (
                  <button
                    key={height}
                    onClick={() => setUserVehicleHeight(height)}
                    className={`px-2 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                      userVehicleHeight === height
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {height.toFixed(2)}m
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                isHeightSafe
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {isHeightSafe ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    Clear to enter! Clearance margin is +{heightMargin.toFixed(2)}m above your vehicle.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>
                    Warning: Vehicle height ({userVehicleHeight}m) exceeds the {carpark.gantryHeightLimit}m gantry limit!
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Gantry Entrance Note & Details */}
          {carpark.gantryEntranceNote && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-600 dark:text-slate-300">
              <div className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gantry Entrance Guidance</span>
              </div>
              <p>{carpark.gantryEntranceNote}</p>
            </div>
          )}

          {/* Carpark System Specs */}
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1 font-mono">
            <div>Parking System: {carpark.parkingSystem}</div>
            <div>Short Term Parking: {carpark.shortTermParking}</div>
            <div>Night Parking: {carpark.nightParkingAvailable ? 'Available' : 'Restricted'}</div>
            <div>Coordinates: {carpark.coordinates.lat.toFixed(4)}° N, {carpark.coordinates.lng.toFixed(4)}° E</div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Navigation className="w-4 h-4" />
            <span>Open GPS Directions</span>
          </a>

          <a
            href={`https://waze.com/ul?ll=${carpark.coordinates.lat},${carpark.coordinates.lng}&navigate=yes`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Waze</span>
          </a>
        </div>
      </div>
    </div>
  );
};
