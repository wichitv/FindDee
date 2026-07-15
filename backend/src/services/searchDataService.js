import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import axios from 'axios';
import { buildAutoSummary } from './summaryService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', '..', '..', 'data');
const FALLBACK_FILE = path.join(dataDir, 'Invoice_Overdue_Template.xlsx');
const EXCEL_EXTS = new Set(['.xlsx', '.xls', '.xlsm', '.xlsb']);
const JSON_FILE = path.join(dataDir, 'invoice_overdue_data.json');

// ─── OneDrive / SharePoint Share Link ─────────────────────────────────────────
const ONEDRIVE_SHARE_LINK = process.env.ONEDRIVE_SHARE_LINK ||
  'https://eximbankth365-my.sharepoint.com/:x:/g/personal/wichitv_exim_go_th/IQD-aXLBBS6ATb6VAdg9gkSYAa8JJd1duxFmfy1RRaVEJHM?e=t5B78T';

const CACHE_TTL_MS = Number(process.env.ONEDRIVE_CACHE_TTL_SEC || 300) * 1000; // default 5 นาที
const FAILURE_COOLDOWN_MS = 60 * 1000; // ถ้า fail จะไม่ retry อีก 1 นาที
let _odCache = { rows: null, ts: 0, sheets: [], failedAt: 0 };

/**
 * ดึง Excel จาก OneDrive share link แล้ว parse ทุก Sheet / Row / Column
 * @returns {Array|null} rows ทั้งหมด หรือ null ถ้าล้มเหลวและไม่มี stale cache
 */
/**
 * สร้าง candidate download URLs จาก share link หลาย pattern
 */
const buildDownloadUrls = (shareLink) => {
  // ดึง document token จาก path segment สุดท้ายก่อน ?
  const pathPart = shareLink.split('?')[0];
  const docToken = pathPart.split('/').pop();
  const base = new URL(shareLink);
  const origin = base.origin;
  const personalPath = base.pathname.split('/').slice(0, 3).join('/'); // /personal/user

  return [
    // Pattern 1: &download=1 (ทำงานกับ share link บาง tenant)
    `${shareLink}${shareLink.includes('?') ? '&' : '?'}download=1`,
    // Pattern 2: _layouts/15/download.aspx?share=TOKEN
    `${origin}${personalPath}/_layouts/15/download.aspx?share=${docToken}`,
  ];
};

const fetchOneDriveRows = async () => {
  const now = Date.now();
  if (_odCache.rows && now - _odCache.ts < CACHE_TTL_MS) {
    console.log(`[OneDrive] cache hit — ${_odCache.rows.length} rows [${_odCache.sheets.join(', ')}]`);
    return _odCache.rows;
  }
  // ถ้า fail ล่าสุดยังอยู่ใน cooldown — ข้ามไปเลย
  if (!_odCache.rows && _odCache.failedAt && now - _odCache.failedAt < FAILURE_COOLDOWN_MS) {
    return null;
  }

  const urls = buildDownloadUrls(ONEDRIVE_SHARE_LINK);

  for (const downloadUrl of urls) {
    try {
      console.log(`[OneDrive] trying: ${downloadUrl.substring(0, 80)}...`);
      const resp = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        maxRedirects: 10,
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FindDee/1.0)' },
      });

      // ตรวจสอบว่า response เป็น binary (Excel) ไม่ใช่ HTML
      const contentType = resp.headers['content-type'] || '';
      const buf = Buffer.from(resp.data);
      const isHtml = contentType.includes('text/html') ||
        buf.slice(0, 5).toString('utf8').trim().startsWith('<');

      if (isHtml) {
        console.warn('[OneDrive] received HTML instead of Excel — requires org authentication');
        continue; // ลอง URL ถัดไป
      }

      const workbook = XLSX.read(buf, { type: 'buffer', cellDates: true });
      const allRows = [];
      for (const sheetName of workbook.SheetNames) {
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
        rows.forEach(row => allRows.push({ ...row, _sheetName: sheetName, _fileName: 'OneDrive' }));
      }
      _odCache = { rows: allRows, ts: now, sheets: workbook.SheetNames };
      console.log(`[OneDrive] loaded ${allRows.length} rows from ${workbook.SheetNames.length} sheets: [${workbook.SheetNames.join(', ')}]`);
      return allRows;

    } catch (err) {
      console.warn(`[OneDrive] url failed: ${err.message}`);
    }
  }

  // ทุก URL ล้มเหลว
  console.error('[OneDrive] all download attempts failed — need Azure AD credentials or truly public share link');
  _odCache.failedAt = Date.now(); // บันทึกเวลาที่ fail เพื่อ cooldown
  if (_odCache.rows) {
    console.warn('[OneDrive] using stale cache as fallback');
    return _odCache.rows;
  }
  return null;
};

