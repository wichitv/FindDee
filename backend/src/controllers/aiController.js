// AI Controller
import { generateBatchSummary } from '../services/aiSummaryService.js';

export const summarizeBatch = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาส่ง data เป็น array ที่มีข้อมูลอย่างน้อย 1 รายการ'
      });
    }

    const result = await generateBatchSummary(data);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI summarize error:', error.message);
    if (error.response) {
      console.error('OpenRouter response status:', error.response.status);
      console.error('OpenRouter response data:', JSON.stringify(error.response.data));
    }

    const statusCode = error.response?.status || 500;
    const message =
      statusCode === 401
        ? 'OPENROUTER_API_KEY ไม่ถูกต้องหรือหมดอายุ'
        : statusCode === 429
          ? 'เกิน rate limit ของ OpenRouter กรุณาลองใหม่อีกครั้ง'
          : error.message || 'เกิดข้อผิดพลาดในการเรียก AI';

    res.status(statusCode > 499 ? 500 : statusCode).json({
      success: false,
      error: message
    });
  }
};
