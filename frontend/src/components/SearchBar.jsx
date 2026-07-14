import { Search, X } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({ onSearch, isLoading, placeholder = 'ค้นหาข้อมูล...' }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center rounded-full border border-[#B0CEEE] bg-white/95 px-3 py-2 shadow-[0_18px_55px_rgba(3,78,162,0.1)] ring-1 ring-[#F0F6FD] transition focus-within:border-[#034EA2] focus-within:shadow-[0_20px_60px_rgba(3,78,162,0.15)]">
          <Search className="ml-2 h-5 w-5 flex-shrink-0 text-[#034EA2]" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-transparent px-4 py-3 text-base text-slate-700 outline-none placeholder:text-slate-400 disabled:bg-transparent"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="mr-2 rounded-full p-2 text-slate-400 transition hover:bg-[#EBF2FA] hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="rounded-full bg-gradient-to-r from-[#034EA2] via-[#154194] to-[#034EA2] px-5 py-2.5 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังค้นหา
              </span>
            ) : (
              'ค้นหา'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

