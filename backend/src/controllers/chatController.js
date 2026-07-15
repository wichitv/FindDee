import axios from 'axios';
import https from 'https';

const DL = 'https://directline.botframework.com/v3/directline';

// ข้าม SSL certificate verification (สำหรับเครือข่ายองค์กรที่มี SSL inspection)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const getSecret = () => process.env.DIRECTLINE_SECRET;
const dlHeaders = (token) => ({ Authorization: `Bearer ${token || getSecret()}` });

// GET /api/chat/token  → ขอ token + start conversation
export const getToken = async (req, res) => {
  const secret = getSecret();
  if (!secret) {
    return res.status(500).json({ success: false, error: 'DIRECTLINE_SECRET not configured' });
  }
  try {
    const tokenRes = await axios.post(`${DL}/tokens/generate`, {}, { headers: dlHeaders(), httpsAgent });
    const token = tokenRes.data.token;
    const convRes = await axios.post(`${DL}/conversations`, {}, { headers: dlHeaders(token), httpsAgent });
    res.json({ success: true, token, conversationId: convRes.data.conversationId });
  } catch (error) {
    const msg = error.response?.data?.error?.message || JSON.stringify(error.response?.data) || error.message;
    console.error('[Chat] token/start error:', msg);
    res.status(500).json({ success: false, error: String(msg) });
  }
};

// POST /api/chat/conversations/:id/message  → ส่งข้อความของ user
export const sendMessage = async (req, res) => {
  const { id } = req.params;
  const { token, text } = req.body;
  if (!token || !text || !id) {
    return res.status(400).json({ success: false, error: 'token, text, id required' });
  }
  try {
    const r = await axios.post(
      `${DL}/conversations/${id}/activities`,
      { type: 'message', text, from: { id: 'user', name: 'User' } },
      { headers: dlHeaders(token), httpsAgent }
    );
    res.json({ success: true, id: r.data.id });
  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message;
    console.error('[Chat] send error:', msg);
    res.status(500).json({ success: false, error: String(msg) });
  }
};

// GET /api/chat/conversations/:id/messages  → ดึง bot replies
export const getMessages = async (req, res) => {
  const { id } = req.params;
  const { token, watermark } = req.query;
  if (!token || !id) {
    return res.status(400).json({ success: false, error: 'token, id required' });
  }
  try {
    const url = `${DL}/conversations/${id}/activities${watermark ? `?watermark=${watermark}` : ''}`;
    const r = await axios.get(url, { headers: dlHeaders(token), httpsAgent });
    const botMessages = (r.data.activities || [])
      .filter(a => a.type === 'message' && a.from?.role === 'bot')
      .map(a => ({ text: a.text || '', timestamp: a.timestamp }));
    res.json({ success: true, messages: botMessages, watermark: r.data.watermark });
  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message;
    res.status(500).json({ success: false, error: String(msg) });
  }
};
