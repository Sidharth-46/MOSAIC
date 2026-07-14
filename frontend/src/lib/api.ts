export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export async function fetchFromAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[API REQUEST] URL: ${url}`);
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    console.log(`[API RESPONSE] HTTP STATUS: ${response.status} for URL: ${url}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[API RESPONSE JSON] ${url}:`, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error(`[API ERROR] Failed to fetch from ${endpoint}:`, error);
    throw error;
  }
}
