/**
 * Sync Service - Handles Pull, Process, and Push operations
 */

import { buildAutoSummary, buildAggregationSummary } from './summaryService.js';
import { searchDocuments } from './searchDataService.js';

// Map Excel document → format ที่ SmartSummaryTable ต้องการ
const docToRow = (doc, sourceName) => ({
  source: sourceName,
  type:   doc._sheetName || sourceName,
  customer: doc.customer || doc.title || '',
  status: doc.status || doc.cwsWarningSign || '',
  detail: doc.summary || doc.description || '',
  amount: doc.amount || 0,
  overdueDays: doc.overdueDays || 0,
  // เก็บ field พิเศษตาม sheet
  cusId:      doc.cusId,
  buyerName:  doc.buyerName,
  expiryDate: doc.expiryDate,
  cwsWarningSign: doc.cwsWarningSign,
  cwsWatchList:   doc.cwsWatchList,
  sanctionType:   doc.sanctionType,
  sanctionProduct: doc.sanctionProduct,
  portDestRiskLevel: doc.portDestRiskLevel,
});

class SyncService {
  constructor() {
    this.activeSyncs = new Map();
    this.syncData = new Map();
  }

  /**
   * Start a new sync operation
   * @returns {string} Sync operation ID
   */
  async startSync(sources = {}) {
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const syncOperation = {
      id: syncId,
      status: 'pulling',
      startTime: new Date(),
      progress: 0,
      sources: sources,
      pulledData: [],
      processedData: [],
      errors: [],
      logs: []
    };

    this.activeSyncs.set(syncId, syncOperation);
    this.syncData.set(syncId, syncOperation);

    // Simulate actual pull operations
    await this.pullData(syncId);

    return syncId;
  }

