import { Home, Search, RefreshCw, Database, HelpCircle, User, LogOut, LayoutDashboard } from 'lucide-react';

const navItems = [
  { icon: Home,            label: 'หน้าหลัก',      page: 'landing'   },
  { icon: LayoutDashboard, label: 'Dashboard',   page: 'dashboard' },
  { icon: Search,          label: 'ค้นหา',          page: 'search'    },
  { icon: RefreshCw,       label: 'AI Data Sync', page: 'sync'      },
  { icon: Database,        label: 'Collections',  page: 'search'    },
  { icon: HelpCircle,      label: 'ช่วยเหลือ',      page: 'landing'   },
];

export default function Sidebar({ currentPage, onNavigate, user, onLogout }) {
  return (
    <div className="flex h-screen w-64 flex-shrink-0 flex-col border-r border-[#D9E8F7] bg-white">
      {/* Logo */}
      <div className="px-5 py-5">
        <button
          onClick={() => onNavigate?.('landing')}
          className="flex items-center gap-3 transition hover:opacity-90"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#034EA2] to-[#154194] shadow-md">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="5.5" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <div className="text-left">
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-black tracking-tight text-[#154194]">Find</span>
              <span className="text-base font-black tracking-tight text-[#034EA2]">Dee</span>
            </div>
            <div className="text-xs text-[#3281D1]">Find Data Easily &amp; Efficiently</div>
          </div>
        </button>
      </div>

      <div className="mx-4 border-t border-[#D9E8F7]" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">เมนูหลัก</p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = currentPage === item.page && (
              item.page !== 'landing' || item.label === 'หน้าหลัก'
            );
            return (
              <button
                key={item.label}
                onClick={() => onNavigate?.(item.page)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-[#EBF2FA] text-[#034EA2]'
                    : 'text-slate-600 hover:bg-[#EBF2FA] hover:text-[#034EA2]'
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-[#034EA2]' : 'text-slate-400'}`} />
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#034EA2]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-[#D9E8F7] p-4">
        <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-[#EBF2FA] transition">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#D9E8F7]">
            <User className="h-4 w-4 text-[#034EA2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-slate-800">{user?.name || 'ผู้ใช้งาน'}</div>
            <div className="truncate text-xs text-slate-400">{user?.role || user?.username || ''}</div>
          </div>
          <button
            onClick={onLogout}
            title="ออกจากระบบ"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
