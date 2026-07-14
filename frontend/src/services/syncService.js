/**
 * Sync Service - Frontend API calls for data sync operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const syncService = {
  /**
   * Start a new sync operation (Pull phase)
   */
  async startSync(sources = { onedrive: true, websites: true, companyApis: true }) {
    const response = await fetch(`${API_BASE_URL}/sync/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sources })
    });

    if (!response.ok) {
      throw new Error(`Sync start failed: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Get status of a sync operation
   */
  async getSyncStatus(syncId) {
    const response = await fetch(`${API_BASE_URL}/sync/status/${syncId}`);

    if (!response.ok) {
      throw new Error(`Failed to get sync status: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Poll for sync status updates
   * @param {string} syncId - The sync operation ID
   * @param {number} interval - Polling interval in ms (default: 1000ms)
   * @param {function} onUpdate - Callback function called on each update
   * @returns {function} Stop polling function
   */
  pollSyncStatus(syncId, interval = 1000, onUpdate) {
    const pollInterval = setInterval(async () => {
      try {
        const response = await this.getSyncStatus(syncId);
        if (response.success) {
          onUpdate(response.data);

          // Stop polling when sync is complete or error
          if (response.data.status === 'completed' || response.data.status === 'error') {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);

    return () => clearInterval(pollInterval);
  },

  /**
   * Get processed data from a sync operation
   */
  async getProcessedData(syncId) {
    const response = await fetch(`${API_BASE_URL}/sync/data/${syncId}`);

    if (!response.ok) {
      throw new Error(`Failed to get processed data: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Upload an Excel file to backend/data/
   */
  async uploadExcelFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/sync/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'อัปโหลดไฟล์ล้มเหลว');
    }
    return data;
  },

  /**
   * Push processed data to destinations
   */
  async pushData(syncId, destinations = { onedrive: true, companyApis: true }) {
    const response = await fetch(`${API_BASE_URL}/sync/push/${syncId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinations })
    });

    if (!response.ok) {
      throw new Error(`Push failed: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Get all active sync operations
   */
  async getAllSyncs() {
    const response = await fetch(`${API_BASE_URL}/sync/all`);

    if (!response.ok) {
      throw new Error(`Failed to get syncs: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Clear completed sync operations
   */
  async clearCompleted() {
    const response = await fetch(`${API_BASE_URL}/sync/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to clear syncs: ${response.statusText}`);
    }

    return await response.json();
  }
};

export default syncService;
