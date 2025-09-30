// Central place to define backend API base URL.
// You can override by creating a .env file with REACT_APP_API_BASE
// Example .env entry:
// REACT_APP_API_BASE=http://127.0.0.1:8000/api

export const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

export function apiUrl(path) {
  // Accept paths with or without leading slash
  if (!path.startsWith('/')) path = '/' + path;
  return API_BASE.replace(/\/$/, '') + path;
}
