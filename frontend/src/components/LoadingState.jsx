import { Search } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="min-h-64 flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 bg-gradient-to-r from-[#034EA2] to-[#3281D1] rounded-full animate-spin"></div>
        <div className="absolute inset-1 bg-white rounded-full"></div>
        <Search className="absolute inset-2 w-8 h-8 text-gray-400" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-gray-900">กำลังค้นหา...</p>
        <p className="text-sm text-gray-500">รอสักครู่ขณะที่เรากำลังรวบรวมข้อมูล</p>
      </div>
      
      {/* Loading skeleton cards */}
      <div className="w-full max-w-2xl mt-8 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 rounded-lg p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            <div className="flex gap-2 mt-4">
              <div className="h-8 bg-gray-300 rounded w-20"></div>
              <div className="h-8 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

