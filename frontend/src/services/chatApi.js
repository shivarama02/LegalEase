import { API_BASE } from "../api";

function authHeaders() {
  const token = sessionStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

/**
 * Client sends a chat request to a lawyer.
 * Creates the room with status='pending' (or returns existing room).
 * POST /api/chat/create-room/<lawyerId>/
 */
export async function requestChat(lawyerId) {
  const res = await fetch(`${API_BASE}/chat/create-room/${lawyerId}/`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.error || "Failed to send request"), { status: res.status });
  }
  return res.json();
}

/**
 * Lawyer accepts a pending chat request → status becomes 'active'.
 * POST /api/chat/accept/<roomId>/
 */
export async function acceptChat(roomId) {
  const res = await fetch(`${API_BASE}/chat/accept/${roomId}/`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.error || "Failed to accept"), { status: res.status });
  }
  return res.json();
}

/**
 * Fetch message history for a room.
 * GET /api/chat/messages/<roomId>/
 */
export async function getMessages(roomId) {
  const res = await fetch(`${API_BASE}/chat/messages/${roomId}/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

/**
 * Fetch all rooms for the logged-in user (client or lawyer).
 * GET /api/chat/my-rooms/
 */
export async function getMyRooms() {
  const res = await fetch(`${API_BASE}/chat/my-rooms/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch rooms");
  return res.json();
}

/**
 * Fetch all lawyers (for clients to browse).
 * GET /api/lawyers/
 */
export async function getAllLawyers() {
  const res = await fetch(`${API_BASE}/lawyers/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch lawyers");
  return res.json();
}