export const clearOneDriveCache = () => { _odCache = { rows: null, ts: 0, sheets: [], failedAt: 0 }; console.log('[OneDrive] cache cleared'); };
export const getOneDriveCacheStatus = () => ({
  hasCachedData: !!_odCache.rows,
  rowCount: _odCache.rows?.length ?? 0,
  sheets: _odCache.sheets,
  cachedAt: _odCache.ts ? new Date(_odCache.ts).toISOString() : null,
  expiresInSec: _odCache.ts ? Math.max(0, Math.round((CACHE_TTL_MS - (Date.now() - _odCache.ts)) / 1000)) : 0,
});
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Safely parse JSON that may contain concatenated arrays (malformed).
 * Extracts only the first valid JSON array using bracket-depth tracking.
 */
const parseJsonSafe = (content) => {
  const trimmed = content.trim();
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const arrayStart = trimmed.indexOf('[');
    if (arrayStart === -1) return [];
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = arrayStart; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '[') depth++;
      else if (ch === ']') {
        depth--;
        if (depth === 0) {
          try { return JSON.parse(trimmed.slice(arrayStart, i + 1)); } catch { return []; }
        }
      }
    }
    return [];
  }
};

const fallbackRows = [
  {
    invoiceNumber: 'INV-1001',
    customer: 'ABC Corporation',
    amount: 125000,
    overdueDays: 12,
    status: 'Overdue',
    source: 'Excel Import',
    date: '2026-06-10',
    summary: 'ลูกค้า ABC Corporation มีใบแจ้งหนี้ค้างชำระ 12 วัน',
    content: 'Invoice INV-1001 for ABC Corporation overdue 12 days.'
  },
  {
    invoiceNumber: 'INV-1002',
    customer: 'XYZ Trading',
    amount: 87000,
    overdueDays: 5,
    status: 'Overdue',
    source: 'Excel Import',
    date: '2026-06-15',
    summary: 'ใบแจ้งหนี้ INV-1002 ของ XYZ Trading กำลังใกล้ถึงกำหนดชำระ',
    content: 'Invoice INV-1002 for XYZ Trading overdue 5 days.'
  },
  {
    invoiceNumber: 'INV-1003',
    customer: 'DEF Logistics',
    amount: 243000,
    overdueDays: 30,
    status: 'Critical',
    source: 'Excel Import',
    date: '2026-05-20',
    summary: 'ใบแจ้งหนี้ INV-1003 ของ DEF Logistics ค้างชำระเกิน 30 วัน',
    content: 'Invoice INV-1003 for DEF Logistics overdue 30 days.'
  }
];

const createFallbackWorkbook = () => {
  const sheet = XLSX.utils.json_to_sheet(fallbackRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Invoices');
  XLSX.writeFile(workbook, FALLBACK_FILE);
};

// Scan data directory and return all Excel file paths
const getExcelFiles = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const files = fs.readdirSync(dataDir).filter(f => EXCEL_EXTS.has(path.extname(f).toLowerCase()));
  if (files.length === 0) {
    createFallbackWorkbook();
    return [FALLBACK_FILE];
  }
  return files.map(f => path.join(dataDir, f));
};

