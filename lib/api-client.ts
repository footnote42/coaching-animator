/**
 * API Client with Retry Logic
 * 
 * Provides a fetch wrapper with exponential backoff retry for transient failures.
 * Used for all API calls to improve reliability.
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryOn?: number[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryOn: [408, 429, 500, 502, 503, 504], // Timeout, Rate limit, Server errors
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  return Math.min(exponentialDelay + jitter, maxDelayMs);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with automatic retry on transient failures
 * 
 * @param url - URL to fetch
 * @param init - Fetch init options
 * @param retryOptions - Retry configuration
 * @returns Fetch response
 * @throws Error after all retries exhausted
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  const options = { ...DEFAULT_OPTIONS, ...retryOptions };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      const response = await fetch(url, init);

      // Check if we should retry based on status code
      if (options.retryOn.includes(response.status) && attempt < options.maxRetries) {
        const delay = calculateDelay(attempt, options.baseDelayMs, options.maxDelayMs);
        console.warn(
          `[API] Request to ${url} failed with ${response.status}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${options.maxRetries})`
        );
        await sleep(delay);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Network errors are retryable
      if (attempt < options.maxRetries) {
        const delay = calculateDelay(attempt, options.baseDelayMs, options.maxDelayMs);
        console.warn(
          `[API] Network error for ${url}: ${lastError.message}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${options.maxRetries})`
        );
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError || new Error(`Request to ${url} failed after ${options.maxRetries} retries`);
}

/**
 * POST request with retry
 */
export async function postWithRetry<T>(
  url: string,
  data: unknown,
  retryOptions?: RetryOptions
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const response = await fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      retryOptions
    );

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: responseData?.error || `Request failed with status ${response.status}`,
      };
    }

    return { ok: true, status: response.status, data: responseData };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * GET request with retry
 */
export async function getWithRetry<T>(
  url: string,
  retryOptions?: RetryOptions
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const response = await fetchWithRetry(url, { method: 'GET' }, retryOptions);
    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: responseData?.error || `Request failed with status ${response.status}`,
      };
    }

    return { ok: true, status: response.status, data: responseData };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * PUT request with retry
 */
export async function putWithRetry<T>(
  url: string,
  data: unknown,
  retryOptions?: RetryOptions
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const response = await fetchWithRetry(
      url,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      retryOptions
    );

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: responseData?.error || `Request failed with status ${response.status}`,
      };
    }

    return { ok: true, status: response.status, data: responseData };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * DELETE request with retry
 */
export async function deleteWithRetry(
  url: string,
  retryOptions?: RetryOptions
): Promise<{ ok: boolean; status: number; error?: string }> {
  try {
    const response = await fetchWithRetry(url, { method: 'DELETE' }, retryOptions);

    if (!response.ok) {
      const responseData = await response.json().catch(() => null);
      return {
        ok: false,
        status: response.status,
        error: responseData?.error || `Request failed with status ${response.status}`,
      };
    }

    return { ok: true, status: response.status };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
