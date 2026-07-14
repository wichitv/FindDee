import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import { syncService } from '../services/syncService';

const ALLOWED_EXTS = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
const MAX_SIZE_MB = 50;

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FileUploadPanel({ onUploadSuccess }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState(null); // null | 'uploading' | { success, data } | { error }
  const inputRef = useRef(null);

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      return `รองรับเฉพาะไฟล์ Excel (${ALLOWED_EXTS.join(', ')})`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `ไฟล์ต้องมีขนาดไม่เกิน ${MAX_SIZE_MB} MB`;
    }
    return null;
  };

  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      setStatus({ error: err });
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setStatus(null);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleClear = () => {
    setSelectedFile(null);
    setStatus(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setStatus('uploading');
    try {
      const data = await syncService.uploadExcelFile(selectedFile);
      setStatus({ success: true, data });
      if (onUploadSuccess) onUploadSuccess(data);
    } catch (err) {
      setStatus({ error: err.message });
    }
  };

  const isUploading = status === 'uploading';
  const isSuccess = status?.success;
  const isError = status?.error;

  return (
    <div className="rounded-[2rem] border border-[#D9E8F7] bg-white/90 p-8 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <FileSpreadsheet className="h-5 w-5 text-[#034EA2]" />
        <h2 className="text-lg font-semibold text-slate-900">อัปโหลดไฟล์ข้อมูล Excel</h2>
      </div>
      <p className="mb-6 text-sm text-slate-500">
        รองรับไฟล์ <span className="font-medium">{ALLOWED_EXTS.join(', ')}</span> ขนาดสูงสุด {MAX_SIZE_MB} MB
        — อ่านข้อมูลจาก<span className="font-medium">ทุก Sheet</span> อัตโนมัติ
      </p>

      {/* Drop Zone */}
      {!selectedFile && !isSuccess && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition ${
            dragOver
              ? 'border-[#034EA2] bg-[#EBF2FA]'
              : 'border-[#B0CEEE] bg-[#F0F6FD]/50 hover:border-[#034EA2] hover:bg-[#EBF2FA]/50'
          }`}
        >
          <Upload className={`mb-3 h-10 w-10 ${dragOver ? 'text-[#034EA2]' : 'text-slate-400'}`} />
          <p className="text-sm font-medium text-slate-700">
            ลากไฟล์มาวางที่นี่ หรือ <span className="text-[#034EA2] underline">คลิกเพื่อเลือกไฟล์</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">ดาวน์โหลดจาก SharePoint แล้วนำมาวางที่นี่</p>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_EXTS.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Selected file preview */}
      {selectedFile && !isSuccess && (
        <div className="rounded-2xl border border-[#B0CEEE] bg-[#F0F6FD] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 shrink-0 text-green-600" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{formatSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={isUploading}
              className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-600 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#034EA2] via-[#154194] to-[#034EA2] py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                กำลังอัปโหลด...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                อัปโหลดไฟล์
              </>
            )}
          </button>
        </div>
      )}

      {/* Success state */}
      {isSuccess && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div className="flex-1">
              <p className="font-semibold text-green-800">อัปโหลดสำเร็จ</p>
              <p className="mt-0.5 text-sm text-green-700 font-medium">{status.data.filename}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  📋 {status.data.sheets.length} Sheet: {status.data.sheets.join(', ')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  📊 {status.data.totalRecords.toLocaleString()} records
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  💾 {formatSize(status.data.size)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 rounded-full p-1 text-green-500 transition hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="mt-4 w-full rounded-xl border border-green-300 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
          >
            อัปโหลดไฟล์ใหม่
          </button>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{status.error}</p>
        </div>
      )}
    </div>
  );
}

FileUploadPanel.propTypes = {
  onUploadSuccess: PropTypes.func,
};
