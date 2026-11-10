import type { Request, Response } from 'express';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: {
    ltaKeyConfigured: boolean;
    nodeEnv: string;
  };
}

/**
 * Serverless / Express health check endpoint
 * GET /api/health
 */
export default async function handler(req: Request, res: Response) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const ltaKey =
    process.env.LTA_DATAMALL_API_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    '';

  const healthData: HealthResponse = {
    status: 'ok',
    service: 'singapore-carpark-tracker-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: {
      ltaKeyConfigured: Boolean(ltaKey && ltaKey.trim().length > 0),
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  };

  return res.status(200).json(healthData);
}