const loadDocuments = async () => {
  const allRows = [];
  const seenIds = new Set();

  const rowKey = (row) => {
    const inv = (row.invoiceNumber || row.InvoiceNumber || row['Invoice Number'] || '').toString().trim().toUpperCase();
    return inv || (row.id || '').toString().trim().toUpperCase();
  };

  // 1. Primary: ดึงจาก OneDrive (ทุก Sheet / Row / Column)
  const odRows = await fetchOneDriveRows();
  if (odRows && odRows.length > 0) {
    odRows.forEach((row) => {
      const key = rowKey(row);
      if (!key || !seenIds.has(key)) {
        if (key) seenIds.add(key);
        allRows.push(row);
      }
    });
    console.log(`[searchDataService] OneDrive: ${allRows.length} rows loaded`);
  } else {
    // 2. Fallback: JSON local
    if (fs.existsSync(JSON_FILE)) {
      try {
        const content = fs.readFileSync(JSON_FILE, 'utf8');
        const rows = parseJsonSafe(content);
        rows.forEach((row) => {
          const key = rowKey(row);
          if (!key || !seenIds.has(key)) {
            if (key) seenIds.add(key);
            allRows.push({ ...row, _fileName: 'invoice_overdue_data', _sheetName: 'JSON' });
          }
        });
        if (rows.length > 0) console.log(`[searchDataService] Fallback JSON: ${rows.length} rows`);
      } catch (err) {
        console.error('[searchDataService] JSON read error:', err.message);
      }
    }

    // 3. Fallback: local Excel files → ALL sheets
    const excelFiles = getExcelFiles();
    for (const filePath of excelFiles) {
      const fileName = path.basename(filePath, path.extname(filePath));
      try {
        const workbook = XLSX.readFile(filePath);
        for (const sheetName of workbook.SheetNames) {
          const sheetRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
          sheetRows.forEach((row) => {
            const key = rowKey(row);
            if (!key || !seenIds.has(key)) {
              if (key) seenIds.add(key);
              allRows.push({ ...row, _fileName: fileName, _sheetName: sheetName });
            }
          });
        }
      } catch (err) {
        console.error(`[searchDataService] Excel read error ${filePath}:`, err.message);
      }
    }
  }

  return allRows.map((row, index) => {
    // Build _allText from ALL column values in the raw row (covers every sheet/cell/column)
    const _rawData = Object.fromEntries(
      Object.entries(row).filter(([k]) => !k.startsWith('_'))
    );
    const _allText = Object.values(_rawData)
      .map(v => (v == null ? '' : String(v)))
      .join(' ')
      .toLowerCase();

    const doc = {
      id: row.id || `row-${index + 1}`,
      invoiceNumber: row.invoiceNumber || row.InvoiceNumber || row['Invoice Number'] || '',
      // customer: รองรับทุก Sheet — Buyer Check, CWS, SANCTION, ท่าเรือปลายทาง
      customer: row.customer || row.Customer || row['Customer Name'] ||
                row['ชื่อลูกค้า'] || row['บริษัท'] || row['ชื่อบริษัท'] || '',
      amount: Number(row.amount || row.Amount || row['Amount (THB)'] || 0),
      overdueDays: Number(row.overdueDays || row.OverdueDays || row['Overdue Days'] || 0),
      status: row.status || row.Status || row['Status'] ||
              row['Credit Warning Sign'] || row['Type'] || 'Unknown',
      source: row.source || row.Source || (row._fileName && row._sheetName ? `${row._fileName} › ${row._sheetName}` : row._sheetName || row._fileName || 'Excel Import'),
      date: row.date || row.Date || row['Invoice Date'] || '',
      summary: row.summary || row.Summary || '',
      content: row.content || row.Content ||
               Object.entries(_rawData)
                 .filter(([, v]) => v && String(v).trim())
                 .map(([k, v]) => `${k}: ${v}`)
                 .join(' | '),
      ...(row.creditLimit != null && { creditLimit: Number(row.creditLimit) }),
      ...(row.withdrawalAmount != null && { withdrawalAmount: Number(row.withdrawalAmount) }),
      ...(row.remainingBalance != null && { remainingBalance: Number(row.remainingBalance) }),
      ...(row.transactionNo != null && { transactionNo: Number(row.transactionNo) }),
      ...(row.assignee && { assignee: row.assignee }),
      // SANCTION (สินค้า): Col A=ลำดับ, Col B=บริษัท(→customer), Col C=Type, Col D=ชื่อสินค้า, Col E=รหัสสินค้า 1, Col F=รหัสสินค้า 2
      ...(row['ลำดับ'] != null && row['ลำดับ'] !== '' && { sanctionSeq: String(row['ลำดับ']) }),
      ...(row['Type'] != null && row['Type'] !== '' && { sanctionType: String(row['Type']) }),
      ...(row['ชื่อสินค้า (Match Phrases)'] != null && row['ชื่อสินค้า (Match Phrases)'] !== '' && { sanctionProduct: String(row['ชื่อสินค้า (Match Phrases)']) }),
      ...(row['รหัสสินค้า 1'] != null && row['รหัสสินค้า 1'] !== '' && { sanctionCode1: String(row['รหัสสินค้า 1']) }),
      ...(row['รหัสสินค้า 2'] != null && row['รหัสสินค้า 2'] !== '' && { sanctionCode2: String(row['รหัสสินค้า 2']) }),
      // SANCTION (เรือ): Col A=ลำดับ, Col B=บริษัท(→customer), Col C=รหัสท่าเรือ, Col D=ท่าเรือปลายทาง, Col F=SINGLE STRING NAME
      ...(row._sheetName === 'SANCTION (เรือ)' && row['รหัสท่าเรือ'] != null && row['รหัสท่าเรือ'] !== '' && { sanctionShipPortCode: String(row['รหัสท่าเรือ']) }),
      ...(row._sheetName === 'SANCTION (เรือ)' && row['ท่าเรือปลายทาง'] != null && row['ท่าเรือปลายทาง'] !== '' && { sanctionShipPortDest: String(row['ท่าเรือปลายทาง']) }),
      ...(row._sheetName === 'SANCTION (เรือ)' && row['SINGLE STRING NAME (ชื่อเต็ม)'] != null && row['SINGLE STRING NAME (ชื่อเต็ม)'] !== '' && { sanctionShipSingleName: String(row['SINGLE STRING NAME (ชื่อเต็ม)']) }),
      // ท่าเรือปลายทาง: Col B=ชื่อบริษัท, Col C=Type, Col D=Risk Level, Col E=Freeze, Col F=รหัสประเทศ
      ...(row._sheetName === 'ท่าเรือปลายทาง' && row['Type'] != null && row['Type'] !== '' && { portDestType: String(row['Type']) }),
      ...(row._sheetName === 'ท่าเรือปลายทาง' && row['Risk Level'] != null && row['Risk Level'] !== '' && { portDestRiskLevel: String(row['Risk Level']) }),
      ...(row._sheetName === 'ท่าเรือปลายทาง' && row['Freeze'] != null && row['Freeze'] !== '' && { portDestFreeze: String(row['Freeze']) }),
      ...(row._sheetName === 'ท่าเรือปลายทาง' && row['รหัสประเทศ'] != null && row['รหัสประเทศ'] !== '' && { portDestCountryCode: String(row['รหัสประเทศ']) }),
      ...(row._sheetName === 'ท่าเรือปลายทาง' && row['ประเทศ'] != null && row['ประเทศ'] !== '' && { portDestCountry: String(row['ประเทศ']) }),
      // CWS: Col A=รหัส, Col B=ชื่อลูกค้า(→customer), Col C=ขนาดธุรกิจ, Col D=วงเงินสะสมรวม, Col E=Credit Warning Sign, Col F=Watch List
      ...(row['ขนาดธุรกิจ'] != null && row['ขนาดธุรกิจ'] !== '' && { cwsBusinessSize: String(row['ขนาดธุรกิจ']) }),
      ...(row['วงเงินสะสมรวม'] != null && row['วงเงินสะสมรวม'] !== '' && { cwsCreditLimit: String(row['วงเงินสะสมรวม']) }),
      ...(row['Credit Warning Sign'] != null && row['Credit Warning Sign'] !== '' && { cwsWarningSign: String(row['Credit Warning Sign']) }),
      ...(row['Watch List'] != null && row['Watch List'] !== '' && { cwsWatchList: String(row['Watch List']) }),
      // Buyer Check: Col A=Cus ID, Col B=Customer Name(→customer), Col C=Buyer Name, Col D=Expiry Date
      ...(row['Cus ID'] != null && row['Cus ID'] !== '' && { cusId: String(row['Cus ID']) }),
      ...(row['Buyer Name'] && { buyerName: String(row['Buyer Name']) }),
      ...(row['Expiry Date'] != null && row['Expiry Date'] !== '' && {
        // แปลง Excel date serial number → ISO date string (46474 → "2027-03-05")
        expiryDate: typeof row['Expiry Date'] === 'number'
          ? new Date((row['Expiry Date'] - 25569) * 86400 * 1000).toISOString().slice(0, 10)
          : row['Expiry Date'],
      }),
      _sheetName: row._sheetName || '',
      _fileName: row._fileName || '',
      _rawData,
      _allText,
    };

    return {
      ...doc,
      summary: buildAutoSummary(doc),
      aiSummary: buildAutoSummary(doc),
      title: doc.customer || doc.invoiceNumber || Object.values(_rawData).find(v => v && String(v).trim())?.toString() || `Document ${doc.id}`,
      description: buildAutoSummary(doc)
    };
  });
};