  /**
   * PULL: Fetch data from configured sources
   */
  async pullData(syncId) {
    const syncOp = this.activeSyncs.get(syncId);
    if (!syncOp) throw new Error('Sync operation not found');

    syncOp.logs.push(`[PULL] Starting data pull from sources...`);
    syncOp.status = 'pulling';
    syncOp.sourceChecklist = {};

    try {
      const sourcesConfig = syncOp.sources;
      const simulateFailures = Array.isArray(sourcesConfig.simulateFailures) ? sourcesConfig.simulateFailures : [];
      const pulledData = [];

      // Helper: pull a single source with per-source error tracking
      const pullSource = async (key, label, fetchFn) => {
        if (!sourcesConfig[key]) {
          syncOp.sourceChecklist[key] = { status: 'skipped', message: 'ไม่ได้เปิดใช้', recordCount: 0 };
          return;
        }
        syncOp.logs.push(`[PULL] Fetching from ${label}...`);
        if (simulateFailures.includes(key)) {
          const errMsg = `${label}: ดึงข้อมูลไม่สำเร็จ (Connection timeout)`;
          syncOp.sourceChecklist[key] = { status: 'failed', message: 'ดึงข้อมูลไม่สำเร็จ (Connection timeout)', recordCount: 0 };
          syncOp.logs.push(`[PULL] ✗ ${errMsg}`);
          syncOp.errors.push(errMsg);
          return;
        }
        try {
          const data = await fetchFn();
          pulledData.push(...data);
          syncOp.sourceChecklist[key] = { status: 'success', message: 'ดึงข้อมูลสำเร็จ', recordCount: data.length };
          syncOp.logs.push(`[PULL] ✓ Retrieved ${data.length} records from ${label}`);
        } catch (err) {
          syncOp.sourceChecklist[key] = { status: 'failed', message: `ดึงข้อมูลไม่สำเร็จ: ${err.message}`, recordCount: 0 };
          syncOp.logs.push(`[PULL] ✗ ${label}: ${err.message}`);
          syncOp.errors.push(`${label}: ${err.message}`);
        }
      };

      // ดึงข้อมูลจริงจาก Excel/OneDrive ครั้งเดียว แล้ว filter ตาม sheet
      let allDocs = [];
      try {
        allDocs = await searchDocuments('', {});
        syncOp.logs.push(`[PULL] ✓ Loaded ${allDocs.length} documents from data source`);
      } catch (err) {
        syncOp.logs.push(`[PULL] ⚠️ Could not load data source: ${err.message}`);
      }

      await pullSource('saction', 'Sanction', async () =>
        allDocs.filter(d => (d._sheetName || '').includes('SANCTION')).map(d => docToRow(d, 'Sanction'))
      );

      await pullSource('buyerCheck', 'Buyer Check', async () =>
        allDocs.filter(d => d._sheetName === 'Buyer Check').map(d => docToRow(d, 'Buyer Check'))
      );

      await pullSource('cws', 'CWS', async () =>
        allDocs.filter(d => d._sheetName === 'CWS').map(d => docToRow(d, 'CWS'))
      );

      await pullSource('amlo', 'AMLO', async () => []);

      await pullSource('tdr', 'TDR', async () => []);

      await pullSource('as400', 'AS400', async () => []);

      syncOp.pulledData = pulledData;
      syncOp.progress = 33;

      // Compute overall completeness status
      const enabledKeys = ['saction', 'buyerCheck', 'cws', 'amlo', 'tdr', 'as400'].filter(k => sourcesConfig[k]);
      const anyFailed = enabledKeys.some(k => syncOp.sourceChecklist[k]?.status === 'failed');
      syncOp.completenessStatus = anyFailed ? 'incomplete' : 'complete';

      syncOp.logs.push(`[PULL] ✓ Pull phase complete. Retrieved ${pulledData.length} data items total.`);
      syncOp.logs.push(anyFailed
        ? `[PULL] ⚠️ Completeness: INCOMPLETE — some sources failed`
        : `[PULL] ✅ Completeness: COMPLETE — all sources pulled successfully`);

      // Automatically start processing and then pushing
      await this.processData(syncId);

      const destinations = {
        saction: Boolean(sourcesConfig.saction),
        buyerCheck: Boolean(sourcesConfig.buyerCheck),
        cws: Boolean(sourcesConfig.cws),
        amlo: Boolean(sourcesConfig.amlo),
        tdr: Boolean(sourcesConfig.tdr),
        as400: Boolean(sourcesConfig.as400)
      };

      await this.pushData(syncId, destinations);

    } catch (error) {
      syncOp.status = 'error';
      syncOp.errors.push(`Pull failed: ${error.message}`);
      syncOp.logs.push(`[PULL] ✗ Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * PROCESS: Filter and process data with AI
   */
  async processData(syncId) {
    const syncOp = this.activeSyncs.get(syncId);
    if (!syncOp) throw new Error('Sync operation not found');

    syncOp.logs.push(`[PROCESS] Starting AI processing of pulled data...`);
    syncOp.status = 'processing';

    try {
      // Warn if completeness check found missing sources
      if (syncOp.completenessStatus === 'incomplete') {
        syncOp.logs.push(`[PROCESS] ⚠️ ข้อมูลไม่ครบถ้วน — กำลังประมวลผลเฉพาะข้อมูลที่ดึงได้`);
      }

      const pulledData = syncOp.pulledData;
      const processedData = [];

      for (const item of pulledData) {
        const processed = {
          ...item,
          aiSummary: buildAutoSummary(item),
          classification: this.classifyData(item),
          extracted_key_info: this.extractKeyInfo(item),
          confidence: 92,
          summary: buildAutoSummary(item),
          title: item.title || item.name || item.orderId || item.itemId || item.customer || item.project || 'Processed Data'
        };
        processedData.push(processed);
      }

      const aggregationSummary = buildAggregationSummary(processedData);
      syncOp.aggregationSummary = aggregationSummary;

      syncOp.processedData = processedData;
      syncOp.progress = 66;
      syncOp.logs.push(`[PROCESS] ✓ Processed ${processedData.length} items with AI`);
      syncOp.logs.push(`[PROCESS] ✓ Applied: Summarization + Classification`);

    } catch (error) {
      syncOp.status = 'error';
      syncOp.errors.push(`Processing failed: ${error.message}`);
      syncOp.logs.push(`[PROCESS] ✗ Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * PUSH: Send processed data back to destinations
   */
  async pushData(syncId, destinations = {}) {
    const syncOp = this.activeSyncs.get(syncId);
    if (!syncOp) throw new Error('Sync operation not found');

    syncOp.logs.push(`[PUSH] Starting data push to destinations...`);
    syncOp.status = 'pushing';

    try {
      let pushCount = 0;

      // Push to OneDrive
      if (destinations.saction) {
        syncOp.logs.push(`[PUSH] Updating Saction review queue...`);
        pushCount += syncOp.processedData.length;
        syncOp.logs.push(`[PUSH] ✓ Sent ${syncOp.processedData.length} records to Saction review`);
      }

      if (destinations.buyerCheck) {
        syncOp.logs.push(`[PUSH] Updating buyer verification records...`);
        pushCount += syncOp.processedData.length;
        syncOp.logs.push(`[PUSH] ✓ Sent ${syncOp.processedData.length} records to Buyer check`);
      }

      syncOp.progress = 100;
      syncOp.status = 'completed';
      syncOp.logs.push(`[PUSH] ✓ Push phase complete. Total records pushed: ${pushCount}`);
      syncOp.endTime = new Date();

    } catch (error) {
      syncOp.status = 'error';
      syncOp.errors.push(`Push failed: ${error.message}`);
      syncOp.logs.push(`[PUSH] ✗ Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get status of a sync operation
   */
  getStatus(syncId) {
    return this.activeSyncs.get(syncId) || null;
  }

  /**
   * Get all active sync operations
   */
  getAllStatus() {
    return Array.from(this.activeSyncs.values());
  }

  /**
   * AI Summary Generation (mock)
   */
  generateSummary(item) {
    const itemStr = JSON.stringify(item);
    if (item.type === 'Excel') {
      return `Summary of ${item.name}: Contains ${item.data?.length || 0} records`;
    } else if (item.type === 'News') {
      return `News headline: ${item.title}. Key point: Market data aggregation.`;
    } else if (item.type === 'Order') {
      return `Order ${item.orderId}: Customer ${item.customer}, Value: $${item.value}`;
    }
    return `Processed: ${item.source} - ${item.type}`;
  }

  /**
   * AI Classification (mock)
   */
  classifyData(item) {
    const keywords = {
      'sales': ['amount', 'customer', 'revenue', 'order'],
      'project': ['status', 'progress', 'project', 'task'],
      'inventory': ['quantity', 'stock', 'inventory', 'item'],
      'news': ['news', 'update', 'headline', 'content']
    };

    const itemStr = JSON.stringify(item).toLowerCase();
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => itemStr.includes(word))) {
        return category;
      }
    }
    return 'general';
  }

  /**
   * Extract Key Information (mock)
   */
  extractKeyInfo(item) {
    const keys = [];
    if (item.customer) keys.push(`Customer: ${item.customer}`);
    if (item.amount) keys.push(`Amount: $${item.amount}`);
    if (item.status) keys.push(`Status: ${item.status}`);
    if (item.progress) keys.push(`Progress: ${item.progress}%`);
    if (item.quantity) keys.push(`Qty: ${item.quantity}`);
    return keys.length > 0 ? keys : ['Data extracted and processed'];
  }

  /**
   * Clear completed sync operations
   */
  clearCompleted() {
    for (const [id, sync] of this.activeSyncs.entries()) {
      if (sync.status === 'completed') {
        this.activeSyncs.delete(id);
      }
    }
  }
}

export default new SyncService();
