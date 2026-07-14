import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { buildAutoSummary } from './summaryService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', '..', 'data');
const FALLBACK_FILE = path.join(dataDir, 'Invoice_Overdue_Template.xlsx');
const EXCEL_EXTS = new Set(['.xlsx', '.xls', '.xlsm', '.xlsb']);
const JSON_FILE = path.join(dataDir, 'invoice_overdue_data.json');

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

const loadDocuments = () => {
  const allRows = [];
  const seenIds = new Set();

  // Normalize dedup key: invoiceNumber is common across JSON + Excel (case-insensitive)
  const rowKey = (row) => {
    const inv = (row.invoiceNumber || row.InvoiceNumber || row['Invoice Number'] || '').toString().trim().toUpperCase();
    return inv || (row.id || '').toString().trim().toUpperCase();
  };

  // 1. Load from invoice_overdue_data.json first (primary source), handles malformed JSON)
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
      if (rows.length > 0) {
        console.log(`[searchDataService] Loaded ${rows.length} records from invoice_overdue_data.json`);
        // Self-heal: if file was malformed, rewrite with clean JSON
        try { JSON.parse(content.trim()); } catch {
          try { fs.writeFileSync(JSON_FILE, JSON.stringify(rows, null, 2) + '\n', 'utf8'); } catch {}
        }
      }
    } catch (err) {
      console.error('[searchDataService] Failed to read invoice_overdue_data.json:', err.message);
    }
  }

  // 2. Load from ALL Excel files → ALL sheets (deduplicates against JSON records)
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
      console.error(`[searchDataService] Failed to read ${filePath}:`, err.message);
    }
  }

  return allRows.map((row, index) => {
    const doc = {
      id: row.id || `row-${index + 1}`,
      invoiceNumber: row.invoiceNumber || row.InvoiceNumber || row['Invoice Number'] || '',
      customer: row.customer || row.Customer || row['Customer Name'] || '',
      amount: Number(row.amount || row.Amount || row['Amount (THB)'] || 0),
      overdueDays: Number(row.overdueDays || row.OverdueDays || row['Overdue Days'] || 0),
      status: row.status || row.Status || row['Status'] || 'Unknown',
      source: row.source || row.Source || (row._fileName && row._sheetName ? `${row._fileName} › ${row._sheetName}` : row._sheetName || row._fileName || 'Excel Import'),
      date: row.date || row.Date || row['Invoice Date'] || '',
      summary: row.summary || row.Summary || '',
      content: row.content || row.Content || `${row.invoiceNumber || row.InvoiceNumber || 'Invoice'} ${row.customer || row.Customer || ''}`,
      ...(row.creditLimit != null && { creditLimit: Number(row.creditLimit) }),
      ...(row.withdrawalAmount != null && { withdrawalAmount: Number(row.withdrawalAmount) }),
      ...(row.remainingBalance != null && { remainingBalance: Number(row.remainingBalance) }),
      ...(row.transactionNo != null && { transactionNo: Number(row.transactionNo) }),
      ...(row.assignee && { assignee: row.assignee }),
    };

    return {
      ...doc,
      summary: buildAutoSummary(doc),
      aiSummary: buildAutoSummary(doc),
      title: doc.customer || doc.invoiceNumber || `Document ${doc.id}`,
      description: buildAutoSummary(doc)
    };
  });
};

export const searchDocuments = async (query = '', filters = {}) => {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  const docs = loadDocuments();

  const filtered = docs.filter((doc) => {
    const haystack = [
      doc.invoiceNumber,
      doc.customer,
      doc.summary,
      doc.content,
      doc.status,
      doc.source,
      String(doc.amount || ''),
      String(doc.overdueDays || '')
    ].join(' ').toLowerCase();

    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
    const matchesSource = !filters.source || doc.source === filters.source;
    const matchesStatus = !filters.status || doc.status === filters.status;

    return matchesQuery && matchesSource && matchesStatus;
  });

  return filtered.map((doc) => ({ ...doc }));
};

export const getTrendingSearches = async () => {
  return ['INV-1002', 'ABC', 'overdue', 'DEF'];
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
  const docs = loadDocuments();
  const doc = docs.find((d) => d.id === id);
  if (!doc) return null;
  return { id: doc.id, customer: doc.customer, trace: buildSourceTrace(doc) };
};
