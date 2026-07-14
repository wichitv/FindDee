import express from 'express';
import * as collectionController from '../controllers/collectionController.js';

const router = express.Router();

// Collection routes
router.get('/', collectionController.getAllCollections);
router.post('/', collectionController.createCollection);
router.get('/:id', collectionController.getCollectionById);
router.put('/:id', collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);
router.post('/:id/documents', collectionController.addDocumentToCollection);
router.delete('/:id/documents/:docId', collectionController.removeDocumentFromCollection);

export default router;
