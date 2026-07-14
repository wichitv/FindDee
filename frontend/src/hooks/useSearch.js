import { useState, useCallback } from 'react';
import searchService from '../services/searchService';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  const search = useCallback(async (queryObj, filters = {}) => {
    const hasValue = queryObj && Object.values(queryObj).some((v) => String(v || '').trim());
    if (!hasValue) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchService.search(queryObj, filters);
      setResults(Array.isArray(data.results) ? data.results : []);
      setTotalResults(Number(data.total || 0));
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setTotalResults(0);
  }, []);

  return {
    results,
    loading,
    error,
    totalResults,
    search,
    clearResults
  };
};
