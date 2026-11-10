import React, { useState } from 'react';
import { BackendConfig } from '../types/carpark';
import { fetchLiveCarparksFromBackend, saveStoredBackendConfig } from '../services/carparkService';
import { X, Plug, CheckCircle2, AlertCircle, Copy, Check, Server, RefreshCw } from 'lucide-react';

interface BackendConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BackendConfig;
  onUpdateConfig: (newConfig: BackendConfig) => void;
  onSyncBackend: () => void;
}

export const BackendConnectionModal: React.FC<BackendConnectionModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onSyncBackend,
}) => {
  if (!isOpen) return null;

  const [apiUrl, setApiUrl] = useState(config.customApiUrl);
  const [backendMode, setBackendMode] = useState<'simulation' | 'custom_api'>(config.backendMode);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleLtaJson = `{
  "odata.metadata": "https://datamall2.mytransport.sg/ltaodataservice/$metadata#CarParkAvailability",
  "value": [
    {
      "CarParkID": "ION-ORC",
      "Area": "Orchard",
      "Development": "ION Orchard Shopping Centre",
      "Location": "1.3040 103.8318",
      "AvailableLots": 184,
      "LotType": "C",
      "Agency": "LTA"
    },
    {
      "CarParkID": "HDB-PINN",
      "Area": "Chinatown",
      "Development": "The Pinnacle@Duxton (HDB)",
      "Location": "1.2778 103.8415",
      "AvailableLots": 198,
      "LotType": "C",
      "Agency": "HDB"
    }
  ]
}`;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing connection to ' + apiUrl + '...');

    const result = await fetchLiveCarparksFromBackend(apiUrl);

    if (result.success && result.data) {
      setTestStatus('success');
      setTestMessage(`Successfully connected! Received ${result.data.length} carpark records from backend.`);
    } else {
      setTestStatus('error');
      setTestMessage(
        result.error ||
          'Failed to connect. Ensure your backend server has CORS enabled and returns valid JSON.'
      );
    }
  };

  const handleSave = () => {
    const updated: BackendConfig = {
      ...config,
      backendMode,
      customApiUrl: apiUrl,
      status: testStatus === 'success' ? 'connected' : config.status,
    };
    onUpdateConfig(updated);
    saveStoredBackendConfig(updated);
    onClose();
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(sampleLtaJson);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Backend Connection & API Setup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your LTA DataMall proxy or custom Express/FastAPI server.
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

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Data Source Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBackendMode('simulation')}
                className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                  backendMode === 'simulation'
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Demo Live Simulation
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Realistic Singapore carparks with real-time lot fluctuations and tariffs.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBackendMode('custom_api')}
                className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                  backendMode === 'custom_api'
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Connected Backend API
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Polls your backend server or proxy URL for live government data.
                </div>
              </button>
            </div>
          </div>

          {/* Endpoint Input & Test */}
          {backendMode === 'custom_api' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Backend API Endpoint URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://your-api.com/api/carparks or /api/v1/carparks"
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing' || !apiUrl}
                    className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {testStatus === 'testing' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plug className="w-3.5 h-3.5" />
                    )}
                    <span>Test</span>
                  </button>
                </div>
              </div>

              {testStatus !== 'idle' && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                    testStatus === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : testStatus === 'error'
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                  {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                  <div>{testMessage}</div>
                </div>
              )}
            </div>
          )}

          {/* LTA DataMall Specification & Guidance */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Official Singapore LTA DataMall v2 API Schema
              </span>
              <button
                type="button"
                onClick={handleCopySample}
                className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy Sample'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              The front end automatically recognizes LTA DataMall endpoint structure (`/ltaodataservice/CarParkAvailabilityv2`).
            </p>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto border border-slate-800">
              {sampleLtaJson}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
