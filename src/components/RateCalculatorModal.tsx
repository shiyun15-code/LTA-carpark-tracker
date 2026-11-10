import React, { useState } from 'react';
import { SingaporeCarpark } from '../types/carpark';
import { calculateEstimatedParkingFee } from '../services/carparkService';
import { X, DollarSign, Clock, ArrowRight, Check } from 'lucide-react';

interface RateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  carparks: SingaporeCarpark[];
  initialCarpark?: SingaporeCarpark | null;
  onSelectCarpark: (carpark: SingaporeCarpark) => void;
}

export const RateCalculatorModal: React.FC<RateCalculatorModalProps> = ({
  isOpen,
  onClose,
  carparks,
  initialCarpark,
  onSelectCarpark,
}) => {
  if (!isOpen) return null;

  const [selectedArea, setSelectedArea] = useState<string>(initialCarpark?.area || 'Orchard');
  const [durationMinutes, setDurationMinutes] = useState<number>(180); // 3 hours
  const [isSunday, setIsSunday] = useState<boolean>(false);

  // Filter carparks in the chosen area
  const areaCarparks = carparks.filter((c) => c.area === selectedArea);
  const areas = Array.from(new Set(carparks.map((c) => c.area)));

  // Calculate fees for all carparks in the area
  const carparksWithFees = areaCarparks.map((carpark) => {
    const feeInfo = calculateEstimatedParkingFee(carpark, durationMinutes, isSunday);
    return {
      carpark,
      feeInfo,
    };
  }).sort((a, b) => a.feeInfo.estimatedFee - b.feeInfo.estimatedFee);

  const durationHours = Math.floor(durationMinutes / 60);
  const durationRemainderMins = durationMinutes % 60;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Singapore Parking Rate Comparison
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compare parking fees across nearby carparks in the same area.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Destination Area
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Day of Visit
              </label>
              <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsSunday(false)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    !isSunday
                      ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Weekday / Sat
                </button>
                <button
                  type="button"
                  onClick={() => setIsSunday(true)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isSunday
                      ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Sunday / PH
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Parking Duration:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {durationHours} hr {durationRemainderMins > 0 ? `${durationRemainderMins} min` : ''}
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="480"
              step="15"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
              <span>30m</span>
              <span>2 hours</span>
              <span>4 hours</span>
              <span>8 hours</span>
            </div>
          </div>
        </div>

        {/* Comparison List */}
        <div className="p-5 overflow-y-auto max-h-[380px] divide-y divide-slate-100 dark:divide-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono tabular-nums">
            Ranked from cheapest to highest for {durationHours}h {durationRemainderMins}m in {selectedArea}:
          </div>

          {carparksWithFees.map(({ carpark, feeInfo }, index) => {
            const isCheapest = index === 0;

            return (
              <div
                key={carpark.id}
                onClick={() => {
                  onSelectCarpark(carpark);
                  onClose();
                }}
                className="py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold font-mono text-slate-400">
                      #{index + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {carpark.name}
                    </h4>
                    {isCheapest && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                        Cheapest
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {feeInfo.breakdown} · {carpark.availableLots} lots available
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    ${feeInfo.estimatedFee.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    ${carpark.rates.ratePerHalfHour.toFixed(2)}/30m
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
