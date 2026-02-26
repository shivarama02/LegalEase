import React, { useEffect, useState, useRef, useCallback } from "react";
import { Search, MessageSquare, RefreshCw, CheckCircle, Clock } from "lucide-react";
import ChatWindow from "../../components/ChatWindow";
import { getMyRooms, acceptChat } from "../../services/chatApi";
import LawyerSidebar from '../../components/LawyerSidebar';
import { connectPresenceSocket } from "../../services/presenceSocket";

/**
 * LawyerChat — WhatsApp-Web-style chat page for logged-in lawyers.
 *
 * Left panel  → Active Chats tab + Requests tab (pending rooms)
 * Right panel → <ChatWindow> for active rooms, Accept panel for pending rooms
 */
export default function LawyerChat() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // "active" | "requests"
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [acceptingId, setAcceptingId] = useState(null); // roomId being accepted
  const pollTimer = useRef(null);
  const presenceRef = useRef(null);

  const [myUserId] = useState(() => sessionStorage.getItem("authUserId") ?? "");

  // ─── presence WebSocket ───────────────────────────────────────────────────

  useEffect(() => {
    const ws = connectPresenceSocket(({ user_id, online }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (online) next.add(String(user_id));
        else next.delete(String(user_id));
        return next;
      });
    });
    presenceRef.current = ws;
    return () => {
      ws.onclose = null;
      ws.close();
    };
  }, []);

  // ─── fetch rooms ──────────────────────────────────────────────────────────

  const fetchRooms = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await getMyRooms();
      const list = Array.isArray(data) ? data : [];
      setRooms(list);
      setSelectedRoom((prev) => {
        if (!prev) return prev;
        const updated = list.find((r) => r.id === prev.id);
        return updated || prev;
      });
    } catch {
      // keep stale data on error
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    pollTimer.current = setInterval(() => fetchRooms(), 10_000);
    return () => clearInterval(pollTimer.current);
  }, [fetchRooms]);

  // ─── accept a pending request ─────────────────────────────────────────────

  const handleAccept = useCallback(async (roomId) => {
    setAcceptingId(roomId);
    try {
      await acceptChat(roomId);
      // Update in-memory state immediately, then re-fetch for server truth
      setRooms((prev) =>
        prev.map((r) => r.id === roomId ? { ...r, status: "active" } : r)
      );
      setSelectedRoom((prev) =>
        prev?.id === roomId ? { ...prev, status: "active" } : prev
      );
      setActiveTab("active");
      await fetchRooms();
    } catch (err) {
      alert("Failed to accept request. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  }, [fetchRooms]);

  // ─── derived data ─────────────────────────────────────────────────────────

  const activeRooms = rooms.filter((r) => r.status === "active");
  const pendingRooms = rooms.filter((r) => r.status === "pending");

  const filteredActive = activeRooms.filter((r) =>
    (r.client_name || r.client_email || "").toLowerCase().includes(search.toLowerCase())
  );
  const filteredPending = pendingRooms.filter((r) =>
    (r.client_name || r.client_email || "").toLowerCase().includes(search.toLowerCase())
  );

  const participantName = selectedRoom
    ? selectedRoom.client_name || selectedRoom.client_email || "Client"
    : "";

  const formatTime = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffDays = Math.floor((now - d) / 86400000);
      if (diffDays === 0)
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
      return d.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
    } catch {
      return "";
    }
  };

  // ─── room row renderer ────────────────────────────────────────────────────

  const RoomRow = ({ room, isPending }) => {
    const clientOnline = onlineUsers.has(String(room.client_id));
    return (
      <button
        key={room.id}
        onClick={() => setSelectedRoom(room)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100
          hover:bg-gray-100 transition text-left
          ${selectedRoom?.id === room.id ? "bg-teal-50 border-l-4 border-l-teal-500" : ""}
        `}
      >
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center
                          font-bold text-indigo-700 text-sm select-none">
            {(room.client_name || room.client_email || "C").charAt(0).toUpperCase()}
          </div>
          {isPending ? (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-orange-400" />
          ) : (
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                              ${clientOnline ? "bg-green-400" : "bg-gray-300"}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <p className="font-semibold text-sm text-gray-800 truncate">
              {room.client_name || room.client_email || "Client"}
            </p>
            {isPending ? (
              <span className="text-[10px] font-medium bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
                Pending
              </span>
            ) : (
              <p className="text-[11px] text-gray-400 flex-shrink-0 ml-1">
                {formatTime(room.last_message_at)}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {isPending ? "Wants to start a chat with you" : (room.last_message || "No messages yet")}
          </p>
        </div>
      </button>
    );
  };

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ── Navigation Sidebar ──────────────────────────────────────────── */}
      <LawyerSidebar />

      {/* ── Chat Sidebar ────────────────────────────────────────────────── */}
      <div className="w-[340px] flex-shrink-0 flex flex-col bg-white border-r border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#075e54] text-white">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-teal-300 flex items-center justify-center
                            font-bold text-teal-900 text-sm select-none">
              L
            </div>
            <span className="font-semibold text-sm">Client Chats</span>
          </div>
          <button
            onClick={() => fetchRooms(true)}
            disabled={refreshing}
            title="Refresh"
            className="p-1 rounded-full hover:bg-teal-700 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              activeTab === "active"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active
            {activeRooms.length > 0 && (
              <span className="ml-1 text-xs text-teal-400">({activeRooms.length})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-2 text-sm font-medium transition relative ${
              activeTab === "requests"
                ? "text-orange-600 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Requests
            {pendingRooms.length > 0 && (
              <span className="ml-1 text-xs font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                {pendingRooms.length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5
                          border border-gray-300 focus-within:border-teal-400 transition">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="text-center text-sm text-gray-400 py-8">Loading…</p>
          )}

          {/* ── ACTIVE TAB ────────────────────────────────────────────── */}
          {!loading && activeTab === "active" && (
            <>
              {filteredActive.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 select-none">
                  <MessageSquare size={36} className="mb-2 opacity-40" />
                  <p className="text-sm">No active chats yet</p>
                  <p className="text-xs mt-1">Accept requests to start chatting</p>
                </div>
              )}
              {filteredActive.map((room) => (
                <RoomRow key={room.id} room={room} isPending={false} />
              ))}
            </>
          )}

          {/* ── REQUESTS TAB ──────────────────────────────────────────── */}
          {!loading && activeTab === "requests" && (
            <>
              {filteredPending.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 select-none">
                  <Clock size={36} className="mb-2 opacity-40" />
                  <p className="text-sm">No pending requests</p>
                </div>
              )}
              {filteredPending.map((room) => (
                <RoomRow key={room.id} room={room} isPending={true} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">

        {/* Active room → full ChatWindow */}
        {selectedRoom && selectedRoom.status === "active" && (
          <ChatWindow
            room={selectedRoom}
            participantName={participantName}
            myUserId={myUserId}
            partnerUserId={selectedRoom?.client_id}
            onClose={() => setSelectedRoom(null)}
          />
        )}

        {/* Pending room → Accept panel */}
        {selectedRoom && selectedRoom.status === "pending" && (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center
                              font-bold text-indigo-700 text-2xl mx-auto mb-4 select-none">
                {(selectedRoom.client_name || selectedRoom.client_email || "C").charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedRoom.client_name || selectedRoom.client_email || "A client"}
              </h2>
              <p className="text-sm text-gray-500 mt-1 mb-6">
                wants to start a chat with you
              </p>
              <button
                onClick={() => handleAccept(selectedRoom.id)}
                disabled={acceptingId === selectedRoom.id}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700
                           text-white font-medium py-2.5 rounded-xl transition disabled:opacity-60"
              >
                {acceptingId === selectedRoom.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Accepting…
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Accept Request
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedRoom(null)}
                className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* No selection → empty state */}
        {!selectedRoom && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 select-none bg-gray-50">
            <MessageSquare size={56} className="mb-4 opacity-30" />
            <p className="text-base font-medium">Select a conversation</p>
            <p className="text-sm mt-1">
              {pendingRooms.length > 0
                ? `You have ${pendingRooms.length} pending request${pendingRooms.length > 1 ? "s" : ""}`
                : "No pending requests"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

