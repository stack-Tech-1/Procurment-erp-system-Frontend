// Simple in-memory query cache for the frontend
// Works like React Query but without the extra dependency

const cache = new Map();
const STALE_TIME = 5 * 60 * 1000; // 5 minutes default

export const queryCache = {

  get(key) {
    const entry = cache.get(key);
    if (!entry) return null;

    const isStale = Date.now() - entry.timestamp > entry.staleTime;
    return { data: entry.data, isStale };
  },

  set(key, data, staleTime = STALE_TIME) {
    cache.set(key, { data, timestamp: Date.now(), staleTime });
  },

  invalidate(key) {
    cache.delete(key);
  },

  invalidatePrefix(prefix) {
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) cache.delete(key);
    }
  },

  clear() {
    cache.clear();
  }
};

// Stale-while-revalidate fetch hook
// Returns cached data immediately (if available) while fetching fresh data in background
export const STALE_TIMES = {
  REALTIME:  30 * 1000,         // 30 seconds — approval queue, notifications
  SHORT:     60 * 1000,         // 1 minute — task lists
  MEDIUM:    5 * 60 * 1000,     // 5 minutes — dashboard KPIs
  LONG:      15 * 60 * 1000,    // 15 minutes — vendor lists, reports
  VERY_LONG: 60 * 60 * 1000,    // 1 hour — CSI materials, branding
};
