import type { Request, Response } from 'express';

const LTA_DATAMALL_BASE_URL =
  'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export interface LTACarparkRecord {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // "latitude longitude" e.g. "1.3040 103.8318"
  AvailableLots: number;
  LotType: 'C' | 'Y' | 'H'; // C: Cars, Y: Motorcycles, H: Heavy Vehicles
  Agency: 'HDB' | 'LTA' | 'URA' | string;
}

export interface LTACarparkApiResponse {
  'odata.metadata'?: string;
  value: LTACarparkRecord[];
  totalRecords?: number;
  cached?: boolean;
  timestamp?: string;
  keyConfigured?: boolean;
  message?: string;
}

// In-memory cache to prevent hammering LTA DataMall rate limits
interface CacheEntry {
  data: LTACarparkRecord[];
  timestamp: number;
}

const cache: { [key: string]: CacheEntry } = {};
const CACHE_TTL_MS = 30 * 1000; // 30 seconds cache TTL

/**
 * Serverless / Express endpoint to fetch live carpark lots from LTA DataMall
 * GET /api/carparkavailability
 */
export default async function handler(req: Request, res: Response) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, AccountKey, x-account-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only GET requests are supported.',
    });
  }

  // Retrieve AccountKey from environment variable or optional header
  const accountKey =
    (req.headers['accountkey'] as string) ||
    (req.headers['x-account-key'] as string) ||
    process.env.LTA_DATAMALL_API_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    '';

  // Check if API key is present
  if (!accountKey || accountKey.trim().length === 0) {
    return res.status(200).json({
      'odata.metadata': `${LTA_DATAMALL_BASE_URL}/$metadata#CarParkAvailability`,
      value: [],
      totalRecords: 0,
      keyConfigured: false,
      message:
        'LTA DataMall AccountKey is not configured. Please set the LTA_DATAMALL_API_KEY environment variable.',
      timestamp: new Date().toISOString(),
    });
  }

  const query = req.query || {};
  const skip = query.skip || query.$skip;
  const agency = query.agency ? String(query.agency).toUpperCase() : null;
  const lotType = query.lotType ? String(query.lotType).toUpperCase() : null;
  const area = query.area ? String(query.area).toLowerCase() : null;
  const fetchAll = query.fetchAll === 'true' || query.all === 'true' || skip === undefined;

  const cacheKey = `lta_carparks_${agency || 'all'}_${lotType || 'all'}_${area || 'all'}_skip_${skip || '0'}_all_${fetchAll}`;

  // Check in-memory cache
  const cached = cache[cacheKey];
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return res.status(200).json({
      'odata.metadata': `${LTA_DATAMALL_BASE_URL}/$metadata#CarParkAvailability`,
      value: cached.data,
      totalRecords: cached.data.length,
      cached: true,
      keyConfigured: true,
      timestamp: new Date(cached.timestamp).toISOString(),
    });
  }

  try {
    let records: LTACarparkRecord[] = [];

    if (fetchAll) {
      // LTA returns max 500 records per call. Paginate up to 4 batches (2,000 records) to cover all SG carparks
      let currentSkip = 0;
      let hasMore = true;
      const MAX_PAGES = 5;
      let pageCount = 0;

      while (hasMore && pageCount < MAX_PAGES) {
        const url = `${LTA_DATAMALL_BASE_URL}?$skip=${currentSkip}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            AccountKey: accountKey.trim(),
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(
            `LTA DataMall responded with HTTP status ${response.status}: ${response.statusText}`
          );
        }

        const data: any = await response.json();
        const batch: LTACarparkRecord[] = data.value || [];

        records.push(...batch);

        if (batch.length < 500) {
          hasMore = false;
        } else {
          currentSkip += 500;
          pageCount += 1;
        }
      }
    } else {
      // Single page fetch using specified skip
      const skipParam = Number(skip) || 0;
      const url = `${LTA_DATAMALL_BASE_URL}?$skip=${skipParam}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          AccountKey: accountKey.trim(),
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `LTA DataMall responded with HTTP status ${response.status}: ${response.statusText}`
        );
      }

      const data: any = await response.json();
      records = data.value || [];
    }

    // Apply optional server-side filtering
    if (agency) {
      records = records.filter((r) => r.Agency?.toUpperCase() === agency);
    }
    if (lotType) {
      records = records.filter((r) => r.LotType?.toUpperCase() === lotType);
    }
    if (area) {
      records = records.filter((r) => r.Area?.toLowerCase().includes(area));
    }

    // Cache results
    cache[cacheKey] = {
      data: records,
      timestamp: now,
    };

    return res.status(200).json({
      'odata.metadata': `${LTA_DATAMALL_BASE_URL}/$metadata#CarParkAvailability`,
      value: records,
      totalRecords: records.length,
      cached: false,
      keyConfigured: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching from LTA DataMall:', error);
    return res.status(502).json({
      error: 'Bad Gateway',
      message: error.message || 'Failed to fetch live data from LTA DataMall.',
      keyConfigured: true,
      timestamp: new Date().toISOString(),
    });
  }
}
