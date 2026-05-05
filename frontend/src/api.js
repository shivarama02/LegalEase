// Central place to define backend API + WebSocket base URLs.
// Defaults are LAN-friendly: uses the current page hostname (or REACT_APP_API_HOST).
// You can override by creating a .env file:
//   REACT_APP_API_BASE=http://127.0.0.1:8000/api
//   REACT_APP_WS_BASE=ws://127.0.0.1:8000

const envApiBase = process.env.REACT_APP_API_BASE;
const envWsBase = process.env.REACT_APP_WS_BASE;
const envHost = process.env.REACT_APP_API_HOST;

const browserHost =
  typeof window !== 'undefined' && window.location?.hostname
    ? window.location.hostname
    : 'localhost';

const host = envHost || browserHost;
const isHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:';
const httpProto = isHttps ? 'https' : 'http';
const wsProto = isHttps ? 'wss' : 'ws';

export const API_BASE = envApiBase || `${httpProto}://${host}:8000/api`;
export const WS_BASE = envWsBase || `${wsProto}://${host}:8000`;

export function apiUrl(path) {
  // Accept paths with or without leading slash
  if (!path.startsWith('/')) path = '/' + path;
  return API_BASE.replace(/\/$/, '') + path;
}
