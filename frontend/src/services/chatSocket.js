import { WS_BASE } from '../api';

/**
 * connectChatSocket
 * Opens a WebSocket connection to the chat room.
 * Passes the DRF auth token as a query parameter so the backend
 * TokenAuthMiddleware can identify the user.
 *
 * @param {number|string} roomId
 * @returns {WebSocket}
 */
export function connectChatSocket(roomId) {
  const token = sessionStorage.getItem("authToken");
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  const url = `${WS_BASE}/ws/chat/${roomId}/${query}`;
  return new WebSocket(url);
}
