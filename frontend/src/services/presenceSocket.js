/**
 * connectPresenceSocket
 *
 * Opens a single WebSocket to ws/presence/ for the current session.
 * The backend will push presence events for ALL of the user's chat rooms.
 *
 * @param {function} onPresence  - called with { type, user_id, online, room_id }
 * @returns {WebSocket}
 */
export function connectPresenceSocket(onPresence) {
  const token = sessionStorage.getItem("authToken");
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  const ws = new WebSocket(`ws://127.0.0.1:8000/ws/presence/${query}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "presence") {
        onPresence(data);
      }
    } catch {
      // ignore
    }
  };

  return ws;
}
