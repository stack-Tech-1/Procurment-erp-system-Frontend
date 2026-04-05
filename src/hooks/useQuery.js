"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { queryCache, STALE_TIMES } from '../utils/queryCache.js';

// useQuery hook — fetch data with automatic caching, deduplication, and stale-while-revalidate
//
// Usage:
// const { data, loading, error, refetch } = useQuery('/api/dashboard/manager/kpis', { staleTime: STALE_TIMES.MEDIUM });
//
export const useQuery = (url, options = {}) => {
  const {
    staleTime = STALE_TIMES.MEDIUM,
    enabled = true,              // set to false to skip fetching
    onSuccess = null,
    onError = null,
    transform = null,            // optional function to transform response data
    deps = [],                   // extra dependencies that trigger a refetch
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const abortRef = useRef(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled || !url) {
      setLoading(false);
      return;
    }

    // Check cache first
    if (!force) {
      const cached = queryCache.get(url);
      if (cached) {
        setData(transform ? transform(cached.data) : cached.data);
        setLoading(false);
        setLastFetched(new Date());

        // If stale, refetch in background without showing loading
        if (!cached.isStale) return;
      }
    }

    // Cancel previous request if still in flight
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    // Only show loading spinner if no cached data exists
    const hasCachedData = queryCache.get(url);
    if (!hasCachedData || force) setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const lang = typeof window !== 'undefined' ? (localStorage.getItem('preferredLanguage') || 'en') : 'en';

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${url}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept-Language': lang,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          signal: abortRef.current.signal
        }
      );

      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed with status ${response.status}`);
      }

      const result = await response.json();
      const transformed = transform ? transform(result) : result;

      // Cache the result
      queryCache.set(url, result, staleTime);

      if (isMounted.current) {
        setData(transformed);
        setError(null);
        setLastFetched(new Date());
        setLoading(false);
        if (onSuccess) onSuccess(transformed);
      }

    } catch (err) {
      if (err.name === 'AbortError') return; // Request was cancelled — ignore

      if (isMounted.current) {
        setError(err.message);
        setLoading(false);
        if (onError) onError(err);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled, staleTime, ...deps]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastFetched,
    refetch: () => fetchData(true),   // force refetch, bypass cache
    invalidate: () => queryCache.invalidate(url)
  };
};

// useParallelQueries — fetch multiple endpoints simultaneously
// Usage:
// const { results, loading } = useParallelQueries([
//   { key: 'kpis', url: '/api/dashboard/manager/kpis' },
//   { key: 'charts', url: '/api/dashboard/manager/charts' }
// ]);
export const useParallelQueries = (queries, options = {}) => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const isMounted = useRef(true);

  const fetchAll = useCallback(async (force = false) => {
    if (!isMounted.current) return;

    // Check which queries have stale or missing cache
    const toFetch = queries.filter(q => {
      if (force) return true;
      const cached = queryCache.get(q.url);
      if (!cached) return true;
      if (cached.isStale) return true;
      return false;
    });

    // Serve cached data immediately for all queries
    const cachedResults = {};
    queries.forEach(q => {
      const cached = queryCache.get(q.url);
      if (cached) cachedResults[q.key] = cached.data;
    });

    if (Object.keys(cachedResults).length > 0) {
      setResults(prev => ({ ...prev, ...cachedResults }));
      if (toFetch.length === 0) {
        setLoading(false);
        return;
      }
    }

    if (toFetch.length > 0) setLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const lang = typeof window !== 'undefined' ? (localStorage.getItem('preferredLanguage') || 'en') : 'en';
    const headers = {
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept-Language': lang,
      'Content-Type': 'application/json',
    };

    try {
      const fetches = toFetch.map(q =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}${q.url}`, { headers, credentials: 'include' })
          .then(r => r.ok ? r.json() : Promise.reject(r.status))
          .then(data => ({ key: q.key, url: q.url, data, staleTime: q.staleTime }))
          .catch(err => ({ key: q.key, url: q.url, error: err }))
      );

      const settled = await Promise.all(fetches);

      if (!isMounted.current) return;

      const newResults = {};
      const newErrors = {};

      settled.forEach(item => {
        if (item.error) {
          newErrors[item.key] = item.error;
        } else {
          newResults[item.key] = item.data;
          queryCache.set(item.url, item.data, item.staleTime || options.staleTime || STALE_TIMES.MEDIUM);
        }
      });

      setResults(prev => ({ ...prev, ...newResults }));
      setErrors(prev => ({ ...prev, ...newErrors }));

    } finally {
      if (isMounted.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queries)]);

  useEffect(() => {
    isMounted.current = true;
    fetchAll();
    return () => { isMounted.current = false; };
  }, [fetchAll]);

  return {
    results,
    loading,
    errors,
    refetch: () => fetchAll(true)
  };
};
