import React from 'react';
import { SingaporeCarpark } from '../types/carpark';

interface StatsBarProps {
  carparks: SingaporeCarpark[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ carparks }) => {
  const totalCarparks = carparks.length;
  const totalAvailable = carparks.reduce((sum, c) => sum + c.availableLots, 0);
  const totalCapacity = carparks.reduce((sum, c) => sum + c.totalLots, 0);
  const overallOccupancy = totalCapacity > 0 ? Math.round(((totalCapacity - totalAvailable) / totalCapacity) * 100) : 0;
  
  const totalEvAvailable = carparks.reduce((sum, c) => sum + (c.evCharging?.available || 0), 0);
  const totalEvPoints = carparks.reduce((sum, c) => sum + (c.evCharging?.total || 0), 0);
  
  const freeSundayCount = carparks.filter(c => c.freeParkingRule.includes('FREE') || c.freeParkingRule.includes('Free')).length;

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          <div className="pt-2 md:pt-0">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Tracked</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {totalCarparks} <span className="text-xs font-normal text-slate-500">carparks</span>
            </div>
          </div>

          <div className="pt-2 md:pt-0 md:pl-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Live Available Lots</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {totalAvailable.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ {totalCapacity.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 md:pt-0 md:pl-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Singapore Occupancy</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {overallOccupancy}% <span className="text-xs font-normal text-slate-500">capacity</span>
            </div>
          </div>

          <div className="pt-2 md:pt-0 md:pl-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">EV Fast Chargers</div>
            <div className="text-lg font-bold text-sky-600 dark:text-sky-400 font-mono tabular-nums">
              {totalEvAvailable} <span className="text-xs font-normal text-slate-500">of {totalEvPoints} bays free</span>
            </div>
          </div>

          <div className="pt-2 md:pt-0 md:pl-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Sunday Free Parking</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {freeSundayCount} <span className="text-xs font-normal text-slate-500">HDB/URA sites</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
