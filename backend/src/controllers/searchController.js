// Search Controller
// ใช้ข้อมูลจาก service ที่อ่านจากไฟล์ข้อมูลจริง

import { searchDocuments, getTrendingSearches as getTrendingDocuments, getDocumentSourceTrace } from '../services/searchDataService.js';

const normalizeFilters = (filters) => {
  if (!filters) return {};
  if (typeof filters === 'object') return filters;
  if (typeof filters === 'string') {
    const params = new URLSearchParams(filters);
    return Object.fromEntries(params.entries());
  }
  return {};
};

const buildSearchResults = async (query = '', filters = {}) => {
  const normalizedFilters = normalizeFilters(filters);
  return searchDocuments(query, normalizedFilters);
};

export const search = async (req, res) => {
  try {
    const { q, filters } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const results = await buildSearchResults(q, filters);

    res.json({
      success: true,
      results,
      total: results.length,
      query: q,
      filters: normalizeFilters(filters)
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const advancedSearch = async (req, res) => {
  try {
    const { query, filters, sortBy, limit = 20, offset = 0 } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const results = await buildSearchResults(query, filters);
    const paginatedResults = results.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      results: paginatedResults,
      total: results.length,
      limit: Number(limit),
      offset: Number(offset),
      sortBy
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTrendingSearches = async (req, res) => {
  try {
    const trendingSearches = await getTrendingDocuments();

    res.json({
      success: true,
      data: trendingSearches
    });
  } catch (error) {
    console.error('Trending searches error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSourceTrace = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Document id is required' });
    }
    const result = await getDocumentSourceTrace(id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Source trace error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
