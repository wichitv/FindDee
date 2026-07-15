import { useState, useEffect } from 'react';
import { fetchDashboard } from '../services/dashboardService';
import {
  Inbox, Clock, CheckCircle, AlertTriangle, LayoutList,
  TrendingUp, ChevronRight
} from 'lucide-react';

const FAKE_ASSIGNEES = [
  { name: 'สมศักดิ์ ใจดี',     color: 'bg-[#D9E8F7] text-[#034EA2]' },
  { name: 'วิชีรพงศ์ สวัสดิ์',  color: 'bg-purple-100 text-purple-700' },
  { name: 'นภัสร ทองใส',    color: 'bg-emerald-100 text-emerald-700' },
  { name: 'ปรียาภรณ์ มีสุข',   color: 'bg-amber-100 text-amber-700' },
  { name: 'ธนนันท์ สุขใจ',    color: 'bg-red-100 text-red-700' },
  { name: 'กัญญา บุญยิ่ง',     color: 'bg-cyan-100 text-cyan-700' },
  { name: 'อรรถพร สว่าง',    color: 'bg-pink-100 text-pink-700' },
  { name: 'ชนันท์ รักการ',   color: 'bg-indigo-100 text-indigo-700' },
];

const getAssignee = (id) => {
  const seed = String(id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return FAKE_ASSIGNEES[seed % FAKE_ASSIGNEES.length];
};

const STATUS_LABEL = {
  New: 'งานเข้า',
  Pending: 'รอดำเนินการ',
  Overdue: 'รอดำเนินการ',
  Completed: 'เสร็จสิ้น',
  Critical: 'ใกล้ครบกำหนด',
};

const STATUS_COLOR = {
  New:       'bg-[#D9E8F7] text-[#034EA2]',
  Pending:   'bg-amber-100 text-amber-700',
  Overdue:   'bg-orange-100 text-orange-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Critical:  'bg-red-100 text-red-700',
};

const TABS = [
  { key: 'all',       label: 'รายการทั้งหมด',    icon: LayoutList,    color: 'text-slate-600',   bg: 'bg-slate-50',   border: 'border-slate-200'   },
  { key: 'incoming',  label: 'Buyer Check',       icon: Inbox,         color: 'text-[#034EA2]',   bg: 'bg-[#EBF2FA]',  border: 'border-[#B0CEEE]'   },
  { key: 'pending',   label: 'CWS',               icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200'   },
  { key: 'completed', label: 'ท่าเรือปลายทาง',    icon: CheckCircle,   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { key: 'nearDue',   label: 'SANCTION',          icon: AlertTriangle, color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200'     },
];

const formatAmount = (n) =>
  n.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 });

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const items = data?.items || {};
  const rows = items[activeTab] || [];

  const statCards = [
    { key: 'total',     label: 'รายการทั้งหมด',  value: stats.total,     icon: LayoutList,    color: 'bg-slate-50  border-slate-200  text-slate-700',   iconColor: 'text-slate-500'   },
    { key: 'incoming',  label: 'Buyer Check',    value: stats.incoming,  icon: Inbox,         color: 'bg-[#EBF2FA] border-[#B0CEEE] text-[#034EA2]',   iconColor: 'text-[#034EA2]'   },
    { key: 'pending',   label: 'CWS',            value: stats.pending,   icon: Clock,         color: 'bg-amber-50  border-amber-200  text-amber-700',   iconColor: 'text-amber-500'   },
    { key: 'completed', label: 'ท่าเรือปลายทาง', value: stats.completed, icon: CheckCircle,   color: 'bg-emerald-50 border-emerald-200 text-emerald-700', iconColor: 'text-emerald-500' },
    { key: 'nearDue',   label: 'SANCTION',       value: stats.nearDue,   icon: AlertTriangle, color: 'bg-red-50    border-red-200    text-red-700',     iconColor: 'text-red-500'     },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F6FD]/50 via-white to-slate-50">
      {/* Page header */}
      <div className="border-b border-[#D9E8F7] bg-white px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
          <TrendingUp className="h-4 w-4" />
          <span>ภาพรวม</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-600 font-medium">Dashboard</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Feature Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">สรุปสถานะงานและใบแจ้งหนี้ทั้งหมดในระบบ</p>
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100 border border-slate-200" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
            ⚠️ โหลดข้อมูลไม่สำเร็จ: {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {statCards.map(({ key, label, value, icon: Icon, color, iconColor }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`group flex flex-col gap-3 rounded-2xl border p-5 text-left transition hover:shadow-md ${color} ${activeTab === key ? 'ring-2 ring-offset-1 ring-[#3281D1] shadow-md' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                  {activeTab === key && (
                    <span className="h-2 w-2 rounded-full bg-[#3281D1]" />
                  )}
                </div>
                <div>
                  <div className="text-3xl font-black">{value ?? '—'}</div>
                  <div className="mt-0.5 text-xs font-medium opacity-80">{label}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tab + Table */}
        {!loading && !error && (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-100">
              {TABS.map(({ key, label, icon: Icon, color, bg, border }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 whitespace-nowrap px-5 py-3.5 text-sm font-medium transition border-b-2 ${
                    activeTab === key
                      ? `${color} ${bg} border-current`
                      : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === key ? 'bg-white/60' : 'bg-slate-100 text-slate-500'}`}>
                    {items[key]?.length ?? 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Table */}
            {rows.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CheckCircle className="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm">ไม่มีรายการในหมวดนี้</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3">เลขที่ใบแจ้งหนี้</th>
                      <th className="px-5 py-3">ลูกค้า</th>
                      <th className="px-5 py-3 text-right">ยอดเงิน (บาท)</th>
                      <th className="px-5 py-3 text-center">สาขา</th>
                      <th className="px-5 py-3">วันที่</th>
                      <th className="px-5 py-3">สถานะ</th>
                      <th className="px-5 py-3">ผู้ดูแล</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.map((item, idx) => {
                      const assignee = item.assignee
                        ? { name: item.assignee, color: 'bg-[#D9E8F7] text-[#034EA2]' }
                        : getAssignee(item.id || idx);
                      return (
                      <tr key={item.id || idx} className="transition hover:bg-[#EBF2FA]/40">
                        <td className="px-5 py-3.5 font-semibold text-[#034EA2]">{item.invoiceNumber}</td>
                        <td className="px-5 py-3.5 text-slate-700">{item.customer}</td>
                        <td className="px-5 py-3.5 text-right font-medium text-slate-800">
                          {formatAmount(item.amount)}
                        </td>
                        <td className="px-5 py-3.5 text-center text-slate-700">
                          {item.branch || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{item.date}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[item.status] || 'bg-slate-100 text-slate-600'}`}>
                            {STATUS_LABEL[item.status] || item.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${assignee.color}`}>
                              {assignee.name.charAt(0)}
                            </div>
                            <span className="text-slate-600">{assignee.name}</span>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
