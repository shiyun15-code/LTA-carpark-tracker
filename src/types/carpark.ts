export type LotType = 'C' | 'Y' | 'H'; // C: Cars, Y: Motorcycles, H: Heavy Vehicles
export type CarparkAgency = 'HDB' | 'URA' | 'LTA' | 'Commercial';
export type CarparkType = 'Multi-Storey' | 'Basement' | 'Surface' | 'Mechanized';
export type AvailabilityStatus = 'Abundant' | 'Moderate' | 'Critical' | 'Full';
export type LotTrend = 'filling_fast' | 'vacating' | 'stable';

export interface CarparkCoordinates {
  lat: number;
  lng: number;
}

export interface EVChargerInfo {
  available: number;
  total: number;
  provider: string; // SP Group, CDG Engie, Shell Recharge, Charge+
  powerKw: number;
  connectorTypes: string[]; // Type 2, CCS2
}

export interface LotBreakdown {
  cars: {
    available: number;
    total: number;
  };
  motorcycles?: {
    available: number;
    total: number;
  };
  heavyVehicles?: {
    available: number;
    total: number;
  };
}

export interface ParkingTariff {
  weekdayDay: string; // e.g. "$1.50 / 30 mins (07:00 - 17:00)"
  weekdayNight: string; // e.g. "$3.50 per entry (17:00 - 07:00)"
  saturday: string; // e.g. "$1.50 / 30 mins (07:00 - 17:00), $3.50 per entry after"
  sundayAndPh: string; // e.g. "Free (07:00 - 22:30), $0.60/30m thereafter"
  gracePeriodMinutes: number; // e.g. 10 or 15
  ratePerHalfHour: number; // SGD for calculations
  eveningFlatRate?: number; // SGD if applicable
  overnightMax?: number; // SGD e.g. $5.00 HDB cap
}

export interface SingaporeCarpark {
  id: string; // LTA CarParkID / HDB Carpark Number
  name: string;
  development: string;
  address: string;
  postalCode: string;
  area: string; // e.g. "Orchard", "Marina Bay", "CBD / Downtown", "Bugis", "Jurong East", "Tampines"
  agency: CarparkAgency;
  carparkType: CarparkType;
  coordinates: CarparkCoordinates;
  availableLots: number;
  totalLots: number;
  lotType: LotType;
  lotBreakdown: LotBreakdown;
  evCharging: EVChargerInfo | null;
  gantryHeightLimit: number; // e.g. 2.15 (meters)
  parkingSystem: 'Electronic (EPS)' | 'Coupon' | 'ANPR / Barrierless';
  shortTermParking: 'WHOLE DAY' | '7AM-10.30PM' | 'NO';
  freeParkingRule: string; // e.g. "SUN & PH 7.00AM - 10.30PM" or "None"
  nightParkingAvailable: boolean;
  rates: ParkingTariff;
  occupancyPercent: number; // 0 - 100%
  status: AvailabilityStatus;
  trend: LotTrend;
  lastUpdated: string;
  isFavorite?: boolean;
  distanceKm?: number;
  gantryEntranceNote?: string;
}

export interface AreaFilterOption {
  id: string;
  label: string;
  coordinates?: CarparkCoordinates;
  zoom?: number;
}

export interface FilterState {
  searchQuery: string;
  selectedArea: string;
  selectedAgency: string; // 'all' | CarparkAgency
  vehicleType: LotType | 'EV';
  statusFilter: string; // 'all' | AvailabilityStatus
  minLotsAvailable: number;
  maxRate: number; // SGD/30min filter
  evOnly: boolean;
  freeSundayOnly: boolean;
  minHeight: number; // meters e.g. 2.0 or 2.1
  sortBy: 'lots_desc' | 'lots_asc' | 'occupancy_asc' | 'rate_asc' | 'distance' | 'name';
}

export interface BackendConfig {
  backendMode: 'simulation' | 'custom_api';
  customApiUrl: string;
  refreshIntervalSeconds: number;
  lastSyncTime: string | null;
  status: 'idle' | 'syncing' | 'connected' | 'error';
  errorMessage?: string;
}
