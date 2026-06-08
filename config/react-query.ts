/**
 * Global React Query settings
 */

// Time during which data is considered fresh (will not be refetched)
export const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes

// Time to keep data in cache after it becomes unused
export const QUERY_GC_TIME = 30 * 60 * 1000; // 30 minutes
