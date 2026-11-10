import React from 'react';
import { Car, RefreshCw, Moon, Sun, Plug, Bookmark, Navigation } from 'lucide-react';
import { BackendConfig } from '../types/carpark';

interface NavbarProps {
  activeTab: 'map' | 'list' | 'ev' | 'calculator';
  setActiveTab: (tab: 'map' | 'list' | 'ev' | 'calculator') => void;
  favoritesCount: number;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (val: boolean) => void;
  isDark: boolean;
  toggleTheme: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdatedTime: string;
  backendConfig: BackendConfig;
  onOpenBackendModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  showOnlyFavorites,
  setShowOnlyFavorites,
  isDark,
  toggleTheme,
  onRefresh,
  isRefreshing,
  lastUpdatedTime,
  backendConfig,
  onOpenBackendModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Zone - Single Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Car className="w-5 h-5" />
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('map');
              setShowOnlyFavorites(false);
            }}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap hover:opacity-90 transition-opacity"
          >
            SG Carpark Live
          </a>
        </div>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => {
              setActiveTab('map');
              setShowOnlyFavorites(false);
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 ${
              activeTab === 'map' && !showOnlyFavorites
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Live Map
          </button>

          <button
            onClick={() => {
              setActiveTab('list');
              setShowOnlyFavorites(false);
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 ${
              activeTab === 'list' && !showOnlyFavorites
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Carpark Directory
          </button>

          <button
            onClick={() => {
              setActiveTab('ev');
              setShowOnlyFavorites(false);
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 ${
              activeTab === 'ev'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            EV Charging Hubs
          </button>

          <button
            onClick={() => {
              setActiveTab('calculator');
              setShowOnlyFavorites(false);
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 ${
              activeTab === 'calculator'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Parking Rate Calculator
          </button>

          <button
            onClick={() => {
              setShowOnlyFavorites(!showOnlyFavorites);
              if (activeTab === 'ev' || activeTab === 'calculator') setActiveTab('list');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 pb-0.5 ${
              showOnlyFavorites
                ? 'text-amber-600 dark:text-amber-400 font-semibold border-b-2 border-amber-600 dark:border-amber-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({favoritesCount})</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Area & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Refresh button with timestamp */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh real-time carpark availability"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline font-mono tabular-nums">{lastUpdatedTime}</span>
          </button>

          {/* Backend Connection Modal Trigger */}
          <button
            onClick={onOpenBackendModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-700"
            title="Configure Backend Connection or View API Schema"
          >
            <Plug className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Backend API</span>
          </button>

          {/* Theme switch */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
