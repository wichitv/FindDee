import { useState, useMemo } from 'react';

const SOURCE_CONFIG = [
  {
    key: 'saction',
    label: 'สถานะ Sanction',
    sourceLabel: 'Sanction Screening',
    matchSource: (s) => String(s).toLowerCase().includes('saction') || String(s).toLowerCase().includes('sanction'),
    getResult: (records) => {
      const high = records.filter((r) => r.status === 'High Risk').length;
      const med  = records.filter((r) => r.status === 'Medium Risk').length;
      if (high > 0) return { text: `พบรายชื่อเสี่ยงสูง ${high} รายการ`, severity: 'danger' };
      if (med > 0)  return { text: `ต้องตรวจสอบ ${med} รายการ`, severity: 'warning' };
      return { text: 'ไม่พบรายชื่อ', severity: 'safe' };
    }
  },
  {
    key: 'buyerCheck',
    label: 'Buyer Check',
    sourceLabel: 'Buyer Check',
    matchSource: (s) => String(s).toLowerCase().includes('buyer'),
    getResult: (records) => {
      const ok  = records.filter((r) => r.status === 'Verified').length;
      const rev = records.filter((r) => r.status === 'Needs Review').length;
      if (ok > 0 && rev > 0) return { text: `ผ่าน ${ok} / ต้องตรวจสอบ ${rev} รายการ`, severity: 'warning' };
      if (rev > 0) return { text: `ต้องตรวจสอบ ${rev} รายการ`, severity: 'warning' };
      return { text: `ผ่าน ${ok} รายการ`, severity: 'safe' };
    }
  },
  {
    key: 'cws',
    label: 'CWS',
    sourceLabel: 'CWS',
    matchSource: (s) => String(s).toLowerCase() === 'cws',
    getResult: (records) => {
      const bad = records.filter((r) => !['Active Credit', 'Normal'].includes(r.status)).length;
      if (bad > 0) return { text: `ผิดปกติ ${bad} รายการ`, severity: 'warning' };
      return { text: 'Watchlist ปกติ', severity: 'safe' };
    }
  },
  {
    key: 'amlo',
    label: 'AMLO',
    sourceLabel: 'AMLO',
    matchSource: (s) => String(s).toLowerCase() === 'amlo',
    getResult: (records) => {
      const flagged = records.filter((r) => r.status === 'Flagged').length;
      if (flagged > 0) return { text: `พบข้อมูลเสี่ยง ${flagged} รายการ`, severity: 'danger' };
      return { text: 'ไม่พบข้อมูลเสี่ยง', severity: 'safe' };
    }
  },
  {
    key: 'tdr',
    label: 'TDR',
    sourceLabel: 'TDR',
    matchSource: (s) => String(s).toLowerCase() === 'tdr',
    getResult: (records) => {
      const dupes = records.filter((r) => r.status === 'Duplicate').length;
      if (dupes > 0) return { text: `พบเอกสารซ้ำ ${dupes} รายการ`, severity: 'danger' };
      return { text: 'ไม่พบเอกสารซ้ำ', severity: 'safe' };
    }
  },
  {
    key: 'as400',
    label: 'AS400',
    sourceLabel: 'AS400',
    matchSource: (s) => String(s).toLowerCase() === 'as400',
    getResult: (records) => {
      const dupes = records.filter((r) => r.status === 'Duplicate').length;
      if (dupes > 0) return { text: `พบ Ticket ซ้ำ ${dupes} รายการ`, severity: 'danger' };
      return { text: 'ไม่พบ Ticket ซ้ำ', severity: 'safe' };
    }
  }
];

