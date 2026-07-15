import { searchDocuments } from '../services/searchDataService.js';

export const getDashboard = async (req, res) => {
  try {
    const docs = await searchDocuments('', {});

    const buyerCheck = docs.filter(d => d._sheetName === 'Buyer Check');
    const cws        = docs.filter(d => d._sheetName === 'CWS');
    const sanction   = docs.filter(d => (d._sheetName || '').includes('SANCTION'));
    const port       = docs.filter(d => d._sheetName === 'ท่าเรือปลายทาง');

    // นับตาม _sheetName เพื่อแสดงใน Dashboard
    const bySheet = {};
    docs.forEach(doc => {
      const sheet = doc._sheetName || 'อื่นๆ';
      bySheet[sheet] = (bySheet[sheet] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        total:     docs.length,
        incoming:  buyerCheck.length,
        pending:   cws.length,
        completed: port.length,
        nearDue:   sanction.length,
      },
      items: {
        all:       docs,
        incoming:  buyerCheck,
        pending:   cws,
        completed: port,
        nearDue:   sanction,
      },
      bySheet,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
