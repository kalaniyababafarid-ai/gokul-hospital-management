const TOKEN_STORAGE_KEY = 'gokul_hospital_session_token';

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null, remember = true) {
  try {
    if (!token) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return;
    }
    if (remember) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}
