const formatCurrency = (value) => {
  const numericValue = Number(value || 0);
  return Number.isFinite(numericValue) ? numericValue.toLocaleString('th-TH') : '0';
};

export const buildAutoSummary = (doc = {}) => {
  if (typeof doc?.summary === 'string' && doc.summary.trim()) {
    return doc.summary.trim();
  }

  const title = doc.title || doc.name || doc.invoiceNumber || doc.orderId || doc.itemId || 'ข้อมูล';
  const customer = doc.customer || doc.company || doc.source || '';
  const amount = doc.amount || doc.value || '';
  const overdueDays = doc.overdueDays || doc.daysOverdue || '';
  const status = doc.status || '';
  const source = doc.source || '';
  const content = doc.content || doc.description || '';

  const parts = [];

  if (title) {
    parts.push(String(title));
  }

  if (customer) {
    parts.push(`สำหรับ ${customer}`);
  }

  if (amount) {
    parts.push(`มูลค่า ${formatCurrency(amount)} บาท`);
  }

  if (overdueDays) {
    parts.push(`ค้างชำระ ${overdueDays} วัน`);
  }

  if (status) {
    parts.push(`สถานะ ${status}`);
  }

  if (source) {
    parts.push(`จาก ${source}`);
  }

  if (content && content !== title) {
    parts.push(content);
  }

  return parts.length > 0 ? `${parts.join(' ')}.` : 'ข้อมูลถูกประมวลผลและพร้อมแสดงผลแล้ว.';
};

export const buildAggregationSummary = (docs = []) => {
  const totalItems = docs.length;
  const totalAmount = docs.reduce((sum, doc) => sum + Number(doc.amount || doc.value || 0), 0);
  const overdueCount = docs.filter((doc) => Number(doc.overdueDays || 0) > 0).length;
  const criticalCount = docs.filter((doc) => String(doc.status || '').toLowerCase() === 'critical').length;
  const highPriorityCount = docs.filter((doc) => Number(doc.overdueDays || 0) >= 15 || String(doc.status || '').toLowerCase() === 'critical').length;

  const statusBreakdown = docs.reduce((acc, doc) => {
    const status = doc.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const sourceBreakdown = docs.reduce((acc, doc) => {
    const source = doc.source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const averageOverdueDays = totalItems > 0
    ? (docs.reduce((sum, doc) => sum + Number(doc.overdueDays || 0), 0) / totalItems).toFixed(1)
    : '0';

  return {
    totalItems,
    totalAmount,
    overdueCount,
    criticalCount,
    highPriorityCount,
    averageOverdueDays: Number(averageOverdueDays),
    statusBreakdown,
    sourceBreakdown
  };
};