// Mapping: search field → Excel column names ที่ต้องค้นหา
const FIELD_COLUMN_MAP = {
  customerCode: ['Cus ID'],                              // Buyer Check Col A เท่านั้น
  customerName: ['Customer Name', 'ชื่อลูกค้า', 'บริษัท', 'ชื่อบริษัท'],  // Col B ทุก sheet
  buyerName:    ['Buyer Name'],                           // Buyer Check Col C
  port:         ['รหัสท่าเรือ', 'ท่าเรือปลายทาง'],         // SANCTION (เรือ) Col C (รหัส) และ Col D (ชื่อ)
  country:      ['รหัสประเทศ', 'ประเทศ'],                  // ท่าเรือปลายทาง Col F, Col G
};

// Mapping เพิ่มเติม: รหัสลูกค้า CWS (Col A ของ CWS sheet)
const CWS_CODE_COLS = ['รหัส'];

// Helper: ค้นหาค่าเฉพาะ column ที่กำหนดใน FIELD_COLUMN_MAP (case-insensitive)
const matchField = (rawData, fieldName, value) => {
  if (!value) return true;
  const needle = String(value).trim().toLowerCase();
  const targetColumns = FIELD_COLUMN_MAP[fieldName];
  if (targetColumns?.length) {
    // ค้นเฉพาะ column ที่กำหนด
    return targetColumns.some(col => {
      const cellValue = rawData?.[col];
      return cellValue !== undefined && String(cellValue).toLowerCase().includes(needle);
    });
  }
  // fallback: ค้นทุก column
  return Object.values(rawData || {}).some(v => String(v || '').toLowerCase().includes(needle));
};

