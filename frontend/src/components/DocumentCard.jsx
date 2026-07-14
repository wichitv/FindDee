import { Bookmark, Share2, FileText, Calendar, Globe, BadgeDollarSign, CreditCard, User, AlertTriangle, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import searchService from '../services/searchService';

const getDocumentStatus = (doc) => {
  // ถ้าไม่มีข้อมูลบริษัท/หมายเลข แต่มี _sheetName — ถือว่ามีข้อมูลจาก Excel
  const hasKeyFields = (doc.customer || doc.invoiceNumber) || doc._sheetName;
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

  // Determine category label and color from document type/source
  const getCategoryStyle = () => {
    const type = (document.documentType || document._sheetName || document.type || '').toLowerCase();
    if (type.includes('port') || type.includes('ท่าเรือ')) return { label: 'ท่าเรือ', bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200', dot: 'bg-cyan-500' };
    if (type.includes('buyer') || type.includes('ผู้ซื้อ')) return { label: 'ผู้ซื้อ', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-500' };
    if (type.includes('credit') || type.includes('สินเชื่อ')) return { label: 'สินเชื่อ', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' };
    if (type.includes('invoice') || type.includes('ใบแจ้งหนี้')) return { label: 'ใบแจ้งหนี้', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' };
    if (type.includes('document') || type.includes('เอกสาร')) return { label: 'เอกสาร', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' };
    return { label: type || 'ทั่วไป', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-400' };
  };
  const cat = getCategoryStyle();

  const hasFinancial = document.creditLimit != null || document.withdrawalAmount != null || document.remainingBalance != null || document.transactionNo != null;
  const hasBuyer = !!(document.buyerName || document.expiryDate);
  const descText = document.description || document.summary || document.content;

  return (
    <div className="bg-white border border-[#D9E8F7]/60 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">

      {/* ── Top color bar by category ── */}
      <div className={`h-1.5 w-full ${cat.dot}`} />

      <div className="p-7 space-y-5">

        {/* ── SECTION 1 : ข้อมูลทั่วไป ── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cat.bg} ${cat.text} ${cat.border}`}>
                <span className={`inline-block h-2 w-2 rounded-full ${cat.dot}`} />
                {cat.label}
              </span>
              <StatusBadge doc={document} />
            </div>
            <div className="flex shrink-0 gap-1.5 text-xs text-slate-400">
              {document.source && (
                <span className="flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5">
                  <Globe className="w-3 h-3" />{document.source}
                </span>
              )}
              {document.date && (
                <span className="flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5">
                  <Calendar className="w-3 h-3" />{formatDate(document.date)}
                </span>
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 leading-snug hover:text-[#034EA2] transition cursor-default">
            {document.title || document.invoiceNumber || document.customer || 'เอกสารไม่มีชื่อ'}
          </h3>

          {/* Customer / overdue / amount badges */}
          {(document.customer || document.overdueDays > 0 || document.amount !== undefined) && (
            <div className="flex flex-wrap gap-2">
              {document.customer && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D9E8F7] px-3 py-1 text-sm font-medium text-[#034EA2]">
                  <User className="w-3.5 h-3.5" />ลูกค้า: {document.customer}
                </span>
              )}
              {document.overdueDays > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-sm font-medium text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" />ค้างชำระ {document.overdueDays} วัน
                </span>
              )}
              {document.amount !== undefined && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-sm font-medium text-emerald-700">
                  <BadgeDollarSign className="w-3.5 h-3.5" />{Number(document.amount).toLocaleString('th-TH')} บาท
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── SECTION 2 : รายละเอียด ── */}
        {descText && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 space-y-1.5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Info className="w-3.5 h-3.5" />รายละเอียด
            </p>
            <p className="text-base leading-relaxed text-slate-700">{descText}</p>
          </div>
        )}

        {/* ── SECTION 3 : ข้อมูลการเงิน ── */}
        {hasFinancial && (
          <div className="rounded-xl border border-[#D9E8F7] bg-[#F4F9FF] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#D9E8F7] px-5 py-2.5 bg-[#EBF2FA]">
              <CreditCard className="w-4 h-4 text-[#034EA2]" />
              <span className="text-sm font-semibold text-[#034EA2]">ข้อมูลการเงิน</span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#D9E8F7] sm:grid-cols-4">
              {document.transactionNo != null && (
                <div className="bg-[#F4F9FF] px-4 py-3 text-center">
                  <p className="text-xs text-slate-400">เบิกครั้งที่</p>
                  <p className="mt-1 text-2xl font-black text-[#154194]">{document.transactionNo}</p>
                </div>
              )}
              {document.creditLimit != null && (
                <div className="bg-[#F4F9FF] px-4 py-3 text-center">
                  <p className="text-xs text-slate-400">วงเงิน (บาท)</p>
                  <p className="mt-1 text-base font-bold text-slate-700">{Number(document.creditLimit).toLocaleString('th-TH')}</p>
                </div>
              )}
              {document.withdrawalAmount != null && (
                <div className="bg-[#F4F9FF] px-4 py-3 text-center">
                  <p className="text-xs text-slate-400">ยอดเบิกกู้ (บาท)</p>
                  <p className="mt-1 text-base font-bold text-amber-700">{Number(document.withdrawalAmount).toLocaleString('th-TH')}</p>
                </div>
              )}
              {document.remainingBalance != null && (
                <div className="bg-[#F4F9FF] px-4 py-3 text-center">
                  <p className="text-xs text-slate-400">คงเหลือ (บาท)</p>
                  <p className={`mt-1 text-base font-bold ${
                    Number(document.remainingBalance) <= 0 ? 'text-red-600' :
                    Number(document.remainingBalance) < Number(document.creditLimit) * 0.2 ? 'text-amber-600' :
                    'text-emerald-700'
                  }`}>{Number(document.remainingBalance).toLocaleString('th-TH')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 4 : ข้อมูลผู้ซื้อ ── */}
        {hasBuyer && (
          <div className="rounded-xl border border-purple-100 bg-purple-50/40 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-purple-100 px-5 py-2.5 bg-purple-50">
              <User className="w-4 h-4 text-purple-700" />
              <span className="text-sm font-semibold text-purple-700">ข้อมูลผู้ซื้อ</span>
            </div>
            <div className="grid grid-cols-2 gap-4 px-5 py-4">
              {document.buyerName && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Buyer Name</p>
                  <p className="text-base font-semibold text-slate-800">{document.buyerName}</p>
                </div>
              )}
              {document.expiryDate && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Expiry Date</p>
                  <p className="text-base font-semibold text-slate-800">{formatDate(document.expiryDate)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 5 : AI สรุป ── */}
        {(document.summary || document.aiSummary) && document.summary !== descText && (
          <div>
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#034EA2] hover:text-[#154194] transition"
            >
              {showSummary ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              AI สรุปผล
            </button>
            {showSummary && (
              <div className="mt-2 rounded-xl border-l-4 border-[#034EA2] bg-[#EBF2FA] px-5 py-4 text-base text-slate-700 leading-relaxed">
                {document.summary || document.aiSummary}
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 6 : Source Trace ── */}
        <div>
          <button
            onClick={handleSourceTrace}
            className={`flex items-center gap-1.5 text-sm font-semibold transition ${
              showSourceTrace ? 'text-indigo-600 hover:text-indigo-700' : 'text-slate-400 hover:text-indigo-600'
            }`}
          >
            {showSourceTrace ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            🔍 Source Trace
          </button>

          {showSourceTrace && (
            <div className="mt-3 rounded-xl border border-indigo-100 overflow-hidden">
              {sourceTraceLoading && (
                <div className="px-5 py-4 text-sm text-slate-400">⏳ กำลังตรวจสอบแหล่งข้อมูล...</div>
              )}
              {sourceTraceError && (
                <div className="px-5 py-4 text-sm text-red-600">❌ {sourceTraceError}</div>
              )}
              {sourceTrace && sourceTrace.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-indigo-50 border-b border-indigo-100">
                      <th className="px-4 py-2.5 text-left font-semibold text-indigo-700">ข้อมูล</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-indigo-700">ผลลัพธ์</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-indigo-700">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourceTrace.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-700">{row.label}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            row.severity === 'danger'  ? 'bg-red-100 text-red-700' :
                            row.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                                                         'bg-green-100 text-green-700'
                          }`}>
                            {row.severity === 'danger' ? '🔴' : row.severity === 'warning' ? '⚠️' : '✅'}
                            {row.result}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">{row.sourceLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm ${
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
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Share2 className="w-4 h-4" />
            แชร์
          </button>

          {document.url && (
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-[#D9E8F7] hover:text-[#034EA2] transition-all flex items-center justify-center gap-2 text-sm"
            >
              <FileText className="w-4 h-4" />
              ดูเต็ม
            </a>
          )}
        </div>

      </div>
    </div>
  );
}

