/**
 * Sync Routes - API endpoints for data synchronization
 * 
 * POST /api/sync/start          - Start a new sync operation (Pull phase)
 * GET  /api/sync/status/:id     - Get status of sync operation
 * GET  /api/sync/data/:id       - Get processed data from sync
 * POST /api/sync/push/:id       - Push processed data to destinations
 * GET  /api/sync/all            - Get all active sync operations
 * POST /api/sync/clear          - Clear completed syncs
 */

import express from 'express';
import {
  startSync,
  getSyncStatus,
  getProcessedData,
  pushProcessedData,
  getAllSyncs,
  clearCompletedSyncs,
  uploadFile,
  upload
} from '../controllers/syncController.js';

const router = express.Router();

// Start a new sync operation
router.post('/start', startSync);

// Get status of a specific sync
router.get('/status/:syncId', getSyncStatus);

// Get processed data from a sync
router.get('/data/:syncId', getProcessedData);

// Push processed data to destinations
router.post('/push/:syncId', pushProcessedData);

// Get all active syncs
router.get('/all', getAllSyncs);

// Clear completed sync operations
router.post('/clear', clearCompletedSyncs);

// Upload Excel file to data directory
router.post('/upload', upload.single('file'), uploadFile);

export default router;
