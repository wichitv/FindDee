/**
 * SyncDashboard Page - Main page for AI Data Sync system
 * Features: One-click sync button + AI smart summary table
 */

import React, { useState, useCallback } from 'react';
import SyncButton from '../components/SyncButton';
import SyncProgressIndicator from '../components/SyncProgressIndicator';
import SmartSummaryTable from '../components/SmartSummaryTable';
import DataSourceConfig from '../components/DataSourceConfig';
import CompletenessChecklist from '../components/CompletenessChecklist';
import FileUploadPanel from '../components/FileUploadPanel';
import syncService from '../services/syncService';

const SyncDashboardPage = ({ onNavigate, user, onLogout }) => {
  const [currentSyncId, setCurrentSyncId] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [processedData, setProcessedData] = useState([]);
  const [pushStatus, setPushStatus] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [simulateFailures, setSimulateFailures] = useState([]);
  const [sources, setSources] = useState({
    saction: true,
    buyerCheck: true,
    cws: true,
    amlo: true,
    tdr: true,
    as400: true,
    websites: true,
    companyApis: true
  });

  const handleToggleSimulate = useCallback((key) => {
    setSimulateFailures((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleSyncStart = useCallback((syncId) => {
    setCurrentSyncId(syncId);
    setSyncStatus({ status: 'pulling', progress: 0, logs: [] });
    setProcessedData([]);
    setPushStatus(null);
  }, []);

  const handleSyncProgress = useCallback(async (statusData) => {
    setSyncStatus(statusData);

    if (statusData.status === 'completed' && statusData.processedData) {
      const enrichedData = statusData.processedData.map((item) => ({
        ...item,
        aggregationSummary: statusData.aggregationSummary || null
      }));
      setProcessedData(enrichedData);
    }
  }, []);

  const handlePushData = async (selectedData) => {
    if (!currentSyncId) return;

    try {
      setPushStatus({ status: 'pushing', message: 'กำลังส่งข้อมูลไปยังปลายทาง...' });

      const response = await syncService.pushData(currentSyncId, {
        saction: sources.saction,
        buyerCheck: sources.buyerCheck,
        cws: sources.cws,
        amlo: sources.amlo,
        tdr: sources.tdr,
        as400: sources.as400
      });

      if (response.success) {
        setPushStatus({
          status: 'success',
          message: `✓ ส่งข้อมูล ${selectedData.length} รายการเรียบร้อยแล้ว`
        });

        setTimeout(() => setPushStatus(null), 3000);
      }
    } catch (error) {
      setPushStatus({
        status: 'error',
        message: `✗ ส่งข้อมูลล้มเหลว: ${error.message}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F6FD] via-white to-[#F0F6FD]">
      <header className="border-b border-[#B0CEEE]/30 bg-white/90 px-6 py-6">
        <div className="inline-flex rounded-full border border-[#B0CEEE] bg-[#EBF2FA] px-3 py-1 text-sm font-medium text-[#034EA2]">
          🤖 AI Data Sync Dashboard
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">จัดการการซิงก์ข้อมูลอย่างชาญฉลาด</h1>
        <p className="mt-1 text-slate-600">ดึงข้อมูลจากหลายแหล่ง → ประมวลผลด้วย AI → ส่งต่อให้พร้อมใช้งาน</p>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* File Upload Panel */}
        <FileUploadPanel onUploadSuccess={(data) => console.log('อัปโหลดสำเร็จ:', data)} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">ตั้งค่าการเชื่อมต่อ</h2>
            <button onClick={() => setShowConfig(!showConfig)} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-[#EBF2FA]">
              {showConfig ? '✕ ซ่อนการตั้งค่า' : '⚙️ แสดงการตั้งค่า'}
            </button>
          </div>
          {showConfig && <DataSourceConfig onSourcesChange={setSources} />}
        </div>

        <div className="rounded-[2rem] border border-[#D9E8F7] bg-white/90 p-8 shadow-sm">
          <SyncButton sources={{ ...sources, simulateFailures }} onSyncStart={handleSyncStart} onSyncProgress={handleSyncProgress} />
        </div>

        {syncStatus && (
          <div className="rounded-[2rem] border border-[#D9E8F7] bg-white/90 p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">📊 สถานะการซิงก์</h2>
            <SyncProgressIndicator syncStatus={syncStatus} />
          </div>
        )}

        <CompletenessChecklist
          sourceChecklist={syncStatus?.sourceChecklist || {}}
          sources={sources}
          completenessStatus={syncStatus?.completenessStatus}
          simulateFailures={simulateFailures}
          onToggleSimulate={handleToggleSimulate}
        />

        {syncStatus && syncStatus.status !== 'pulling' && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#D9E8F7] bg-white p-4 shadow-sm">
              <div className="text-3xl font-bold text-[#034EA2]">{syncStatus.pulledData?.length || 0}</div>
              <p className="mt-1 text-sm text-slate-600">Items Pulled</p>
            </div>
            <div className="rounded-2xl border border-[#D9E8F7] bg-white p-4 shadow-sm">
              <div className="text-3xl font-bold text-[#3281D1]">{syncStatus.processedData?.length || 0}</div>
              <p className="mt-1 text-sm text-slate-600">Items Processed by AI</p>
            </div>
            <div className="rounded-2xl border border-[#D9E8F7] bg-white p-4 shadow-sm">
              <div className="text-3xl font-bold text-emerald-600">{syncStatus.errors?.length || 0}</div>
              <p className="mt-1 text-sm text-slate-600">Errors</p>
            </div>
          </div>
        )}

        {processedData.length > 0 && (
          <div className="space-y-4 rounded-[2rem] border border-[#D9E8F7] bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">✨ ตารางสรุปข้อมูลอัจฉริยะ</h2>
            <SmartSummaryTable data={processedData} syncStatus={syncStatus} onPushData={handlePushData} />
          </div>
        )}

        {pushStatus && (
          <div className={`rounded-2xl border p-4 text-center font-semibold ${pushStatus.status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : pushStatus.status === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-[#B0CEEE] bg-[#EBF2FA] text-[#034EA2]'}`}>
            {pushStatus.message}
          </div>
        )}

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#D9E8F7] bg-[#EBF2FA] p-4">
            <h3 className="mb-2 font-bold text-[#154194]">⬇️ Pull Phase</h3>
            <p className="text-sm text-[#034EA2]">ดึงข้อมูลจาก OneDrive เว็บไซต์ และ API ภายในองค์กร</p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
            <h3 className="mb-2 font-bold text-cyan-900">⚙️ Process Phase</h3>
            <p className="text-sm text-cyan-800">AI กรอง สรุป และจัดหมวดหมู่ข้อมูลให้ดูง่ายขึ้น</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <h3 className="mb-2 font-bold text-emerald-900">⬆️ Push Phase</h3>
            <p className="text-sm text-emerald-800">ส่งผลลัพธ์ที่ประมวลผลแล้วกลับไปยัง Excel และ API ได้ทันที</p>
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-[#D9E8F7] bg-white/80">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-600">
          <p>
            🚀 AI Data Sync Dashboard v1.0 | Powered by React + Tailwind CSS |
            <a href="#" className="ml-1 font-semibold text-[#034EA2] hover:underline">Documentation</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SyncDashboardPage;

