import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="min-h-64 flex items-center justify-center py-12">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">เกิดข้อผิดพลาด</h3>
          <p className="text-gray-600 text-sm">
            {error || 'ไม่สามารถโหลดผลลัพธ์การค้นหา'}
          </p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-[#034EA2] text-white rounded-lg font-medium hover:bg-[#154194] transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            ลองอีกครั้ง
          </button>
        )}
      </div>
    </div>
  );
}

