// Document Controller
// ตัวอย่าง endpoints สำหรับการจัดการเอกสาร

import { buildAutoSummary } from '../services/summaryService.js';

const sampleDocuments = [
  {
    id: 'doc-1',
    title: 'แผนกลยุทธ์การตลาด Q3',
    description: 'แผนงานและตัวชี้วัดสำหรับการขยายตลาดในไตรมาสที่ 3',
    content: 'กลยุทธ์การตลาดรวมถึงการเพิ่มคอนเวอร์ชันผ่านแคมเปญดิจิทัลและการสร้างความสัมพันธ์กับลูกค้า',
    source: 'OneDrive',
    url: 'https://example.com/doc-1',
    date: '2026-06-15',
    summary: 'โฟกัสที่การเพิ่มยอดขายผ่านช่องทางออนไลน์และการรีทาร์เก็ต'
  },
  {
    id: 'doc-2',
    title: 'รายงานผลประกอบการทีมพัฒนา',
    description: 'สรุปสถานะโครงการและคำแนะนำสำหรับการส่งมอบในเดือนหน้า',
    content: 'ทีมพัฒนาเกินเป้าหมายในด้านคุณภาพและความเร็วในการส่งมอบระบบใหม่',
    source: 'Company API',
    url: 'https://example.com/doc-2',
    date: '2026-06-20',
    summary: 'โครงการมีความคืบหน้า 82% และไม่มีปัญหาเร่งด่วน'
  }
];

export const getAllDocuments = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const paginatedDocuments = sampleDocuments.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      data: paginatedDocuments,
      results: paginatedDocuments,
      total: sampleDocuments.length,
      count: paginatedDocuments.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Document ID is required' });
    }

    const document = sampleDocuments.find((item) => item.id === id);

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDocumentSummary = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Document ID is required' });
    }

    const document = sampleDocuments.find((item) => item.id === id);
    const summary = buildAutoSummary(document || { id, title: 'เอกสาร', content: 'ข้อมูลจากระบบ' });

    res.json({
      success: true,
      data: { id, summary }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const saveDocument = async (req, res) => {
  try {
    const { title, content, source, url } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const savedDocument = {
      id: Date.now().toString(),
      title,
      content,
      source,
      url,
      summary: buildAutoSummary({ title, content, source, url }),
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: savedDocument,
      message: 'Document saved successfully'
    });
  } catch (error) {
    console.error('Save document error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
