// client/src/hooks/useAsyncData.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for handling async data fetching with loading and error states
 */
export function useAsyncData(asyncFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err);
      console.error('useAsyncData error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    execute();
  }, [execute]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, retry, refetch: retry };
}

/**
 * Hook for handling async operations with loading state
 */
export function useAsyncOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { execute, loading, error, reset };
}

/**
 * Hook for delayed loading state (prevents flash of loading for fast operations)
 */
export function useDelayedLoading(loading, delay = 200) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timeout;
    
    if (loading) {
      timeout = setTimeout(() => setShowLoading(true), delay);
    } else {
      setShowLoading(false);
    }

    return () => clearTimeout(timeout);
  }, [loading, delay]);

  return showLoading;
}

/**
 * Hook for managing retry logic with exponential backoff
 */
export function useRetry(asyncFunction, {
  maxAttempts = 3,
  initialDelay = 1000,
  maxDelay = 10000,
  backoffFactor = 2
} = {}) {
  const [attempts, setAttempts] = useState(0);
  const [nextRetryDelay, setNextRetryDelay] = useState(initialDelay);

  const retry = useCallback(async () => {
    if (attempts >= maxAttempts) {
      throw new Error(`Max retry attempts (${maxAttempts}) exceeded`);
    }

    setAttempts(prev => prev + 1);
    
    // Wait for the delay
    await new Promise(resolve => setTimeout(resolve, nextRetryDelay));
    
    try {
      const result = await asyncFunction();
      // Reset on success
      setAttempts(0);
      setNextRetryDelay(initialDelay);
      return result;
    } catch (error) {
      // Calculate next delay with exponential backoff
      const nextDelay = Math.min(nextRetryDelay * backoffFactor, maxDelay);
      setNextRetryDelay(nextDelay);
      throw error;
    }
  }, [asyncFunction, attempts, maxAttempts, nextRetryDelay, initialDelay, backoffFactor, maxDelay]);

  const reset = useCallback(() => {
    setAttempts(0);
    setNextRetryDelay(initialDelay);
  }, [initialDelay]);

  return { retry, attempts, nextRetryDelay, reset, canRetry: attempts < maxAttempts };
}