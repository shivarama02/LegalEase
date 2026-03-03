import React, { useEffect, useState, useRef, useCallback } from "react";
import { Search, MessageSquare, RefreshCw, CheckCircle, Clock, Scale, Users, ChevronRight, Loader2 } from "lucide-react";
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
    const active = selectedRoom?.id === room.id;
    return (
      <button
        key={room.id}
        onClick={() => setSelectedRoom(room)}
        className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 transition text-left
          ${active
            ? isPending ? "bg-amber-50" : "bg-indigo-50"
            : "hover:bg-slate-50"}`}
      >
        <div className="relative flex-shrink-0">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm select-none
            ${active
              ? isPending ? "bg-amber-500 text-white" : "bg-indigo-600 text-white"
              : isPending ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-700"}`}>
            {(room.client_name || room.client_email || "C").charAt(0).toUpperCase()}
          </div>
          {isPending ? (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-amber-400" />
          ) : (
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
              ${clientOnline ? "bg-emerald-400" : "bg-slate-300"}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <p className={`font-semibold text-sm truncate
              ${active ? (isPending ? "text-amber-700" : "text-indigo-700") : "text-slate-800"}`}>
              {room.client_name || room.client_email || "Client"}
            </p>
            {isPending ? (
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-lg flex-shrink-0 ml-1">New</span>
            ) : (
              <p className="text-[10px] text-slate-400 flex-shrink-0 ml-1">{formatTime(room.last_message_at)}</p>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {isPending ? "Wants to consult with you" : (room.last_message || "No messages yet")}
          </p>
        </div>
        {active && !isPending && <ChevronRight size={14} className="text-indigo-400 flex-shrink-0" />}
      </button>
    );
  };

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <LawyerSidebar />

      {/* ── Conversation Sidebar ────────────────────────────────────────── */}
      <div className="w-[320px] flex-shrink-0 flex flex-col bg-white shadow-md z-10">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Scale size={15} className="text-white" />
              </div>
              <span className="font-semibold text-sm tracking-wide">Client Chats</span>
            </div>
            <button
              onClick={() => fetchRooms(true)}
              disabled={refreshing}
              title="Refresh"
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
          {/* Search */}
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20 focus-within:bg-white/25 transition">
            <Search size={13} className="text-white/70 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-white placeholder-white/50"
            />
          </div>
        </div>

        {/* Pill Tabs */}
        <div className="flex gap-1.5 px-3 py-2.5 bg-slate-50 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition
              ${activeTab === "active" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
          >
            Active
            {activeRooms.length > 0 && (
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] leading-none
                ${activeTab === "active" ? "bg-white/30 text-white" : "bg-slate-200 text-slate-600"}`}>
                {activeRooms.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition
              ${activeTab === "requests"
                ? pendingRooms.length > 0 ? "bg-amber-500 text-white shadow-sm" : "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-200"}`}
          >
            Requests
            {pendingRooms.length > 0 && (
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] leading-none
                ${activeTab === "requests" ? "bg-white/30 text-white" : "bg-amber-100 text-amber-600"}`}>
                {pendingRooms.length}
              </span>
            )}
          </button>
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {/* ── ACTIVE TAB ── */}
          {!loading && activeTab === "active" && (
            <>
              {filteredActive.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center select-none">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
                    <MessageSquare size={26} className="text-indigo-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">No active chats yet</p>
                  <p className="text-xs mt-1 text-slate-400">Accept requests to start chatting</p>
                </div>
              )}
              {filteredActive.map((room) => (
                <RoomRow key={room.id} room={room} isPending={false} />
              ))}
            </>
          )}

          {/* ── REQUESTS TAB ── */}
          {!loading && activeTab === "requests" && (
            <>
              {filteredPending.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center select-none">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
                    <Clock size={26} className="text-amber-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">No pending requests</p>
                  <p className="text-xs mt-1 text-slate-400">New requests will appear here</p>
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
      {selectedRoom && selectedRoom.status === "active" ? (
        <ChatWindow
          room={selectedRoom}
          participantName={participantName}
          myUserId={myUserId}
          partnerUserId={selectedRoom?.client_id}
          onClose={() => setSelectedRoom(null)}
        />
      ) : selectedRoom && selectedRoom.status === "pending" ? (
        /* Accept card */
        <div className="flex-1 flex items-center justify-center bg-slate-50 px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center font-bold text-indigo-600 text-3xl mx-auto mb-5 select-none">
              {(selectedRoom.client_name || selectedRoom.client_email || "C").charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {selectedRoom.client_name || selectedRoom.client_email || "A client"}
            </h2>
            <p className="text-sm text-slate-500 mt-2 mb-8">is requesting a consultation with you</p>
            <button
              onClick={() => handleAccept(selectedRoom.id)}
              disabled={acceptingId === selectedRoom.id}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3 rounded-2xl transition shadow-lg shadow-indigo-100 disabled:opacity-60"
            >
              {acceptingId === selectedRoom.id ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
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
              className="mt-3 w-full text-sm text-slate-400 hover:text-slate-600 transition py-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 select-none">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-5">
            <Users size={40} className="text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-slate-700">Client Consultations</p>
          <p className="text-sm text-slate-400 mt-2 max-w-xs text-center">
            {pendingRooms.length > 0
              ? `You have ${pendingRooms.length} pending request${pendingRooms.length > 1 ? "s" : ""}. Open the Requests tab.`
              : "Select a chat from the sidebar to start"}
          </p>
        </div>
      )}    </div>
  );
}