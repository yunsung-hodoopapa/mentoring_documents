import { STORAGE_KEYS, fetchWithErrorHandling } from 'src/lib/apiUtils';

export type BackOfficeUser = {
  id: number;
  username: string;
  real_name: string;
  email: string;
  name: string;
  roles: string[];
};

export type BackofficeSession = {
  user: BackOfficeUser;
  access_token: string;
};

function getBackofficeEndpoint() {
  if (import.meta.env.PROD) {
    return 'https://hodong-erp.com/backoffice';
  }

  if (import.meta.env.VITE_ENABLE_MSW === 'false') {
    return (
      import.meta.env.VITE_API_BASE_URL + '/backoffice' || 'https://test.hodong-erp.com/backoffice'
    );
  }

  return '/api/backoffice';
}

const BACKOFFICE_ENDPOINT = getBackofficeEndpoint();

export function loginBackoffice(username: string, password: string): Promise<BackofficeSession> {
  return fetchWithErrorHandling<BackofficeSession>(`${BACKOFFICE_ENDPOINT}/login`, {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  });
}

export function validateBackofficeToken(accessToken: string): Promise<unknown> {
  return fetchWithErrorHandling(`${BACKOFFICE_ENDPOINT}/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function loadBackofficeSession(): BackofficeSession | null {
  const raw = localStorage.getItem(STORAGE_KEYS.BACKOFFICE_USER_DATA);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as BackofficeSession;
  } catch {
    return null;
  }
}

export function saveBackofficeSession(session: BackofficeSession): void {
  localStorage.setItem(STORAGE_KEYS.BACKOFFICE_USER_DATA, JSON.stringify(session));
}

export function clearBackofficeSession(): void {
  localStorage.removeItem(STORAGE_KEYS.BACKOFFICE_USER_DATA);
}
