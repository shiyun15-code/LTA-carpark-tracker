import React, { useState } from 'react';
import { SingaporeCarpark, FilterState } from '../types/carpark';
import { CarparkCard } from './CarparkCard';
import { SINGAPORE_AREAS } from '../services/carparkData';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X, Zap, Check } from 'lucide-react';

interface CarparkListProps {
  carparks: SingaporeCarpark[];
  selectedCarpark: SingaporeCarpark | null;
  onSelectCarpark: (carpark: SingaporeCarpark) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenCalculator: (carpark: SingaporeCarpark, e: React.MouseEvent) => void;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (val: boolean) => void;
}

export const CarparkList: React.FC<CarparkListProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  favorites,
  onToggleFavorite,
  onOpenCalculator,
  showOnlyFavorites,
  setShowOnlyFavorites,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [evOnly, setEvOnly] = useState(false);
  const [freeSundayOnly, setFreeSundayOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'lots_desc' | 'lots_asc' | 'occupancy_asc' | 'rate_asc' | 'name'>('lots_desc');

  // Filter pipeline
  const filtered = carparks.filter((carpark) => {
    // Favorites filter
    if (showOnlyFavorites && !favorites.includes(carpark.id)) {
      return false;
    }

    // Search query (name, address, postal code, area)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = carpark.name.toLowerCase().includes(q);
      const matchAddr = carpark.address.toLowerCase().includes(q);
      const matchArea = carpark.area.toLowerCase().includes(q);
      const matchPostal = carpark.postalCode.includes(q);
      if (!matchName && !matchAddr && !matchArea && !matchPostal) {
        return false;
      }
    }

    // Area filter
    if (selectedArea !== 'all' && carpark.area !== selectedArea) {
      return false;
    }

    // Agency filter
    if (selectedAgency !== 'all' && carpark.agency !== selectedAgency) {
      return false;
    }

    // Status filter
    if (statusFilter === 'abundant' && carpark.status !== 'Abundant') return false;
    if (statusFilter === 'moderate' && carpark.status !== 'Moderate') return false;
    if (statusFilter === 'critical' && carpark.status !== 'Critical' && carpark.status !== 'Full') return false;

    // EV Only filter
    if (evOnly && (!carpark.evCharging || carpark.evCharging.available <= 0)) {
      return false;
    }

    // Free Sunday filter
    if (freeSundayOnly && !carpark.freeParkingRule.includes('FREE') && !carpark.freeParkingRule.includes('Free')) {
      return false;
    }

    return true;
  });

  // Sort pipeline
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'lots_desc') return b.availableLots - a.availableLots;
    if (sortBy === 'lots_asc') return a.availableLots - b.availableLots;
    if (sortBy === 'occupancy_asc') return a.occupancyPercent - b.occupancyPercent;
    if (sortBy === 'rate_asc') return a.rates.ratePerHalfHour - b.rates.ratePerHalfHour;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedArea('all');
    setSelectedAgency('all');
    setStatusFilter('all');
    setEvOnly(false);
    setFreeSundayOnly(false);
    setShowOnlyFavorites(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedArea !== 'all' ||
    selectedAgency !== 'all' ||
    statusFilter !== 'all' ||
    evOnly ||
    freeSundayOnly ||
    showOnlyFavorites;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Search & Main Filter Row */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by carpark name, shopping mall, street, or postal code (e.g. ION, 238801, Jem)..."
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="lots_desc">Most Lots Available</option>
                <option value="lots_asc">Fewest Lots Available</option>
                <option value="occupancy_asc">Lowest Occupancy (%)</option>
                <option value="rate_asc">Lowest Parking Rate ($)</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Area Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedArea('all')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedArea === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Singapore
            </button>
            {SINGAPORE_AREAS.slice(1, 7).map((area) => (
              <button
                key={area.id}
                onClick={() => setSelectedArea(area.id)}
                className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  selectedArea === area.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {area.label}
              </button>
            ))}
          </div>

          {/* Agency Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setSelectedAgency('all')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedAgency === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedAgency('Commercial')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedAgency === 'Commercial'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Malls & Commercial
            </button>
            <button
              onClick={() => setSelectedAgency('HDB')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedAgency === 'HDB'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              HDB Multi-Storey
            </button>
            <button
              onClick={() => setSelectedAgency('URA')}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedAgency === 'URA'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              URA Hubs
            </button>
          </div>

          {/* Feature Toggles */}
          <button
            onClick={() => setEvOnly(!evOnly)}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              evOnly
                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-semibold'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-sky-500" />
            <span>EV Charging Available</span>
          </button>

          <button
            onClick={() => setFreeSundayOnly(!freeSundayOnly)}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              freeSundayOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <span>Free Sunday Parking</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono tabular-nums">
        <div>
          Showing {sorted.length} {sorted.length === 1 ? 'carpark' : 'carparks'}
          {showOnlyFavorites ? ' in saved favorites' : ''}
        </div>
        <div>
          Sorted by:{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {sortBy === 'lots_desc' && 'Most Lots'}
            {sortBy === 'lots_asc' && 'Fewest Lots'}
            {sortBy === 'occupancy_asc' && 'Lowest Occupancy'}
            {sortBy === 'rate_asc' && 'Lowest Rate'}
            {sortBy === 'name' && 'Alphabetical'}
          </span>
        </div>
      </div>

      {/* Grid of Carparks */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((carpark) => (
            <CarparkCard
              key={carpark.id}
              carpark={carpark}
              isSelected={selectedCarpark?.id === carpark.id}
              isFavorite={favorites.includes(carpark.id)}
              onSelect={onSelectCarpark}
              onToggleFavorite={onToggleFavorite}
              onOpenCalculator={onOpenCalculator}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 my-6">
          <div className="max-w-md mx-auto space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No carparks match your filter criteria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try broadening your search term, clearing area restrictions, or resetting EV/Sunday parking filters.
            </p>
            <div className="pt-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
