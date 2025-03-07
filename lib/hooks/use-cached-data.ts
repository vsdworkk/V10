"use client"

import { useEffect, useState } from "react"

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {}

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

/**
 * A custom hook for data fetching with caching
 * @param key - The cache key
 * @param fetchFn - The function to fetch data
 * @param options - Options for the hook
 * @returns An object with data, loading state, error, and a refetch function
 */
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    enabled?: boolean
    expiration?: number
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const expiration = options.expiration || CACHE_EXPIRATION
  const enabled = options.enabled !== false

  const fetchData = async (force = false) => {
    // Check if we have cached data and it's not expired
    const cachedItem = cache[key]
    const now = Date.now()

    if (
      !force &&
      cachedItem &&
      now - cachedItem.timestamp < expiration
    ) {
      setData(cachedItem.data)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchFn()
      setData(result)
      
      // Update cache
      cache[key] = {
        data: result,
        timestamp: Date.now()
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (enabled) {
      fetchData()
    }
  }, [key, enabled])

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(true)
  }
} 