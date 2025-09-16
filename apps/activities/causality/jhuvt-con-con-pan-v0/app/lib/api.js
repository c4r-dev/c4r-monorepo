/**
 * Get the base URL for API calls
 * Works in both development (localhost) and production (Vercel)
 */
export function getApiBaseUrl() {
  // In the browser, we can use relative URLs
  if (typeof window !== 'undefined') {
    return '';
  }
  
  // On the server side, we need to determine the full URL
  if (process.env.VERCEL_URL) {
    // When deployed on Vercel
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    // Local development or custom deployment
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback for local development
  return 'http://localhost:3000';
}

/**
 * Make API calls with the correct base URL
 */
export async function apiCall(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
}