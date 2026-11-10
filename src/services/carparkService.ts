import { SingaporeCarpark, BackendConfig, CarparkCoordinates } from '../types/carpark';
import { INITIAL_SINGAPORE_CARPARKS } from './carparkData';

const FAVORITES_STORAGE_KEY = 'sg_carpark_favorites';
const BACKEND_CONFIG_KEY = 'sg_carpark_backend_config';

export function getStoredFavorites(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return data ? JSON.parse(data) : ['ION-ORC', 'SUN-CBD', 'HDB-PINN'];
  } catch {
    return ['ION-ORC', 'SUN-CBD', 'HDB-PINN'];
  }
}

export function saveStoredFavorites(ids: string[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save favorites to localStorage', err);
  }
}

export function getStoredBackendConfig(): BackendConfig {
  try {
    const data = localStorage.getItem(BACKEND_CONFIG_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // fallback
  }
  return {
    backendMode: 'simulation',
    customApiUrl: '/api/carparkavailability',
    refreshIntervalSeconds: 30,
    lastSyncTime: null,
    status: 'idle',
  };
}

export function saveStoredBackendConfig(config: BackendConfig): void {
  try {
    localStorage.setItem(BACKEND_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save backend config to localStorage', err);
  }
}

/**
 * Calculates Haversine distance in kilometers between two coordinates.
 */
export function calculateDistanceKm(
  coord1: CarparkCoordinates,
  coord2: CarparkCoordinates
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Determines availability status based on available lots and occupancy
 */
export function determineStatus(availableLots: number, totalLots: number): 'Abundant' | 'Moderate' | 'Critical' | 'Full' {
  if (availableLots <= 0) return 'Full';
  const ratio = availableLots / totalLots;
  if (availableLots < 15 || ratio < 0.1) return 'Critical';
  if (ratio <= 0.3) return 'Moderate';
  return 'Abundant';
}

/**
 * Simulates a subtle real-time fluctuation across carparks to mimic live lot sensors
 */
export function simulateRealtimeLotChanges(currentList: SingaporeCarpark[]): SingaporeCarpark[] {
  const nowStr = new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return currentList.map((carpark) => {
    // 60% chance of a slight change (+/- 1 to 5 lots)
    if (Math.random() > 0.4) {
      const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
      let newLots = carpark.availableLots + delta;
      if (newLots < 0) newLots = 0;
      if (newLots > carpark.totalLots) newLots = carpark.totalLots;

      const occupancy = Math.round(((carpark.totalLots - newLots) / carpark.totalLots) * 100);
      const status = determineStatus(newLots, carpark.totalLots);
      const trend = delta < 0 ? 'filling_fast' : delta > 0 ? 'vacating' : carpark.trend;

      return {
        ...carpark,
        availableLots: newLots,
        occupancyPercent: occupancy,
        status,
        trend,
        lastUpdated: nowStr,
        lotBreakdown: {
          ...carpark.lotBreakdown,
          cars: {
            ...carpark.lotBreakdown.cars,
            available: newLots,
          },
        },
      };
    }
    return carpark;
  });
}

/**
 * Parking rate calculator: estimates parking charges given arrival and departure
 */
export interface ParkingFeeCalculation {
  totalHours: number;
  totalMinutes: number;
  estimatedFee: number;
  breakdown: string;
  isGracePeriod: boolean;
  freeParkingApplied: boolean;
}

export function calculateEstimatedParkingFee(
  carpark: SingaporeCarpark,
  durationMinutes: number,
  isSundayOrPh: boolean = false
): ParkingFeeCalculation {
  if (durationMinutes <= carpark.rates.gracePeriodMinutes) {
    return {
      totalHours: 0,
      totalMinutes: durationMinutes,
      estimatedFee: 0,
      breakdown: `Grace period (${carpark.rates.gracePeriodMinutes} mins) applied. No charge.`,
      isGracePeriod: true,
      freeParkingApplied: false,
    };
  }

  // Free Sunday parking check for HDB/URA
  if (isSundayOrPh && carpark.freeParkingRule.includes('FREE') || carpark.freeParkingRule.includes('Free')) {
    return {
      totalHours: Math.floor(durationMinutes / 60),
      totalMinutes: durationMinutes,
      estimatedFee: 0,
      breakdown: `Sunday & Public Holiday Free Parking policy applies.`,
      isGracePeriod: false,
      freeParkingApplied: true,
    };
  }

  const halfHourBlocks = Math.ceil(durationMinutes / 30);
  const baseRate = halfHourBlocks * carpark.rates.ratePerHalfHour;

  // Apply evening flat rate or overnight cap if duration is long (> 6 hours)
  let finalFee = baseRate;
  if (carpark.rates.overnightMax && durationMinutes >= 360) {
    finalFee = Math.min(finalFee, carpark.rates.overnightMax + (durationMinutes > 480 ? 4 : 0));
  } else if (carpark.rates.eveningFlatRate && durationMinutes >= 180) {
    // If entered in evening with flat rate
    finalFee = Math.min(finalFee, carpark.rates.eveningFlatRate * 1.5);
  }

  const totalHours = Math.floor(durationMinutes / 60);
  const remainingMins = durationMinutes % 60;

  return {
    totalHours,
    totalMinutes: durationMinutes,
    estimatedFee: Math.round(finalFee * 100) / 100,
    breakdown: `${halfHourBlocks} x 30-min blocks @ $${carpark.rates.ratePerHalfHour.toFixed(2)}/30m`,
    isGracePeriod: false,
    freeParkingApplied: false,
  };
}

/**
 * Backend adapter for live integration with custom API or LTA DataMall proxy
 */
export async function fetchLiveCarparksFromBackend(
  apiUrl: string
): Promise<{ success: boolean; data?: SingaporeCarpark[]; error?: string }> {
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();

    if (payload && payload.keyConfigured === false) {
      return {
        success: false,
        error: payload.message || 'LTA DataMall AccountKey is not configured. Please set LTA_DATAMALL_API_KEY.',
      };
    }

    // Check if payload is in LTA DataMall format
    if (payload && Array.isArray(payload.value)) {
      const parsed: SingaporeCarpark[] = payload.value.map((item: any, idx: number) => {
        const [latStr, lngStr] = (item.Location || '').split(' ');
        const lat = parseFloat(latStr) || 1.3521;
        const lng = parseFloat(lngStr) || 103.8198;
        const available = parseInt(item.AvailableLots, 10) || 0;
        const total = Math.max(available + 50, 200);
        const occupancy = Math.round(((total - available) / total) * 100);

        return {
          id: item.CarParkID || `CP-${idx}`,
          name: item.Development || `Carpark ${item.CarParkID}`,
          development: item.Development || 'Public Carpark',
          address: `${item.Area || 'Singapore'}, Singapore`,
          postalCode: '000000',
          area: item.Area || 'Central',
          agency: (item.Agency as any) || 'LTA',
          carparkType: 'Multi-Storey',
          coordinates: { lat, lng },
          availableLots: available,
          totalLots: total,
          lotType: (item.LotType as any) || 'C',
          lotBreakdown: {
            cars: { available, total },
          },
          evCharging: null,
          gantryHeightLimit: 2.15,
          parkingSystem: 'Electronic (EPS)',
          shortTermParking: 'WHOLE DAY',
          freeParkingRule: item.Agency === 'HDB' ? 'SUN & PH 7.00AM - 10.30PM' : 'None',
          nightParkingAvailable: true,
          rates: {
            weekdayDay: item.Agency === 'HDB' ? '$0.60 / 30 mins' : '$1.50 / 30 mins',
            weekdayNight: '$2.50 per entry',
            saturday: '$1.50 / 30 mins',
            sundayAndPh: item.Agency === 'HDB' ? 'FREE' : '$1.50 / 30 mins',
            gracePeriodMinutes: 10,
            ratePerHalfHour: item.Agency === 'HDB' ? 0.60 : 1.50,
          },
          occupancyPercent: occupancy,
          status: determineStatus(available, total),
          trend: 'stable',
          lastUpdated: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
        };
      });

      return { success: true, data: parsed };
    }

    // Direct JSON array matching SingaporeCarpark format
    if (Array.isArray(payload)) {
      return { success: true, data: payload as SingaporeCarpark[] };
    }

    throw new Error('Unexpected JSON structure. Expected array or { value: [...] }');
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to connect to backend endpoint.',
    };
  }
}