const SEVERITY_STYLE = {
  danger:  { row: 'bg-red-50',    badge: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-500' },
  warning: { row: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  safe:    { row: 'bg-green-50',  badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  failed:  { row: 'bg-red-50',    badge: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-400' },
  skipped: { row: 'bg-gray-50',   badge: 'bg-gray-100 text-gray-400 border-gray-200', dot: 'bg-gray-300' }
};

const DetailRow = ({ records }) => {
  if (!records || records.length === 0) return null;
  return (
    <div className="px-4 pb-3">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2 text-left font-semibold text-gray-600">รายการ</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600">ประเภท</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600">สถานะ</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600">รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-[#EBF2FA]">
                <td className="px-3 py-2 font-medium text-slate-700">
                  {r.customer || r.documentNo || r.ticketNo || `รายการ ${i + 1}`}
                </td>
                <td className="px-3 py-2 text-slate-500">{r.type || '—'}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    ['High Risk', 'Flagged', 'Duplicate'].includes(r.status)
                      ? 'bg-red-100 text-red-700'
                      : ['Verified', 'Active Credit'].includes(r.status)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-500">{r.detail || r.aiSummary || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SourceTraceTable = ({ processedData = [], sourceChecklist = {}, sources = {} }) => {
  const [expandedKeys, setExpandedKeys] = useState(new Set());

  const toggleExpand = (key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const rows = useMemo(() => {
    return SOURCE_CONFIG.map((cfg) => {
      const check = sourceChecklist[cfg.key];
      const enabled = sources[cfg.key] !== false;

      // Source not enabled
      if (!enabled || check?.status === 'skipped') {
        return { ...cfg, severity: 'skipped', resultText: 'ไม่ได้เปิดใช้', records: [] };
      }

      // Source pull failed
      if (check?.status === 'failed') {
        return { ...cfg, severity: 'failed', resultText: check.message || 'ดึงข้อมูลไม่สำเร็จ', records: [] };
      }

      // Match records for this source
      const records = processedData.filter((item) => cfg.matchSource(item.source));
      const result = records.length > 0
        ? cfg.getResult(records)
        : { text: 'ไม่มีข้อมูลในระบบ', severity: 'safe' };

      return { ...cfg, severity: result.severity, resultText: result.text, records };
    });
  }, [processedData, sourceChecklist, sources]);

  const hasAnyData = Object.keys(sourceChecklist).length > 0;

  return (
    <div className="rounded-[2rem] border border-[#D9E8F7] bg-white/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#D9E8F7]">
        <h2 className="text-lg font-semibold text-slate-900">🔍 Source Trace</h2>
        <p className="text-sm text-slate-500 mt-0.5">แหล่งที่มาของข้อมูลที่ AI ใช้ในการสรุปผล</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left font-semibold text-gray-700 w-40">ข้อมูล</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">ผลลัพธ์</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 w-48">Source</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-700 w-32">รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const style = SEVERITY_STYLE[row.severity] || SEVERITY_STYLE.safe;
              const isExpanded = expandedKeys.has(row.key);
              const hasRecords = row.records.length > 0;

              return (
                <>
                  <tr
                    key={row.key}
                    className={`border-b border-gray-100 transition-colors ${style.row}`}
                  >
                    {/* ข้อมูล */}
                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                      {row.label}
                    </td>

                    {/* ผลลัพธ์ */}
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${style.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {row.resultText}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-6 py-3.5 text-slate-500 font-medium">
                      {row.sourceLabel}
                    </td>

                    {/* ปุ่มดูรายละเอียด */}
                    <td className="px-6 py-3.5 text-center">
                      {hasRecords ? (
                        <button
                          onClick={() => toggleExpand(row.key)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                            isExpanded
                              ? 'bg-[#D9E8F7] text-[#034EA2] hover:bg-[#B0CEEE]'
                              : 'bg-gray-100 text-gray-600 hover:bg-[#EBF2FA] hover:text-[#034EA2]'
                          }`}
                        >
                          {isExpanded ? '▲ ซ่อน' : '▼ ดูรายละเอียด'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded detail rows */}
                  {isExpanded && hasRecords && (
                    <tr key={`${row.key}-detail`} className="border-b border-gray-200 bg-gray-50">
                      <td colSpan={4} className="p-0">
                        <DetailRow records={row.records} />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {!hasAnyData && (
        <div className="px-6 py-10 text-center text-sm text-slate-400">
          กด <strong>Sync Now</strong> เพื่อเริ่มดึงข้อมูลและแสดงผลที่นี่
        </div>
      )}
    </div>
  );
};

export default SourceTraceTable;

