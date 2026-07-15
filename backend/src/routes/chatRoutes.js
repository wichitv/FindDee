import { Router } from 'express';
import { getToken, sendMessage, getMessages } from '../controllers/chatController.js';

const router = Router();

router.get('/token', getToken);
router.post('/conversations/:id/message', sendMessage);
router.get('/conversations/:id/messages', getMessages);

export default router;
