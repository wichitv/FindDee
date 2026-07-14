/**
 * SyncButton - One-Click Sync Button Component
 * Large button that triggers the entire pull-process-push workflow
 */

import React, { useState } from 'react';
import syncService from '../services/syncService';

const SyncButton = ({ sources = {}, onSyncStart, onSyncProgress, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Start sync operation
      const response = await syncService.startSync(sources);

      if (response.success) {
        const syncId = response.syncId;
        onSyncStart?.(syncId);

        // Poll for progress
        syncService.pollSyncStatus(syncId, 500, (statusData) => {
          onSyncProgress?.(statusData);

          // Auto-stop loading when done
          if (statusData.status === 'completed' || statusData.status === 'error') {
            setIsLoading(false);
          }
        });
      } else {
        throw new Error(response.error || 'Sync start failed');
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button
        onClick={handleSync}
        disabled={isLoading || disabled}
        className={`
          w-32 h-32 rounded-full text-white font-bold text-lg
          transition-all duration-300 transform hover:scale-105
          flex items-center justify-center shadow-lg
          ${isLoading 
            ? 'bg-[#3281D1] opacity-75 cursor-not-allowed animate-pulse' 
            : 'bg-gradient-to-r from-[#034EA2] to-[#3281D1] hover:shadow-xl active:scale-95'
          }
        `}
        title="Click to start Pull → Process → Push workflow"
      >
        <div className="text-center">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-white mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs">Syncing...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1">🔄</span>
              <span className="text-sm">Sync Now</span>
            </div>
          )}
        </div>
      </button>

      {error && (
        <div className="text-red-600 text-sm font-semibold bg-red-50 px-4 py-2 rounded">
          ❌ {error}
        </div>
      )}

      <p className="text-gray-600 text-sm text-center max-w-xs">
        Click the button to start:<br />
        <span className="font-semibold">Pull</span> data from all sources →
        <span className="font-semibold">Process</span> with AI →
        <span className="font-semibold">Push</span> to destinations
      </p>
    </div>
  );
};

export default SyncButton;

