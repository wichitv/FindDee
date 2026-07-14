/**
 * Sync Controller - Handles sync endpoints
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import XLSX from 'xlsx';
import syncService from '../services/syncService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', '..', 'data');

const ALLOWED_EXTS = new Set(['.xlsx', '.xls', '.xlsm', '.xlsb']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    cb(null, dataDir);
  },
  filename: (_req, file, cb) => {
    // Sanitize: strip path separators, keep original name
    const safe = path.basename(file.originalname).replace(/[/\\]/g, '');
    cb(null, safe);
  }
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error('รองรับเฉพาะไฟล์ Excel (.xlsx, .xls, .xlsm, .xlsb) เท่านั้น'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

export const startSync = async (req, res) => {
  try {
    const { sources = { onedrive: true, websites: true, companyApis: true } } = req.body;

    const syncId = await syncService.startSync(sources);
    const status = syncService.getStatus(syncId);

    res.status(202).json({
      success: true,
      syncId,
      status: status.status,
      message: 'Sync operation started. Pull phase in progress...',
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getSyncStatus = async (req, res) => {
  try {
    const { syncId } = req.params;
    const status = syncService.getStatus(syncId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Sync operation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getProcessedData = async (req, res) => {
  try {
    const { syncId } = req.params;
    const status = syncService.getStatus(syncId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Sync operation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        syncId,
        status: status.status,
        totalItems: status.processedData.length,
        processedData: status.processedData,
        logs: status.logs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const pushProcessedData = async (req, res) => {
  try {
    const { syncId } = req.params;
    const { destinations = { onedrive: true, companyApis: true } } = req.body;

    const status = syncService.getStatus(syncId);
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Sync operation not found'
      });
    }

    await syncService.pushData(syncId, destinations);
    const updatedStatus = syncService.getStatus(syncId);

    res.status(200).json({
      success: true,
      message: 'Data push completed successfully',
      data: updatedStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getAllSyncs = async (req, res) => {
  try {
    const allSyncs = syncService.getAllStatus();
    res.status(200).json({
      success: true,
      data: allSyncs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const clearCompletedSyncs = async (req, res) => {
  try {
    syncService.clearCompleted();
    res.status(200).json({
      success: true,
      message: 'Completed syncs cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'ไม่พบไฟล์ที่อัปโหลด' });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheets = workbook.SheetNames;
    const totalRecords = sheets.reduce((sum, name) => {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: '' });
      return sum + rows.length;
    }, 0);

    res.status(200).json({
      success: true,
      filename: req.file.filename,
      size: req.file.size,
      sheets,
      totalRecords
    });
  } catch (error) {
    // Remove partially saved file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
