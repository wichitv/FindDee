import { Filter, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function FilterPanel({ onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    source: [],
    dateRange: 'all'
  });

  const sources = [
    { id: 'sanction', label: 'sanction (รายชื่อต้องห้าม)' },
    { id: 'buyer_check', label: 'buyer check (ข้อมูลผู้ซื้อ)' },
    { id: 'cws', label: 'cws (สถานะสินเชื่อ)' },
    { id: 'amlo', label: 'amlo (การฟอกเงิน)' },
    { id: 'tdr', label: 'TDR (เอกสารซ้ำ)' },
    { id: 'aa400', label: 'Aa400 (เลขที่ตั๋วซ้ำ, เลขที่เอกสารซ้ำ)' }
  ];

  const dateRanges = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'week', label: 'สัปดาห์นี้' },
    { id: 'month', label: 'เดือนนี้' },
    { id: 'year', label: 'ปีนี้' }
  ];

  const handleSourceChange = (sourceId) => {
    const updatedSources = filters.source.includes(sourceId)
      ? filters.source.filter(id => id !== sourceId)
      : [...filters.source, sourceId];
    
    const newFilters = { ...filters, source: updatedSources };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  

  const handleDateChange = (dateId) => {
    const newFilters = { ...filters, dateRange: dateId };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFilterCount = filters.source.length + (filters.dateRange !== 'all' ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between font-semibold text-slate-900 hover:bg-[#EBF2FA] transition"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#034EA2]" />
          ตัวกรอง
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-[#034EA2] to-[#3281D1] rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Content */}
      {isOpen && (
          <div className="border-t border-[#D9E8F7]/30 p-6 space-y-6 bg-white">
          {/* Date Range */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">วันที่</h4>
            <div className="space-y-2">
              {dateRanges.map(range => (
                <label key={range.id} className="flex items-center gap-3 cursor-pointer hover:bg-[#EBF2FA] p-2 rounded transition">
                  <input
                    type="radio"
                    name="dateRange"
                    value={range.id}
                    checked={filters.dateRange === range.id}
                    onChange={() => handleDateChange(range.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-700">{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Source */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">แหล่งที่มา</h4>
            <div className="space-y-2">
              {sources.map(source => (
                <label key={source.id} className="flex items-center gap-3 cursor-pointer hover:bg-[#EBF2FA] p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={filters.source.includes(source.id)}
                    onChange={() => handleSourceChange(source.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-gray-700">{source.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Type section removed as requested */}

          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setFilters({
                  source: [],
                  dateRange: 'all'
                });
                onFilterChange({
                  source: [],
                  dateRange: 'all'
                });
              }}
              className="w-full px-4 py-2 text-[#034EA2] font-medium hover:bg-[#D9E8F7] rounded-lg transition"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      )}
    </div>
  );
}

