import { Search, Bell, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Header({ currentPage = 'landing', onNavigate, user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { label: 'หน้าหลัก', page: 'landing' },
    { label: 'ค้นหา', page: 'search' },
    { label: 'หมวดหมู่เอกสาร', page: 'landing' },
    { label: 'AI Data Sync', page: 'sync' },
    { label: 'ช่วยเหลือ', page: 'landing' }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#034EA2]/20 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={() => {
            onNavigate?.('landing');
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-3 transition hover:opacity-90"
        >
          {/* Logo */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#034EA2] to-[#154194] shadow-md">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="5.5" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <div className="hidden text-left sm:block">
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-black tracking-tight text-[#154194]">Find</span>
              <span className="text-base font-black tracking-tight text-[#034EA2]">Dee</span>
            </div>
            <div className="text-xs text-[#3281D1]">Find Data Easily &amp; Efficiently</div>
          </div>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = currentPage === item.page && (item.page !== 'landing' || item.label === 'หน้าหลัก');
            return (
              <button
                key={item.label}
                onClick={() => onNavigate?.(item.page)}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-[#EBF2FA] text-[#034EA2]'
                    : 'text-slate-600 hover:bg-[#EBF2FA] hover:text-[#034EA2]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button className="relative rounded-full p-2 text-slate-600 transition hover:bg-[#EBF2FA] hover:text-[#034EA2]">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-[#ED1C24]" />
          </button>
          <div className="relative border-l border-[#B0CEEE] pl-3">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9E8F7]">
                <User className="h-4 w-4 text-[#034EA2]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-700">{user?.name || 'ผู้ใช้งาน'}</div>
                <div className="text-xs text-gray-400">{user?.role || ''}</div>
              </div>
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                <div className="border-b border-gray-100 px-4 py-2">
                  <div className="text-xs font-semibold text-gray-500">{user?.username}</div>
                </div>
                <button
                  onClick={() => { setShowUserMenu(false); onLogout?.(); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 md:hidden"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-[#D9E8F7] bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const active = currentPage === item.page && (item.page !== 'landing' || item.label === 'หน้าหลัก');
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    onNavigate?.(item.page);
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                    active ? 'bg-[#EBF2FA] text-[#034EA2]' : 'text-gray-600 hover:bg-[#EBF2FA] hover:text-[#034EA2]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="border-t border-gray-100 pt-2">
              <div className="px-3 py-1 text-xs text-gray-400">{user?.name} ({user?.role})</div>
              <button
                onClick={() => { setIsMenuOpen(false); onLogout?.(); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

