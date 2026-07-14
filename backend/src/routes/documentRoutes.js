import express from 'express';
import * as documentController from '../controllers/documentController.js';

const router = express.Router();

// Document routes
router.get('/:id', documentController.getDocumentById);
router.get('/:id/summary', documentController.getDocumentSummary);
router.post('/save', documentController.saveDocument);
router.get('/', documentController.getAllDocuments);

export default router;
