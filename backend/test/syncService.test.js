import test from 'node:test';
import assert from 'node:assert/strict';
import syncService from '../src/services/syncService.js';

test('startSync should complete the full pull-process-push workflow', async () => {
  const syncId = await syncService.startSync({ saction: true, buyerCheck: true });
  const status = syncService.getStatus(syncId);

  assert.ok(status, 'sync status should be available');
  assert.equal(status.status, 'completed');
  assert.equal(status.progress, 100);
  assert.ok(status.processedData.length > 0);
});
