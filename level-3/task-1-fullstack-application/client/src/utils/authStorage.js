export const TOKEN_STORAGE_KEY = 'codveda_access_token';

export const getAccessToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
export const storeAccessToken = (token) =>
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
export const clearAccessToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);
