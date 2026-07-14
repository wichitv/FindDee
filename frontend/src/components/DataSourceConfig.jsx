/**
 * DataSourceConfig - Configure data sources to pull from
 */

import React, { useState } from 'react';

const DataSourceConfig = ({ onSourcesChange }) => {
  const [sources, setSources] = useState({
    saction: true,
    buyerCheck: true,
    cws: true,
    amlo: true,
    tdr: true,
    as400: true,
    websites: true
  });

  const [websiteUrls, setWebsiteUrls] = useState(['https://example.com']);
  const [apiEndpoints, setApiEndpoints] = useState(['http://company-api.local:8000']);

  const handleSourceToggle = (source) => {
    const updated = { ...sources, [source]: !sources[source] };
    setSources(updated);
    onSourcesChange?.(updated);
  };

  const handleAddWebsite = () => {
    setWebsiteUrls([...websiteUrls, '']);
  };

  const handleRemoveWebsite = (index) => {
    setWebsiteUrls(websiteUrls.filter((_, i) => i !== index));
  };

  const handleWebsiteChange = (index, value) => {
    const updated = [...websiteUrls];
    updated[index] = value;
    setWebsiteUrls(updated);
  };

  const handleAddApi = () => {
    setApiEndpoints([...apiEndpoints, '']);
  };

  const handleRemoveApi = (index) => {
    setApiEndpoints(apiEndpoints.filter((_, i) => i !== index));
  };

  const handleApiChange = (index, value) => {
    const updated = [...apiEndpoints];
    updated[index] = value;
    setApiEndpoints(updated);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">⚙️ Data Sources Configuration</h2>

      {/* Saction Configuration */}
      <div className="border-l-4 border-[#034EA2] pl-4 space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="saction"
            checked={sources.saction}
            onChange={() => handleSourceToggle('saction')}
            className="w-5 h-5 text-[#034EA2] cursor-pointer"
          />
          <label htmlFor="saction" className="cursor-pointer flex-1">
            <span className="font-semibold text-gray-800">🚫 Saction (รายชื่อต้องห้าม)</span>
            <p className="text-xs text-gray-500 mt-1">
              ตรวจสอบรายชื่อต้องห้ามและสถานะความเสี่ยงจากแหล่ง Saction
            </p>
          </label>
        </div>
        {sources.saction && (
            <div className="ml-8 p-3 bg-[#EBF2FA] rounded space-y-2 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">Source:</span> Saction watchlist
            </p>
            <p className="text-gray-600 text-xs">
              Status: <span className="text-green-600">✓ Connected</span>
            </p>
          </div>
        )}
      </div>

      {/* Buyer Check Configuration */}
      <div className="border-l-4 border-purple-500 pl-4 space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="buyerCheck"
            checked={sources.buyerCheck}
            onChange={() => handleSourceToggle('buyerCheck')}
            className="w-5 h-5 text-purple-600 cursor-pointer"
          />
          <label htmlFor="buyerCheck" className="cursor-pointer flex-1">
            <span className="font-semibold text-gray-800">🧾 Buyer check (ข้อมูลผู้ซื้อ)</span>
            <p className="text-xs text-gray-500 mt-1">
              ตรวจสอบข้อมูลผู้ซื้อเพื่อยืนยันความถูกต้องและความเสี่ยง
            </p>
          </label>
        </div>
        {sources.websites && (
          <div className="ml-8 space-y-2">
            {websiteUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleWebsiteChange(index, e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                {websiteUrls.length > 1 && (
                  <button
                    onClick={() => handleRemoveWebsite(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddWebsite}
              className="px-3 py-2 text-sm bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
            >
              + Add Website
            </button>
          </div>
        )}
      </div>

      {/* CWS Configuration */}
      <div className="border-l-4 border-green-500 pl-4 space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="cws"
            checked={sources.cws}
            onChange={() => handleSourceToggle('cws')}
            className="w-5 h-5 text-green-600 cursor-pointer"
          />
          <label htmlFor="cws" className="cursor-pointer flex-1">
            <span className="font-semibold text-gray-800">🏦 CWS (สถานะสินเชื่อ)</span>
            <p className="text-xs text-gray-500 mt-1">
              ตรวจสอบสถานะสินเชื่อและระดับความเสี่ยงจากระบบ CWS
            </p>
          </label>
        </div>
      </div>

      {/* AMLO Configuration */}
      <div className="border-l-4 border-amber-500 pl-4 space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="amlo"
            checked={sources.amlo}
            onChange={() => handleSourceToggle('amlo')}
            className="w-5 h-5 text-amber-600 cursor-pointer"
          />
          <label htmlFor="amlo" className="cursor-pointer flex-1">
            <span className="font-semibold text-gray-800">💰 AMLO การฟอกเงิน</span>
            <p className="text-xs text-gray-500 mt-1">
              ตรวจจับความเสี่ยงด้านการฟอกเงินตามเกณฑ์ AMLO
            </p>
          </label>
        </div>
      </div>

      {/* TDR Configuration */}
      <div className="border-l-4 border-rose-500 pl-4 space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="tdr"
            checked={sources.tdr}
            onChange={() => handleSourceToggle('tdr')}
            className="w-5 h-5 text-rose-600 cursor-pointer"
          />
          <label htmlFor="tdr" className="cursor-pointer flex-1">
            <span className="font-semibold text-gray-800">📄 TDR (เลขที่เอกสารซ้ำ)</span>
            <p className="text-xs text-gray-500 mt-1">
              ตรวจหาตัวเลขที่เอกสารซ้ำและข้อมูลที่ซ้ำซ้อน
            </p>
          </label>
        </div>
      </div>

      {/* AS400 Configuration */}
      <div className="border-l-4 border-slate-500 pl-4 space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="as400"
            checked={sources.as400}
            onChange={() => handleSourceToggle('as400')}
            className="w-5 h-5 text-slate-600 cursor-pointer"
          />
          <label htmlFor="as400" className="cursor-pointer flex-1">
            <span className="font-semibold text-gray-800">🖥️ AS400 (เลขที่ตั๋วซ้ำ, เลขที่เอกสารซ้ำ)</span>
            <p className="text-xs text-gray-500 mt-1">
              ตรวจจับเลขที่ตั๋วซ้ำและเลขที่เอกสารซ้ำจากระบบ AS400
            </p>
          </label>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">✓ Active Sources:</span>
          {' '}
          {[
            sources.saction && '🚫 Saction',
            sources.buyerCheck && '🧾 Buyer check',
            sources.cws && '🏦 CWS',
            sources.amlo && '💰 AMLO',
            sources.tdr && '📄 TDR',
            sources.as400 && '🖥️ AS400'
          ].filter(Boolean).join(', ')}
        </p>
      </div>
    </div>
  );
};

export default DataSourceConfig;

