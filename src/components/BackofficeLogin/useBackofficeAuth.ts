import { useEffect, useState } from 'react';

import {
  clearBackofficeSession,
  loadBackofficeSession,
  loginBackoffice,
  saveBackofficeSession,
  validateBackofficeToken,
} from './backofficeAuthService';
import type { BackOfficeUser } from './backofficeAuthService';

export function useBackofficeAuth() {
  const [user, setUser] = useState<BackOfficeUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const session = loadBackofficeSession();
    if (!session) {
      return;
    }

    let ignore = false;
    validateBackofficeToken(session.access_token)
      .then(() => {
        if (!ignore) {
          setUser(session.user);
        }
      })
      .catch(() => {
        if (!ignore) {
          clearBackofficeSession();
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoggingIn(true);
    try {
      const session = await loginBackoffice(username, password);
      saveBackofficeSession(session);
      setUser(session.user);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = (): void => {
    clearBackofficeSession();
    setUser(null);
  };

  return { user, isLoggingIn, login, logout };
}
