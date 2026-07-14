import { Search } from 'lucide-react';

export default function EmptyState({ message = "ไม่พบผลลัพธ์", suggestion = "ลองค้นหาด้วยคำหลักอื่น" }) {
  return (
    <div className="min-h-64 flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gray-100 rounded-full">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
          <p className="text-gray-600 text-sm">{suggestion}</p>
        </div>
      </div>
    </div>
  );
}

