import React, { useState } from 'react';
import { SingaporeCarpark } from '../types/carpark';
import { Zap, MapPin, ArrowRight, CheckCircle2, BatteryCharging, Filter } from 'lucide-react';

interface EVHubModalProps {
  carparks: SingaporeCarpark[];
  onSelectCarpark: (carpark: SingaporeCarpark) => void;
}

export const EVHubModal: React.FC<EVHubModalProps> = ({ carparks, onSelectCarpark }) => {
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [minPower, setMinPower] = useState<number>(0);

  // Filter carparks that have EV charging
  const evCarparks = carparks.filter((c) => {
    if (!c.evCharging) return false;
    if (providerFilter !== 'all' && c.evCharging.provider !== providerFilter) return false;
    if (minPower > 0 && c.evCharging.powerKw < minPower) return false;
    return true;
  });

  const providers = Array.from(
    new Set(carparks.map((c) => c.evCharging?.provider).filter(Boolean) as string[])
  );

  const totalEvAvailable = evCarparks.reduce((sum, c) => sum + (c.evCharging?.available || 0), 0);
  const totalEvCapacity = evCarparks.reduce((sum, c) => sum + (c.evCharging?.total || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-900 to-slate-900 text-white mb-6 shadow-md border border-sky-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" />
              <span>Singapore Clean Mobility</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
              Electric Vehicle (EV) Charging Stations
            </h2>
            <p className="text-xs text-sky-200 mt-1 max-w-xl">
              Track live EV charging bay availabilities across SP Group, CDG Engie, Shell Recharge, and Charge+ inside Singapore carparks.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15">
            <div>
              <div className="text-[10px] uppercase text-sky-200 font-semibold">Available Bays</div>
              <div className="text-2xl font-black font-mono tabular-nums text-white">
                {totalEvAvailable} <span className="text-xs font-normal text-sky-300">/ {totalEvCapacity}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-[10px] uppercase text-sky-200 font-semibold">EV Locations</div>
              <div className="text-2xl font-black font-mono tabular-nums text-white">
                {evCarparks.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setProviderFilter('all')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              providerFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Operators
          </button>
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => setProviderFilter(p)}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                providerFilter === p
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Speed filter */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 mr-1">Speed:</span>
          <button
            onClick={() => setMinPower(0)}
            className={`px-2.5 py-1 font-medium rounded-lg border transition-colors cursor-pointer ${
              minPower === 0
                ? 'bg-slate-900 text-white dark:bg-slate-700'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Speeds
          </button>
          <button
            onClick={() => setMinPower(50)}
            className={`px-2.5 py-1 font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
              minPower === 50
                ? 'bg-sky-600 text-white'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Zap className="w-3 h-3 text-sky-400" />
            <span>50kW DC Fast Only</span>
          </button>
        </div>
      </div>

      {/* Grid of EV Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evCarparks.map((carpark) => {
          const ev = carpark.evCharging!;
          const isFree = ev.available > 0;

          return (
            <div
              key={carpark.id}
              onClick={() => onSelectCarpark(carpark)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 bg-white dark:bg-slate-900 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>{carpark.area} · {carpark.agency}</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                    {ev.provider}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {carpark.name}
                </h3>
                <p className="text-xs text-slate-500 truncate mb-3">
                  {carpark.address}
                </p>

                {/* EV Availability Banner */}
                <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 mb-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300">
                        Available EV Bays
                      </div>
                      <div className="text-2xl font-black font-mono tabular-nums text-sky-900 dark:text-sky-100 mt-0.5">
                        {ev.available}{' '}
                        <span className="text-xs font-normal text-sky-600 dark:text-sky-400">
                          / {ev.total} bays
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        Power Output
                      </div>
                      <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                        {ev.powerKw} kW {ev.powerKw >= 50 ? 'DC' : 'AC'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-sky-200/50 dark:border-sky-800/50 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-500">Connectors:</span>
                    <span className="font-mono">{ev.connectorTypes.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="text-slate-500">
                  General Lots: <span className="font-mono font-bold">{carpark.availableLots}</span>
                </div>
                <div className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