// Columns ที่เก็บ "ชื่อบริษัท" ใน Excel ทุก Sheet
const COMPANY_NAME_COLS = ['Customer Name', 'ชื่อลูกค้า', 'บริษัท', 'ชื่อบริษัท'];

// Helper: ดึงชื่อบริษัทจาก rawData
const extractCompanyName = (rawData) => {
  for (const col of COMPANY_NAME_COLS) {
    const v = rawData?.[col];
    if (v && String(v).trim()) return String(v).trim();
  }
  return null;
};

export const searchDocuments = async (query = '', filters = {}) => {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  const docs = await loadDocuments();

  // แยก field filters ออกจาก generic filters
  const { customerCode, customerName, buyerName, port, country, source: filterSource, status: filterStatus, ...otherFilters } = filters;

  // ─── Step 1: หา direct matches ───────────────────────────────────────────────
  const directMatches = docs.filter((doc) => {
    const haystack = doc._allText || '';
    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);

    const hasFieldFilter = customerCode || customerName || buyerName || port || country;
    let matchesFields = true;
    if (hasFieldFilter) {
      // customerCode ค้นหา Buyer Check Col A (Cus ID) และ CWS Col A (รหัส) แยกกัน
      const matchesCusId = customerCode
        ? matchField(doc._rawData, 'customerCode', customerCode)
        : false;
      const matchesCwsCode = customerCode
        ? CWS_CODE_COLS.some(col => {
            const v = doc._rawData?.[col];
            return v !== undefined && String(v).toLowerCase().includes(String(customerCode).trim().toLowerCase());
          })
        : false;

      matchesFields = (
        matchesCusId || matchesCwsCode ||
        (customerName ? matchField(doc._rawData, 'customerName', customerName) : false) ||
        (buyerName    ? matchField(doc._rawData, 'buyerName',    buyerName)    : false) ||
        (port         ? matchField(doc._rawData, 'port',         port)         : false) ||
        (country      ? matchField(doc._rawData, 'country',      country)      : false)
      );
    }

    const matchesSource = !filterSource || doc.source === filterSource;
    const matchesStatus = !filterStatus || doc.status === filterStatus;

    return matchesQuery && matchesFields && matchesSource && matchesStatus;
  });

  // ─── Step 2: สกัดชื่อบริษัทจาก direct matches ────────────────────────────────
  const companyNames = new Set();
  directMatches.forEach(doc => {
    const name = extractCompanyName(doc._rawData);
    if (name) companyNames.add(name.toLowerCase());
  });

  // ─── Step 3: ค้นหาข้อมูลบริษัทเดียวกันจากทุก Sheet ─────────────────────────
  // ★ ถ้าค้นเฉพาะ buyerName (ไม่มี field อื่น) → ไม่ expand ไป sheet อื่น
  //    เพื่อคืนเฉพาะข้อมูล Buyer Check Column C
  const onlyBuyerNameSearch = buyerName && !customerCode && !customerName && !port && !country && !normalizedQuery;
  let allResults = [...directMatches];
  if (companyNames.size > 0 && !onlyBuyerNameSearch) {
    const seenIds = new Set(directMatches.map(d => d.id));
    docs.forEach(doc => {
      if (seenIds.has(doc.id)) return;
      const docCompany = extractCompanyName(doc._rawData);
      if (docCompany && companyNames.has(docCompany.toLowerCase())) {
        seenIds.add(doc.id);
        allResults.push(doc);
      }
    });
  }

  // ─── Step 4: Group Buyer Check rows ที่มี cusId เดียวกัน → buyerList[] ────────
  const buyerCheckMap = new Map(); // key → merged doc index in finalResults
  const finalResults = [];

  allResults.forEach((doc) => {
    if (doc._sheetName !== 'Buyer Check') {
      finalResults.push({ ...doc });
      return;
    }
    // Buyer Check: group by cusId (fallback to customer name)
    const key = doc.cusId || doc.customer || doc.id;

    // ถ้ามี buyerName filter → แสดงเฉพาะ buyer ที่ตรงกับคำค้นหา
    const buyerNameNeedle = buyerName ? String(buyerName).trim().toLowerCase() : null;
    const docBuyerMatches = !buyerNameNeedle ||
      String(doc.buyerName || '').toLowerCase().includes(buyerNameNeedle);

    if (!buyerCheckMap.has(key)) {
      const merged = { ...doc, buyerList: [] };
      // เพิ่ม buyer ตัวแรกเข้า list (เฉพาะที่ตรง filter)
      if ((doc.buyerName || doc.expiryDate) && docBuyerMatches) {
        merged.buyerList.push({ buyerName: doc.buyerName || '', expiryDate: doc.expiryDate || '' });
      }
      buyerCheckMap.set(key, finalResults.length);
      finalResults.push(merged);
    } else {
      // เพิ่ม buyer เพิ่มเติมเข้า list ของ card เดิม (เฉพาะที่ตรง filter)
      const idx = buyerCheckMap.get(key);
      if ((doc.buyerName || doc.expiryDate) && docBuyerMatches) {
        finalResults[idx].buyerList.push({ buyerName: doc.buyerName || '', expiryDate: doc.expiryDate || '' });
      }
    }
  });

  // ─── Step 5: Merge per-company rows → one card per company ───────────────────
  const companyMergeMap = new Map();
  const mergedResults = [];

  finalResults.forEach((doc) => {
    const companyKey = (doc.customer || '').toLowerCase().trim() || doc.id;
    if (!companyMergeMap.has(companyKey)) {
      companyMergeMap.set(companyKey, mergedResults.length);
      mergedResults.push({ ...doc });
      return;
    }
    const idx = companyMergeMap.get(companyKey);
    const base = mergedResults[idx];
    // Buyer Check
    if (doc.buyerList?.length) base.buyerList = [...(base.buyerList || []), ...doc.buyerList];
    if (doc.cusId && !base.cusId) base.cusId = doc.cusId;
    if (doc.buyerName && !base.buyerName) base.buyerName = doc.buyerName;
    if (doc.expiryDate && !base.expiryDate) base.expiryDate = doc.expiryDate;
    // CWS
    if (doc.cwsBusinessSize && !base.cwsBusinessSize) base.cwsBusinessSize = doc.cwsBusinessSize;
    if (doc.cwsCreditLimit && !base.cwsCreditLimit) base.cwsCreditLimit = doc.cwsCreditLimit;
    if (doc.cwsWarningSign && !base.cwsWarningSign) base.cwsWarningSign = doc.cwsWarningSign;
    if (doc.cwsWatchList && !base.cwsWatchList) base.cwsWatchList = doc.cwsWatchList;
    // SANCTION (สินค้า)
    if (doc.sanctionSeq && !base.sanctionSeq) base.sanctionSeq = doc.sanctionSeq;
    if (doc.sanctionType && !base.sanctionType) base.sanctionType = doc.sanctionType;
    if (doc.sanctionProduct && !base.sanctionProduct) base.sanctionProduct = doc.sanctionProduct;
    if (doc.sanctionCode1 && !base.sanctionCode1) base.sanctionCode1 = doc.sanctionCode1;
    if (doc.sanctionCode2 && !base.sanctionCode2) base.sanctionCode2 = doc.sanctionCode2;
    // SANCTION (เรือ)
    if (doc.sanctionShipPortCode && !base.sanctionShipPortCode) base.sanctionShipPortCode = doc.sanctionShipPortCode;
    if (doc.sanctionShipPortDest && !base.sanctionShipPortDest) base.sanctionShipPortDest = doc.sanctionShipPortDest;
    if (doc.sanctionShipSingleName && !base.sanctionShipSingleName) base.sanctionShipSingleName = doc.sanctionShipSingleName;
    // ท่าเรือปลายทาง
    if (doc.portDestType && !base.portDestType) base.portDestType = doc.portDestType;
    if (doc.portDestRiskLevel && !base.portDestRiskLevel) base.portDestRiskLevel = doc.portDestRiskLevel;
    if (doc.portDestFreeze && !base.portDestFreeze) base.portDestFreeze = doc.portDestFreeze;
    if (doc.portDestCountryCode && !base.portDestCountryCode) base.portDestCountryCode = doc.portDestCountryCode;
    if (doc.portDestCountry && !base.portDestCountry) base.portDestCountry = doc.portDestCountry;
  });

  return mergedResults;
};

