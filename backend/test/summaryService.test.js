import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAutoSummary, buildAggregationSummary } from '../src/services/summaryService.js';

test('buildAutoSummary creates a meaningful summary for invoices', () => {
  const doc = {
    invoiceNumber: 'INV-1001',
    customer: 'ABC Corporation',
    amount: 125000,
    overdueDays: 12,
    status: 'Overdue',
    content: 'Invoice INV-1001 for ABC Corporation overdue 12 days.'
  };

  const summary = buildAutoSummary(doc);

  assert.match(summary, /ABC Corporation/i);
  assert.match(summary, /INV-1001/i);
  assert.match(summary, /12/i);
});

test('buildAggregationSummary aggregates counts and amounts from documents', () => {
  const docs = [
    { customer: 'ABC Corporation', amount: 125000, overdueDays: 12, status: 'Overdue', source: 'Excel Import' },
    { customer: 'XYZ Trading', amount: 87000, overdueDays: 5, status: 'Overdue', source: 'Website' },
    { customer: 'DEF Logistics', amount: 243000, overdueDays: 30, status: 'Critical', source: 'Excel Import' }
  ];

  const summary = buildAggregationSummary(docs);

  assert.equal(summary.totalItems, 3);
  assert.equal(summary.totalAmount, 455000);
  assert.equal(summary.statusBreakdown.Overdue, 2);
  assert.equal(summary.sourceBreakdown['Excel Import'], 2);
});
