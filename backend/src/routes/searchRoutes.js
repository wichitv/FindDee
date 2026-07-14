import express from 'express';
import * as searchController from '../controllers/searchController.js';

const router = express.Router();

// Search routes
router.get('/', searchController.search);
router.post('/advanced', searchController.advancedSearch);
router.get('/trending', searchController.getTrendingSearches);
router.get('/source-trace', searchController.getSourceTrace);

export default router;
