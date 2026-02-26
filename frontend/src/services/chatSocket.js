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
  const url = `ws://127.0.0.1:8000/ws/chat/${roomId}/${query}`;
  return new WebSocket(url);
}
