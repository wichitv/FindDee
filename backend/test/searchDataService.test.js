import test from 'node:test';
import assert from 'node:assert/strict';
import { searchDocuments, getTrendingSearches } from '../src/services/searchDataService.js';

test('searchDocuments returns overdue invoice matches for customer names', async () => {
  const results = await searchDocuments('ABC', {});

  assert.ok(results.length > 0, 'expected at least one matching invoice');
  assert.ok(results.some((doc) => doc.customer?.toLowerCase().includes('abc')));
});

test('searchDocuments supports invoice number lookups', async () => {
  const results = await searchDocuments('INV-1002', {});

  assert.equal(results.length, 1);
  assert.match(results[0].invoiceNumber || '', /INV-1002/);
});

test('getTrendingSearches returns a non-empty list', async () => {
  const trending = await getTrendingSearches();

  assert.ok(Array.isArray(trending));
  assert.ok(trending.length > 0);
});
