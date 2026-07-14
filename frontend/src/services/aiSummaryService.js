import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const aiSummaryService = {
  /**
   * Send all data to backend for AI batch summary via OpenRouter
   * @param {Array} data - array of customer/invoice objects
   * @returns {Promise<{summary: string, stats: object, model: string, generatedAt: string}>}
   */
  summarizeBatch: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/summarize`, { data });
      return response.data?.data;
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'ไม่สามารถเชื่อมต่อ AI ได้ กรุณาลองใหม่อีกครั้ง';
      throw new Error(msg);
    }
  }
};

export default aiSummaryService;
