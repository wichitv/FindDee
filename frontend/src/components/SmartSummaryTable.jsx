/**
 * SmartSummaryTable - AI Smart Summary Table Component
 * Displays AI-processed data in a clean, editable table format
 */

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import AISummaryModal from './AISummaryModal';

const getDocumentStatus = (doc) => {
  const hasKeyFields = (doc.customer || doc.invoiceNumber) && Number(doc.amount) > 0;
  if (!hasKeyFields) {
    return { label: 'ไม่มีข้อมูลเพียงพอ', icon: '❓', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' };
  }
  const overdueDays = Number(doc.overdueDays) || 0;
  const amount = Number(doc.amount) || 0;
  const status = (doc.status || '').toLowerCase();
  if (status === 'critical' || overdueDays >= 30 || (overdueDays >= 15 && amount >= 100000)) {
    return { label: 'พบความเสี่ยง', icon: '🔴', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
  }
  if (status === 'overdue' || overdueDays > 0) {
    return { label: 'ต้องตรวจเพิ่ม', icon: '⚠️', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
  }
  return { label: 'ข้อมูลครบ', icon: '✅', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
};

const SmartSummaryTable = ({ data = [], syncStatus, onPushData }) => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);

  const rowsToRender = useMemo(() => {
    const normalizedRows = data.map((item, index) => ({ ...item, __rowIndex: index }));
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return normalizedRows;
    }

    return normalizedRows.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
  }, [data, searchTerm]);

  const getAllKeys = useMemo(() => {
    const keysSet = new Set();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'id' && !key.startsWith('_')) {
          keysSet.add(key);
        }
      });
    });
    return Array.from(keysSet);
  }, [data]);

  const displayKeys = useMemo(() => getAllKeys.slice(0, 6), [getAllKeys]);
  const aggregationSummary = data[0]?.aggregationSummary || null;

  const handleRowSelect = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    const visibleIndexes = rowsToRender.map((item) => item.__rowIndex);
    const allVisibleSelected = visibleIndexes.every((index) => selectedRows.has(index));

    if (allVisibleSelected) {
      const nextSelected = new Set(selectedRows);
      visibleIndexes.forEach((index) => nextSelected.delete(index));
      setSelectedRows(nextSelected);
    } else {
      const nextSelected = new Set(selectedRows);
      visibleIndexes.forEach((index) => nextSelected.add(index));
      setSelectedRows(nextSelected);
    }
  };

  const handleCellEdit = (rowIndex, key) => {
    setEditingCell({ row: rowIndex, key });
    setEditValue(data[rowIndex][key] || '');
  };

  const saveCellEdit = (rowIndex, key) => {
    // This would update the data
    setEditingCell(null);
    setEditValue('');
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">📊 No data to display</p>
        <p className="text-gray-400 text-sm mt-2">Start a sync operation to see results</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header Info */}
      <div className="rounded-lg border border-[#D9E8F7] bg-[#EBF2FA] px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-800">
              📋 Summary Results: {data.length} items processed
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {selectedRows.size > 0 && `${selectedRows.size} items selected for push`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="ค้นหาข้อมูลในตาราง"
              className="rounded border border-[#B0CEEE] bg-white px-3 py-1.5 text-sm text-slate-700 outline-none ring-0"
            />
            <button
              onClick={handleSelectAll}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              {rowsToRender.length > 0 && rowsToRender.every((item) => selectedRows.has(item.__rowIndex)) ? 'Deselect Visible' : 'Select Visible'}
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              {showDetails ? '👈 Hide Details' : 'Details →'}
            </button>
            <button
              onClick={() => setShowAIModal(true)}
              className="rounded border border-indigo-400 bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all"
            >
              🤖 AI สรุปผล
            </button>
          </div>
        </div>
      </div>

      {aggregationSummary && (
        <div className="grid gap-3 rounded-lg border border-[#B0CEEE] bg-[#EBF2FA] p-4 md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#034EA2]">Items</p>
            <p className="text-xl font-bold text-[#154194]">{aggregationSummary.totalItems}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#034EA2]">Amount</p>
            <p className="text-xl font-bold text-[#154194]">{Number(aggregationSummary.totalAmount).toLocaleString('th-TH')} ฿</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#034EA2]">High Priority</p>
            <p className="text-xl font-bold text-[#154194]">{aggregationSummary.highPriorityCount}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#034EA2]">Avg Overdue</p>
            <p className="text-xl font-bold text-[#154194]">{aggregationSummary.averageOverdueDays} days</p>
          </div>
        </div>
      )}

      {/* Main Summary Table */}
      {rowsToRender.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
          ไม่พบข้อมูลตามคำค้นหา “{searchTerm}”
        </div>
      ) : (
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-center w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
              {displayKeys.map(key => (
                <th key={key} className="px-4 py-3 text-left font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    <span>{key}</span>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-center font-semibold text-gray-700">สถานะ</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">AI Info</th>
            </tr>
          </thead>
          <tbody>
            {rowsToRender.map((item) => {
              const rowIndex = item.__rowIndex;
              return (
              <tr
                key={rowIndex}
                className={`
                  border-b border-slate-200 hover:bg-[#EBF2FA] transition-colors
                  ${selectedRows.has(rowIndex) ? 'bg-[#D9E8F7]' : ''}
                `}
              >
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(rowIndex)}
                    onChange={() => handleRowSelect(rowIndex)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3 text-slate-500 font-medium">{rowIndex + 1}</td>
                {displayKeys.map(key => (
                  <td
                    key={`${rowIndex}-${key}`}
                    className="px-4 py-3 text-slate-700 cursor-pointer hover:bg-[#D9E8F7]"
                    onClick={() => handleCellEdit(rowIndex, key)}
                  >
                    <div className="max-w-xs overflow-hidden text-ellipsis">
                      {editingCell?.row === rowIndex && editingCell?.key === key ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveCellEdit(rowIndex, key)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveCellEdit(rowIndex, key);
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          autoFocus
                          className="w-full px-2 py-1 border border-[#034EA2] rounded"
                        />
                      ) : (
                        <span className="text-xs">{String(item[key] ?? '').substring(0, 50)}</span>
                      )}
                    </div>
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  {(() => {
                    const s = getDocumentStatus(item);
                    return (
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${s.bg} ${s.text} ${s.border}`}>
                        <span>{s.icon}</span>
                        {s.label}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-wrap justify-center gap-1">
                    <span
                      className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800"
                      title={`Classification: ${item.classification || 'N/A'}`}
                    >
                      {item.classification ? String(item.classification).substring(0, 5).toUpperCase() : '?'}
                    </span>
                    {item.source && (
                      <span className="rounded-full bg-[#D9E8F7] px-2 py-1 text-xs font-semibold text-[#034EA2]">
                        {String(item.source).substring(0, 12)}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {/* Details Panel */}
      {showDetails && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
          <h3 className="font-semibold text-gray-800">🔍 Details & Logs</h3>
          
          {syncStatus?.logs && (
            <div className="space-y-1">
              <p className="font-semibold text-sm text-gray-700">Process Logs:</p>
              <div className="bg-white p-3 rounded border border-gray-200 max-h-40 overflow-y-auto text-xs font-mono text-gray-600 space-y-1">
                {syncStatus.logs.map((log, i) => (
                  <div key={i} className="text-gray-600">{log}</div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-[#D9E8F7] px-3 py-2 rounded">
              <p className="text-xs text-slate-600">Total Items</p>
              <p className="font-bold text-[#154194]">{data.length}</p>
            </div>
            <div className="bg-green-100 px-3 py-2 rounded">
              <p className="text-xs text-slate-600">Selected</p>
              <p className="font-bold text-green-900">{selectedRows.size}</p>
            </div>
          </div>
        </div>
      )}

      {/* Push Action Button */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            if (selectedRows.size === 0) {
              alert('Please select at least one item to push');
            } else {
              onPushData?.(Array.from(selectedRows).map(i => data[i]));
            }
          }}
          className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
          disabled={selectedRows.size === 0}
        >
          ⬆️ Push {selectedRows.size > 0 ? `(${selectedRows.size})` : ''} Items
        </button>
      </div>

      <AISummaryModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        data={data}
      />
    </div>
  );
};

SmartSummaryTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  syncStatus: PropTypes.shape({
    logs: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string,
    processedData: PropTypes.array
  }),
  onPushData: PropTypes.func
};

export default SmartSummaryTable;

