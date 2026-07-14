import { useState, useCallback } from 'react';
import Footer from '../components/Footer';
import SearchForm from '../components/SearchForm';
import FilterPanel from '../components/FilterPanel';
import DocumentCard from '../components/DocumentCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import AISummaryModal from '../components/AISummaryModal';
import { useSearch } from '../hooks/useSearch';

export default function SearchPage({ onNavigate, user, onLogout }) {
  const { results, loading, error, totalResults, search } = useSearch();
  const [filters, setFilters] = useState({});
  const [lastQuery, setLastQuery] = useState(null);
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);

  const handleSearch = useCallback((queryObj) => {
    setLastQuery(queryObj);
    search(queryObj, filters);
  }, [search, filters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    if (lastQuery) {
      search(lastQuery, newFilters);
    }
  }, [search, lastQuery]);

  const handleSaveDocument = (document) => {
    console.log('Saving document:', document);
  };

  const handleShareDocument = async (document) => {
    const shareUrl = `${window.location.origin}/?doc=${document.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert(`ลิงก์สำหรับแชร์ถูกคัดลอกแล้ว\n${shareUrl}`);
    } catch (error) {
      window.prompt('คัดลอกลิงก์สำหรับแชร์', shareUrl);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="border-b border-[#B0CEEE]/30 bg-gradient-to-br from-[#F0F6FD] via-white to-[#F0F6FD] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <div className="inline-flex items-center rounded-full border border-[#B0CEEE] bg-white px-3 py-1 text-sm font-medium text-[#034EA2] shadow-sm">
                🔎 ค้นหาแบบเรียบง่ายและรวดเร็ว
              </div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
                ค้นหาและรวบรวมข้อมูล
              </h1>
              <p className="text-lg text-slate-600">
                ค้นหาข้อมูลจากแหล่งหลายแหล่ง พร้อมตัวกรองขั้นสูงและสรุปอัตโนมัติ
              </p>
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-40 border-b border-[#B0CEEE]/30 bg-white/90 py-6 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SearchForm onSearch={handleSearch} isLoading={loading} />
          </div>
        </section>

        <section className="flex-1 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {!lastQuery && !loading && results.length === 0 && (
              <div className="rounded-[2rem] border border-[#B0CEEE] bg-gradient-to-br from-[#EBF2FA]/70 to-white px-6 py-14 text-center shadow-sm">
                <h2 className="mb-4 text-2xl font-semibold text-slate-900">เริ่มค้นหาของคุณ</h2>
                <p className="text-slate-600">กรอกข้อมูลในฟอร์มด้านบนแล้วกด <span className="font-semibold text-[#034EA2]">ค้นหา</span></p>
              </div>
            )}

            {lastQuery && (
              <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-1">
                  <div className="sticky top-20">
                    <FilterPanel onFilterChange={handleFilterChange} />
                  </div>
                </div>

                <div className="lg:col-span-3">
                  {!loading && results.length > 0 && (
                    <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-[#D9E8F7] bg-[#EBF2FA]/70 p-4 shadow-sm">
                      <p className="text-sm text-slate-700">
                        พบ <span className="font-semibold">{totalResults}</span> ผลลัพธ์สำหรับ{' '}
                        <span className="font-semibold text-[#034EA2]">{lastQuery?.customerName || lastQuery?.customerCode || ''}</span>
                      </p>
                      <button
                        onClick={() => setIsAISummaryOpen(true)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#034EA2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#154194] active:scale-95"
                      >
                        🤖 AI สรุปผล
                      </button>
                    </div>
                  )}

                  {loading && <LoadingState />}

                  {error && <ErrorState error={error} onRetry={() => lastQuery && handleSearch(lastQuery)} />}

                  {!loading && !error && results.length === 0 && lastQuery && (
                    <EmptyState message="ไม่พบผลลัพธ์" suggestion={`ไม่พบผลลัพธ์สำหรับ "${lastQuery?.customerName || lastQuery?.customerCode || ''}". ลองใช้คำค้นหาอื่นหรือปรับเปลี่ยนตัวกรอง`} />
                  )}

                  {!loading && results.length > 0 && (
                    <div className="grid gap-6">
                      {results.map((doc, index) => (
                        <DocumentCard key={doc.id || index} document={doc} onSave={handleSaveDocument} onShare={handleShareDocument} />
                      ))}
                    </div>
                  )}

                  {!loading && results.length > 0 && totalResults > results.length && (
                    <div className="mt-8 text-center">
                      <p className="text-sm text-slate-600">กำลังแสดง {results.length} จาก {totalResults} ผลลัพธ์</p>
                      <button className="mt-4 rounded-full border border-[#B0CEEE] px-6 py-2 font-medium text-[#034EA2] transition hover:bg-[#EBF2FA]">
                        โหลดเพิ่มเติม
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <AISummaryModal
        isOpen={isAISummaryOpen}
        onClose={() => setIsAISummaryOpen(false)}
        data={results}
      />
    </div>
  );
}

