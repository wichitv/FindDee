/**
 * SyncProgressIndicator - Shows progress through the sync workflow
 */

import React from 'react';

const SyncProgressIndicator = ({ syncStatus }) => {
  const phases = [
    { name: 'Pull', description: 'Fetching data from sources', emoji: '⬇️' },
    { name: 'Process', description: 'AI processing & filtering', emoji: '⚙️' },
    { name: 'Push', description: 'Sending to destinations', emoji: '⬆️' },
    { name: 'Complete', description: 'All done!', emoji: '✅' }
  ];

  const getPhaseIndex = () => {
    if (!syncStatus) return -1;
    if (syncStatus.status === 'pulling') return 0;
    if (syncStatus.status === 'processing') return 1;
    if (syncStatus.status === 'pushing') return 2;
    if (syncStatus.status === 'completed') return 3;
    return -1;
  };

  const currentPhase = getPhaseIndex();
  const progress = syncStatus?.progress || 0;

  return (
    <div className="w-full space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-[#034EA2]">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#034EA2] to-[#3281D1] h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Phase Steps */}
      <div className="grid grid-cols-4 gap-2">
        {phases.map((phase, index) => (
          <div key={index} className="text-center">
            <div
              className={`
                w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl
                transition-all duration-300
                ${index <= currentPhase
                  ? 'bg-[#034EA2] text-white shadow-lg scale-110'
                  : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {phase.emoji}
            </div>
            <p className="text-xs font-semibold mt-2 text-gray-700">{phase.name}</p>
            <p className="text-xs text-gray-500">{phase.description}</p>
          </div>
        ))}
      </div>

      {/* Status Badge */}
      {syncStatus && (
        <div className="flex justify-center">
          <div
            className={`
              px-4 py-2 rounded-full text-sm font-semibold
              ${syncStatus.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : syncStatus.status === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-[#D9E8F7] text-[#034EA2]'
              }
            `}
          >
            {syncStatus.status.toUpperCase()}
            {syncStatus.status === 'completed' && ` - ${syncStatus.processedData?.length || 0} items processed`}
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncProgressIndicator;

