/**
 * AI Summary Service
 * Generates AI-powered batch summaries of customer/invoice data via OpenRouter
 */

import axios from 'axios';
import https from 'https';

// Allow self-signed / corporate CA in non-production environments
const httpsAgent = process.env.NODE_ENV !== 'production'
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;

/**
 * Build aggregation stats from docs array
 */
const buildStats = (docs = []) => {
  const totalItems = docs.length;
  const totalAmount = docs.reduce((sum, d) => sum + Number(d.amount || d.value || 0), 0);
  const overdueCount = docs.filter((d) => Number(d.overdueDays || 0) > 0).length;
  const criticalCount = docs.filter((d) => String(d.status || '').toLowerCase() === 'critical').length;
  const highPriorityCount = docs.filter(
    (d) => Number(d.overdueDays || 0) >= 15 || String(d.status || '').toLowerCase() === 'critical'
  ).length;
  const avgOverdueDays =
    totalItems > 0
      ? (docs.reduce((sum, d) => sum + Number(d.overdueDays || 0), 0) / totalItems).toFixed(1)
      : '0';

  const statusBreakdown = docs.reduce((acc, d) => {
    const s = d.status || 'Unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return {
    totalItems,
    totalAmount,
    overdueCount,
    criticalCount,
    highPriorityCount,
    avgOverdueDays: Number(avgOverdueDays),
    statusBreakdown
  };
};

/**
 * Build the Thai-language prompt for AI
 */
const buildAIPrompt = (docs = []) => {
  const stats = buildStats(docs);

  // Send at most 20 sample records to avoid token limits
  const sampleRecords = docs.slice(0, 20).map((d) => ({
    customer: d.customer || d.company || d.name || '',
    invoice: d.invoiceNumber || d.id || '',
    amount: d.amount || d.value || 0,
    overdueDays: d.overdueDays || 0,
    status: d.status || '',
    source: d.source || ''
  }));

  const systemPrompt = `คุณเป็นผู้ช่วย AI สำหรับวิเคราะห์ข้อมูลลูกค้าและใบแจ้งหนี้
ตอบเป็นภาษาไทยเสมอ
รูปแบบคำตอบ:
1. สรุปภาพรวม (1-2 ประโยค)
2. ประเด็นสำคัญ (bullet points 3-5 ข้อ โดยขึ้นต้นแต่ละข้อด้วย "•")
3. ข้อแนะนำเร่งด่วน (bullet points 2-3 ข้อ โดยขึ้นต้นแต่ละข้อด้วย "→")
ห้ามใช้ markdown (ห้ามใช้ ** หรือ #) ตอบเป็นข้อความธรรมดาเท่านั้น`;

  const userPrompt = `ข้อมูลสรุปรวม:
- รายการทั้งหมด: ${stats.totalItems} รายการ
- ยอดรวม: ${Number(stats.totalAmount).toLocaleString('th-TH')} บาท
- ค้างชำระ: ${stats.overdueCount} รายการ
- วิกฤต (Critical): ${stats.criticalCount} รายการ
- ความเร่งด่วนสูง: ${stats.highPriorityCount} รายการ
- เฉลี่ยวันค้างชำระ: ${stats.avgOverdueDays} วัน
- สถานะ: ${JSON.stringify(stats.statusBreakdown)}

ตัวอย่างข้อมูล (${sampleRecords.length} รายการแรก):
${JSON.stringify(sampleRecords, null, 2)}

กรุณาวิเคราะห์และสรุปข้อมูลชุดนี้`;

  return { systemPrompt, userPrompt, stats };
};

/**
 * Call OpenRouter API
 */
const callOpenRouter = async (systemPrompt, userPrompt) => {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY ยังไม่ได้ตั้งค่าใน .env');
  }

  const response = await axios.post(
    `${baseUrl}/chat/completions`,
    {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1024
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'FindDee Information Aggregator'
      },
      timeout: 30000,
      ...(httpsAgent && { httpsAgent })
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI ไม่ได้ส่งผลลัพธ์กลับมา');
  }

  return content.trim();
};

/**
 * Main export: Generate AI batch summary for docs array
 * Returns { summary: string, stats: object, model: string }
 */
export const generateBatchSummary = async (docs = []) => {
  if (!Array.isArray(docs) || docs.length === 0) {
    throw new Error('ไม่มีข้อมูลสำหรับสรุป');
  }

  const { systemPrompt, userPrompt, stats } = buildAIPrompt(docs);
  const summary = await callOpenRouter(systemPrompt, userPrompt);

  return {
    summary,
    stats,
    model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    generatedAt: new Date().toISOString()
  };
};
