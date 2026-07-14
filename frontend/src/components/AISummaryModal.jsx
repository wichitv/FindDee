/**
 * AISummaryModal — แสดงผล AI Batch Summary จาก OpenRouter
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import aiSummaryService from '../services/aiSummaryService';

const StatCard = ({ label, value, accent = 'border-[#B0CEEE] bg-[#EBF2FA]' }) => (
  <div className={`rounded-lg border p-3 ${accent}`}>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
  </div>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  accent: PropTypes.string
};

const renderSummaryLines = (summary) =>
  summary.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('•')) {
      return (
        <li key={i} className="ml-2 flex items-start gap-2 text-sm text-slate-700">
          <span className="mt-0.5 text-[#034EA2]">•</span>
          <span>{trimmed.slice(1).trim()}</span>
        </li>
      );
    }
    if (trimmed.startsWith('→')) {
      return (
        <li key={i} className="ml-2 flex items-start gap-2 text-sm text-orange-700">
          <span className="mt-0.5 font-bold text-orange-500">→</span>
          <span>{trimmed.slice(1).trim()}</span>
        </li>
      );
    }
    return (
      <p key={i} className="text-sm font-semibold text-slate-800">
        {trimmed}
      </p>
    );
  });

const AISummaryModal = ({ isOpen, onClose, data = [] }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !data || data.length === 0) return;

    let cancelled = false;
    setLoading(true);
    setResult(null);
    setError(null);

    aiSummaryService
      .summarizeBatch(data)
      .then((res) => {
        if (!cancelled) setResult(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, data]);

  if (!isOpen) return null;

  const stats = result?.stats;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[#034EA2] to-[#154194] px-6 py-4 text-white">
          <div>
            <h2 className="text-lg font-bold">🤖 AI สรุปผลข้อมูลลูกค้า</h2>
            <p className="mt-0.5 text-xs text-blue-100">
              {result?.model ? `Model: ${result.model}` : 'กำลังประมวลผลด้วย AI ผ่าน OpenRouter'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition hover:bg-white/20"
            aria-label="ปิด"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#B0CEEE] border-t-[#034EA2]" />
              <p className="text-sm text-slate-500">AI กำลังวิเคราะห์ข้อมูล {data.length} รายการ...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-700">⚠️ เกิดข้อผิดพลาด</p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
              <p className="mt-2 text-xs text-red-400">
                ตรวจสอบให้แน่ใจว่าตั้งค่า OPENROUTER_API_KEY ใน backend/.env แล้ว
              </p>
            </div>
          )}

          {/* Result */}
          {!loading && result && (
            <>
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard
                    label="รายการทั้งหมด"
                    value={stats.totalItems}
                    accent="border-[#B0CEEE] bg-[#EBF2FA]"
                  />
                  <StatCard
                    label="ยอดรวม (บาท)"
                    value={Number(stats.totalAmount).toLocaleString('th-TH')}
                    accent="border-green-200 bg-green-50"
                  />
                  <StatCard
                    label="ความเร่งด่วนสูง"
                    value={stats.highPriorityCount}
                    accent="border-orange-200 bg-orange-50"
                  />
                  <StatCard
                    label="วิกฤต"
                    value={stats.criticalCount}
                    accent="border-red-200 bg-red-50"
                  />
                </div>
              )}

              {/* AI Text Summary */}
              <div className="rounded-lg border border-[#D9E8F7] bg-[#EBF2FA]/50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#034EA2]">
                  ผลการวิเคราะห์โดย AI
                </p>
                <ul className="space-y-2">{renderSummaryLines(result.summary)}</ul>
              </div>

              {/* Footer metadata */}
              <p className="text-right text-xs text-gray-400">
                สร้างเมื่อ{' '}
                {new Date(result.generatedAt).toLocaleString('th-TH', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="rounded-b-2xl border-t border-gray-100 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

AISummaryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.object)
};

export default AISummaryModal;

