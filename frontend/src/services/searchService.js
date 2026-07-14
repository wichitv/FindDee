import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const normalizeResponse = (payload) => {
  const results = Array.isArray(payload?.results)
    ? payload.results
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return {
    ...payload,
    results,
    total: Number(payload?.total ?? payload?.count ?? results.length ?? 0)
  };
};

const searchService = {
  // Search documents
  // queryObj รองรับทั้ง string และ object (customerCode, customerName, port, country, ...)
  search: async (queryObj, filters = {}) => {
    try {
      // ส่ง field แยกโดยตรง เพื่อให้ backend ทำ OR logic ต่อ field
      const fieldParams = typeof queryObj === 'string'
        ? { q: queryObj }
        : Object.fromEntries(
            Object.entries(queryObj || {}).filter(([, v]) => String(v || '').trim())
          );

      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: { ...fieldParams, ...filters }
      });
      return normalizeResponse(response.data);
    } catch (error) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'ค้นหาล้มเหลว');
    }
  },

  // Advanced search
  advancedSearch: async (searchParams) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/search/advanced`, searchParams);
      return normalizeResponse(response.data);
    } catch (error) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'ค้นหาขั้นสูงล้มเหลว');
    }
  },

  // Get document details
  getDocument: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'ไม่สามารถโหลดเอกสาร');
    }
  },

  // Get document summary
  getDocumentSummary: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/${id}/summary`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'ไม่สามารถสรุปเอกสาร');
    }
  },

  // Get collections
  getCollections: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/collections`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'ไม่สามารถโหลดคอลเลกชัน');
    }
  },

  // Save document to collection
  saveToCollection: async (documentId, collectionId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/documents/save`, {
        documentId,
        collectionId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'ไม่สามารถบันทึกเอกสาร');
    }
  },

  // Get source trace for a document
  getSourceTrace: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/search/source-trace`, { params: { id } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'ไม่สามารถดึง Source Trace');
    }
  }
};

export default searchService;
