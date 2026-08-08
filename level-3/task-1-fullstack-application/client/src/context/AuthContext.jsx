import { createContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import {
  clearAccessToken,
  getAccessToken,
  storeAccessToken,
  TOKEN_STORAGE_KEY,
} from '../utils/authStorage.js';

export { TOKEN_STORAGE_KEY };
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getAccessToken);
  const [user, setUser] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!token) {
        if (active) setIsSessionLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (active) setUser(currentUser);
      } catch {
        clearAccessToken();
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setIsSessionLoading(false);
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, [token]);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    storeAccessToken(result.token);
    setToken(result.token);
    setUser(result.user);
    setIsSessionLoading(false);
    return result.user;
  };

  const register = (details) => authService.register(details);

  const logout = () => {
    clearAccessToken();
    setToken(null);
    setUser(null);
    setIsSessionLoading(false);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isSessionLoading,
      login,
      register,
      logout,
    }),
    [token, user, isSessionLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
