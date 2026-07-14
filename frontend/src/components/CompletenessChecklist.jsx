import React from 'react';

const SOURCE_LABELS = {
  saction: 'Sanction',
  buyerCheck: 'Buyer Check',
  cws: 'CWS',
  amlo: 'AMLO',
  tdr: 'TDR',
  as400: 'AS400'
};

const SOURCE_KEYS = ['saction', 'buyerCheck', 'cws', 'amlo', 'tdr', 'as400'];

const CompletenessChecklist = ({
  sourceChecklist = {},
  sources = {},
  completenessStatus,
  simulateFailures = [],
  onToggleSimulate
}) => {
  const checklistReady = Object.keys(sourceChecklist).length > 0;

  return (
    <div className="rounded-[2rem] border border-[#D9E8F7] bg-white/90 p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">📋 Completeness Checklist</h2>
          <p className="text-sm text-slate-500 mt-0.5">ตรวจสอบความครบถ้วนของแหล่งข้อมูลก่อน AI สรุป</p>
        </div>
        {simulateFailures.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
            🔧 โหมดจำลอง {simulateFailures.length} แหล่ง
          </span>
        )}
      </div>

      {/* Source rows */}
      <div className="space-y-2">
        {SOURCE_KEYS.map((key) => {
          const label = SOURCE_LABELS[key];
          const enabled = sources[key] !== false;
          const check = sourceChecklist[key];
          const isSimulating = simulateFailures.includes(key);

          let icon, rowBg, statusText, statusColor;

          if (!enabled) {
            icon = <span className="text-gray-400 text-base font-bold">—</span>;
            rowBg = 'bg-gray-50 border border-gray-100';
            statusText = 'ไม่ได้เปิดใช้';
            statusColor = 'text-gray-400';
          } else if (!checklistReady) {
            icon = <span className="text-gray-400 text-base">⏳</span>;
            rowBg = 'bg-gray-50 border border-gray-100';
            statusText = 'รอดึงข้อมูล...';
            statusColor = 'text-gray-400';
          } else if (check?.status === 'success') {
            icon = <span className="text-base">✅</span>;
            rowBg = 'bg-green-50 border border-green-100';
            statusText = `ดึงข้อมูลสำเร็จ (${check.recordCount} รายการ)`;
            statusColor = 'text-green-700';
          } else if (check?.status === 'failed') {
            icon = <span className="text-base">❌</span>;
            rowBg = 'bg-red-50 border border-red-100';
            statusText = check.message || 'ดึงข้อมูลไม่สำเร็จ';
            statusColor = 'text-red-700 font-semibold';
          } else {
            icon = <span className="text-gray-400 text-base font-bold">—</span>;
            rowBg = 'bg-gray-50 border border-gray-100';
            statusText = 'ข้าม';
            statusColor = 'text-gray-400';
          }

          return (
            <div
              key={key}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${rowBg}`}
            >
              <span className="w-6 flex justify-center">{icon}</span>
              <span className="font-semibold text-slate-700 w-28 shrink-0">{label}</span>
              <span className={`flex-1 text-sm ${statusColor}`}>{statusText}</span>
              {enabled && onToggleSimulate && (
                <button
                  onClick={() => onToggleSimulate(key)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    isSimulating
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 ring-1 ring-rose-300'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title={isSimulating ? 'คลิกเพื่อยกเลิกการจำลอง Error' : 'คลิกเพื่อจำลอง Error ในรอบ Sync ถัดไป'}
                >
                  🔧 {isSimulating ? 'ยกเลิก' : 'จำลอง Error'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall status banner — shows after checklist is populated */}
      {checklistReady && (
        <div
          className={`rounded-xl border px-4 py-3 text-center font-semibold text-sm ${
            completenessStatus === 'complete'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {completenessStatus === 'complete'
            ? '✅ ข้อมูลครบถ้วนจากทุกแหล่ง — พร้อมให้ AI สรุป'
            : '⚠️ สถานะ: ต้องตรวจสอบเพิ่มเติม — บางแหล่งข้อมูลดึงไม่สำเร็จ'}
        </div>
      )}

      {/* Simulate hint */}
      {simulateFailures.length > 0 && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-600">
          🔧 <strong>จำลอง Error:</strong>{' '}
          {simulateFailures.map((k) => SOURCE_LABELS[k]).join(', ')} จะถูกจำลองว่าดึงข้อมูลไม่สำเร็จในรอบ Sync ถัดไป
        </div>
      )}
    </div>
  );
};

export default CompletenessChecklist;

