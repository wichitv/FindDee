import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

function FeaturesDropdown({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToHash = (hash) => {
    if (!hash) return;
    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFeaturesClick = (e) => {
    e.preventDefault();
    onNavigate?.('landing');
    setOpen(false);
    // Scroll to features section after navigation
    setTimeout(() => scrollToHash('#features'), 100);
  };

  const items = [
    { label: 'ค้นหาอัจฉริยะ', href: '#features-search', page: 'search' },
    { label: 'สรุปอัจฉริยะ', href: '#features-summary', page: 'landing' },
    { label: 'ซิงค์ข้อมูล', href: '#features-sync', page: 'sync' },
    { label: 'แจ้งเตือน', href: '#features-alerts' },
  ];

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-1">
        <a
          href="#features"
          onClick={handleFeaturesClick}
          className="font-medium transition text-slate-600 hover:text-slate-900"
        >
          ฟีเจอร์
        </a>

        <button
          onClick={() => setOpen((s) => !s)}
          className="flex items-center p-1 text-slate-600 hover:text-slate-900"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Toggle features menu"
        >
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-[#D9E8F7] py-1 z-50">
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.page) {
                  e.preventDefault();
                  onNavigate?.(item.page);
                  setTimeout(() => scrollToHash(item.href), 150);
                }
                setOpen(false);
              }}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-[#EBF2FA]"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

FeaturesDropdown.propTypes = {
  onNavigate: PropTypes.func
};

export default FeaturesDropdown;

