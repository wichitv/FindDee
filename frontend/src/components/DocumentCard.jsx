import { Bookmark, Share2, FileText, Calendar, Globe, BadgeDollarSign } from 'lucide-react';
import { useState } from 'react';
import searchService from '../services/searchService';

const getDocumentStatus = (doc) => {
  const hasKeyFields = (doc.customer || doc.invoiceNumber) && Number(doc.amount) > 0;
  if (!hasKeyFields) {
    return { label: 'ไม่มีข้อมูลเพียงพอ', icon: '❓', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' };
  }
  const overdueDays = Number(doc.overdueDays) || 0;
  const amount = Number(doc.amount) || 0;
  const status = (doc.status || '').toLowerCase();
  if (status === 'critical' || overdueDays >= 30 || (overdueDays >= 15 && amount >= 100000)) {
    return { label: 'พบความเสี่ยง', icon: '🔴', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
  }
  if (status === 'overdue' || overdueDays > 0) {
    return { label: 'ต้องตรวจเพิ่ม', icon: '⚠️', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
  }
  return { label: 'ข้อมูลครบ', icon: '✅', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
};

const StatusBadge = ({ doc }) => {
  const s = getDocumentStatus(doc);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${s.bg} ${s.text} ${s.border}`}>
      <span>{s.icon}</span>
      {s.label}
    </span>
  );
};

export default function DocumentCard({ document, onSave, onShare }) {
  const [isSaved, setIsSaved] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSourceTrace, setShowSourceTrace] = useState(false);
  const [sourceTrace, setSourceTrace] = useState(null);
  const [sourceTraceLoading, setSourceTraceLoading] = useState(false);
  const [sourceTraceError, setSourceTraceError] = useState(null);

  const handleSourceTrace = async () => {
    if (showSourceTrace) { setShowSourceTrace(false); return; }
    setShowSourceTrace(true);
    if (sourceTrace) return; // already loaded
    setSourceTraceLoading(true);
    setSourceTraceError(null);
    try {
      const res = await searchService.getSourceTrace(document.id);
      setSourceTrace(res.data?.trace || []);
    } catch (err) {
      setSourceTraceError(err.message);
    } finally {
      setSourceTraceLoading(false);
    }
  };

  const handleSave = () => {
    onSave?.(document);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleShare = () => {
    onShare?.(document);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white border border-[#D9E8F7]/50 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-6 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 hover:text-[#034EA2] transition">
          {document.title || document.invoiceNumber || document.customer || 'เอกสารไม่มีชื่อ'}
        </h3>

        <div className="flex flex-wrap gap-2 items-center text-sm text-slate-500">
          {document.source && (
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span className="line-clamp-1">{document.source}</span>
            </div>
          )}
          {document.date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(document.date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Financial summary grid */}
      {(document.creditLimit != null || document.withdrawalAmount != null || document.remainingBalance != null || document.transactionNo != null) && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl border border-[#D9E8F7] bg-[#F7FAFD] px-4 py-3 sm:grid-cols-4">
          {document.transactionNo != null && (
            <div className="text-center">
              <p className="text-xs text-slate-400">เบิกครั้งที่</p>
              <p className="mt-0.5 text-lg font-black text-[#154194]">{document.transactionNo}</p>
            </div>
          )}
          {document.creditLimit != null && (
            <div className="text-center">
              <p className="text-xs text-slate-400">วงเงิน (บาท)</p>
              <p className="mt-0.5 text-sm font-bold text-slate-700">{Number(document.creditLimit).toLocaleString('th-TH')}</p>
            </div>
          )}
          {document.withdrawalAmount != null && (
            <div className="text-center">
              <p className="text-xs text-slate-400">ยอดเบิกกู้ (บาท)</p>
              <p className="mt-0.5 text-sm font-bold text-amber-700">{Number(document.withdrawalAmount).toLocaleString('th-TH')}</p>
            </div>
          )}
          {document.remainingBalance != null && (
            <div className="text-center">
              <p className="text-xs text-slate-400">คงเหลือ (บาท)</p>
              <p className={`mt-0.5 text-sm font-bold ${
                Number(document.remainingBalance) <= 0 ? 'text-red-600' :
                Number(document.remainingBalance) < Number(document.creditLimit) * 0.2 ? 'text-amber-600' :
                'text-emerald-700'
              }`}>{Number(document.remainingBalance).toLocaleString('th-TH')}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <StatusBadge doc={document} />
        {document.customer && (
          <span className="rounded-full bg-[#D9E8F7] px-3 py-1 text-sm font-medium text-[#034EA2]">
            ลูกค้า: {document.customer}
          </span>
        )}
        {document.overdueDays !== undefined && document.overdueDays > 0 && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
            ค้างชำระ {document.overdueDays} วัน
          </span>
        )}
        {document.amount !== undefined && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 flex items-center gap-1">
            <BadgeDollarSign className="h-4 w-4" />
            {Number(document.amount).toLocaleString('th-TH')} บาท
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-slate-600 line-clamp-3 text-sm leading-relaxed">
        {document.description || document.summary || document.content || 'ไม่มีรายละเอียด'}
      </p>

      {/* Summary Toggle */}
      {(document.summary || document.aiSummary) && (
        <div>
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="text-sm text-[#034EA2] hover:text-[#154194] font-medium transition"
          >
            {showSummary ? '▼ ปิดสรุป' : '▶ ดูสรุป'}
          </button>
          {showSummary && (
            <div className="mt-3 p-3 bg-[#EBF2FA] rounded text-sm text-slate-700 border-l-4 border-[#034EA2]">
              {document.summary || document.aiSummary}
            </div>
          )}
        </div>
      )}

      {/* Source Trace */}
      <div>
        <button
          onClick={handleSourceTrace}
          className={`text-sm font-medium transition flex items-center gap-1 ${
            showSourceTrace ? 'text-indigo-600 hover:text-indigo-700' : 'text-slate-500 hover:text-indigo-600'
          }`}
        >
          🔍 {showSourceTrace ? '▼ ซ่อน Source Trace' : '▶ Source Trace'}
        </button>

        {showSourceTrace && (
          <div className="mt-3 rounded-lg border border-indigo-100 overflow-hidden">
            {sourceTraceLoading && (
              <div className="px-4 py-3 text-sm text-slate-400">⏳ กำลังตรวจสอบแหล่งข้อมูล...</div>
            )}
            {sourceTraceError && (
              <div className="px-4 py-3 text-sm text-red-600">❌ {sourceTraceError}</div>
            )}
            {sourceTrace && sourceTrace.length > 0 && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-indigo-50 border-b border-indigo-100">
                    <th className="px-3 py-2 text-left font-semibold text-indigo-700">ข้อมูล</th>
                    <th className="px-3 py-2 text-left font-semibold text-indigo-700">ผลลัพธ์</th>
                    <th className="px-3 py-2 text-left font-semibold text-indigo-700">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceTrace.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-700">{row.label}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          row.severity === 'danger'  ? 'bg-red-100 text-red-700' :
                          row.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                                                       'bg-green-100 text-green-700'
                        }`}>
                          {row.severity === 'danger' ? '🔴' : row.severity === 'warning' ? '⚠️' : '✅'}
                          {row.result}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-400">{row.sourceLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            isSaved
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-[#D9E8F7] hover:text-[#034EA2]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          {isSaved ? 'บันทึกแล้ว' : 'บันทึก'}
        </button>
        
        <button
          onClick={handleShare}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          แชร์
        </button>

        {document.url && (
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-[#D9E8F7] hover:text-[#034EA2] transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            ดูเต็ม
          </a>
        )}
      </div>
    </div>
  );
}

