import React, { useState, useEffect, useCallback } from 'react';
import { SingaporeCarpark, BackendConfig } from './types/carpark';
import { INITIAL_SINGAPORE_CARPARKS } from './services/carparkData';
import {
  getStoredFavorites,
  saveStoredFavorites,
  getStoredBackendConfig,
  saveStoredBackendConfig,
  simulateRealtimeLotChanges,
  fetchLiveCarparksFromBackend,
  calculateDistanceKm,
} from './services/carparkService';

import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { MapView } from './components/MapView';
import { CarparkList } from './components/CarparkList';
import { CarparkDetailDrawer } from './components/CarparkDetailDrawer';
import { RateCalculatorModal } from './components/RateCalculatorModal';
import { BackendConnectionModal } from './components/BackendConnectionModal';
import { EVHubModal } from './components/EVHubModal';

export default function App() {
  const [carparks, setCarparks] = useState<SingaporeCarpark[]>(INITIAL_SINGAPORE_CARPARKS);
  const [selectedCarpark, setSelectedCarpark] = useState<SingaporeCarpark | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'ev' | 'calculator'>('map');
  
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  const [backendConfig, setBackendConfig] = useState<BackendConfig>(getStoredBackendConfig);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [isRateCalcModalOpen, setIsRateCalcModalOpen] = useState<boolean>(false);
  const [calcTargetCarpark, setCalcTargetCarpark] = useState<SingaporeCarpark | null>(null);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(
    new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Theme Management
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sg_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sg_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sg_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    if (backendConfig.backendMode === 'custom_api' && backendConfig.customApiUrl) {
      const res = await fetchLiveCarparksFromBackend(backendConfig.customApiUrl);
      if (res.success && res.data) {
        setCarparks(res.data);
      } else {
        // Fallback to simulation with notification
        setCarparks((prev) => simulateRealtimeLotChanges(prev));
      }
    } else {
      // Simulation mode
      setCarparks((prev) => simulateRealtimeLotChanges(prev));
    }

    setLastUpdatedTime(
      new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );

    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, [backendConfig]);

  // Periodic Auto-refresh (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [handleRefresh]);

  // Optional Geolocation for distance calculation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCarparks((prev) =>
            prev.map((c) => ({
              ...c,
              distanceKm: calculateDistanceKm(userCoords, c.coordinates),
            }))
          );
        },
        () => {
          // Geolocation permission denied or unavailable, use Singapore CBD as reference
          const cbdCoords = { lat: 1.2838, lng: 103.8510 };
          setCarparks((prev) =>
            prev.map((c) => ({
              ...c,
              distanceKm: calculateDistanceKm(cbdCoords, c.coordinates),
            }))
          );
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Favorite toggle
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    saveStoredFavorites(updated);
  };

  // Open Rate Calculator modal
  const handleOpenCalculator = (carpark: SingaporeCarpark, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCalcTargetCarpark(carpark);
    setIsRateCalcModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        showOnlyFavorites={showOnlyFavorites}
        setShowOnlyFavorites={setShowOnlyFavorites}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdatedTime={lastUpdatedTime}
        backendConfig={backendConfig}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
      />

      {/* Live Metrics Summary Strip */}
      <StatsBar carparks={carparks} />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'map' && (
          <MapView
            carparks={showOnlyFavorites ? carparks.filter((c) => favorites.includes(c.id)) : carparks}
            selectedCarpark={selectedCarpark}
            onSelectCarpark={(c) => setSelectedCarpark(c)}
            onOpenCalculator={handleOpenCalculator}
            isDark={isDark}
          />
        )}

        {activeTab === 'list' && (
          <CarparkList
            carparks={carparks}
            selectedCarpark={selectedCarpark}
            onSelectCarpark={(c) => setSelectedCarpark(c)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenCalculator={handleOpenCalculator}
            showOnlyFavorites={showOnlyFavorites}
            setShowOnlyFavorites={setShowOnlyFavorites}
          />
        )}

        {activeTab === 'ev' && (
          <EVHubModal
            carparks={carparks}
            onSelectCarpark={(c) => setSelectedCarpark(c)}
          />
        )}

        {activeTab === 'calculator' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Singapore Carpark Rate Comparison
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Find the most economical parking lots near your destination across HDB, URA, and private commercial malls.
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <button
                onClick={() => setIsRateCalcModalOpen(true)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Launch Multi-Carpark Tariff Comparison Tool
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Selected Carpark Slide-Over Details Drawer */}
      <CarparkDetailDrawer
        carpark={selectedCarpark}
        onClose={() => setSelectedCarpark(null)}
        isFavorite={selectedCarpark ? favorites.includes(selectedCarpark.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Rate Comparison Modal */}
      <RateCalculatorModal
        isOpen={isRateCalcModalOpen || activeTab === 'calculator'}
        onClose={() => {
          setIsRateCalcModalOpen(false);
          if (activeTab === 'calculator') setActiveTab('list');
        }}
        carparks={carparks}
        initialCarpark={calcTargetCarpark}
        onSelectCarpark={(c) => {
          setSelectedCarpark(c);
          setIsRateCalcModalOpen(false);
        }}
      />

      {/* Backend API Configuration Modal */}
      <BackendConnectionModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        config={backendConfig}
        onUpdateConfig={(cfg) => setBackendConfig(cfg)}
        onSyncBackend={handleRefresh}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">SG Carpark Live</span>
            <span aria-hidden="true">·</span>
            <span>Singapore Carpark Availability Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Compatible with LTA DataMall v2 & Data.gov.sg</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsBackendModalOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              API Integration Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
