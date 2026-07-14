import express from 'express';
import { summarizeBatch } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/summarize — batch summary via OpenRouter
router.post('/summarize', summarizeBatch);

export default router;