export const getTrendingSearches = async () => {
  return ['INV-1002', 'ABC', 'overdue', 'DEF']; // trending
};

export const buildSourceTrace = (doc) => {
  const overdueDays = Number(doc.overdueDays) || 0;
  const amount = Number(doc.amount) || 0;
  const status = (doc.status || '').toLowerCase();
  const isCritical = status === 'critical';
  const isHighRisk = isCritical || overdueDays >= 30;
  const isMediumRisk = !isHighRisk && overdueDays >= 15 && amount >= 100000;

  return [
    {
      label: 'สถานะ Sanction',
      sourceLabel: 'Sanction Screening',
      result: isHighRisk ? 'พบรายชื่อเสี่ยง' : isMediumRisk ? 'ต้องตรวจสอบ' : 'ไม่พบรายชื่อ',
      severity: isHighRisk ? 'danger' : isMediumRisk ? 'warning' : 'safe'
    },
    {
      label: 'Buyer Check',
      sourceLabel: 'Buyer Check',
      result: isCritical ? 'ต้องตรวจสอบ' : 'ผ่าน',
      severity: isCritical ? 'warning' : 'safe'
    },
    {
      label: 'CWS',
      sourceLabel: 'CWS',
      result: overdueDays > 0 ? `มีประวัติค้างชำระ ${overdueDays} วัน` : 'Watchlist ปกติ',
      severity: overdueDays >= 15 ? 'danger' : overdueDays > 0 ? 'warning' : 'safe'
    },
    {
      label: 'AMLO',
      sourceLabel: 'AMLO',
      result: isHighRisk ? 'พบข้อมูลเสี่ยง' : 'ไม่พบข้อมูลเสี่ยง',
      severity: isHighRisk ? 'danger' : 'safe'
    },
    {
      label: 'TDR',
      sourceLabel: 'TDR',
      result: 'ไม่พบเอกสารซ้ำ',
      severity: 'safe'
    },
    {
      label: 'AS400',
      sourceLabel: 'AS400',
      result: 'ไม่พบ Ticket ซ้ำ',
      severity: 'safe'
    }
  ];
};

export const getDocumentSourceTrace = async (id) => {
  const docs = await loadDocuments();
  const doc = docs.find((d) => d.id === id);
  if (!doc) return null;
  return { id: doc.id, customer: doc.customer, trace: buildSourceTrace(doc) };
};
