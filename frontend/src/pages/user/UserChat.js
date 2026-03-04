import React, { useEffect, useState, useRef, useCallback } from "react";
import { Search, MessageSquare, Clock, Scale, ChevronRight, Loader2 } from "lucide-react";
import ChatWindow from "../../components/ChatWindow";
import UserSidebar from "../../components/UserSidebar";
import { getMyRooms } from "../../services/chatApi";
import { connectPresenceSocket } from "../../services/presenceSocket";

/**
 * UserChat — Client-side chat page.
 *
 * Flow:
 *   1. User browses "All Lawyers" tab and clicks "Request Chat"
 *   2. Room is created with status='pending'
 *   3. Lawyer accepts → status becomes 'active'
 *   4. ChatWindow unlocks for both sides
 */
export default function UserChat() {
  const [rooms, setRooms]               = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [search, setSearch]             = useState("");
  const [activeTab, setActiveTab]       = useState("chats"); // "chats" | "pending"
  const [onlineUsers, setOnlineUsers]   = useState(new Set());

  const [myUserId]             = useState(() => sessionStorage.getItem("authUserId") ?? "");
  const presenceRef = useRef(null);
  const pollTimer   = useRef(null);

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
    return () => { ws.onclose = null; ws.close(); };
  }, []);

  // ─── load data ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const data = await getMyRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      // keep stale data on error
    }
  }, []);

  useEffect(() => {
    loadData();
    pollTimer.current = setInterval(() => loadData(), 10_000);
    return () => clearInterval(pollTimer.current);
  }, [loadData]);

  // ─── derived ──────────────────────────────────────────────────────────────

  const activeRooms  = rooms.filter((r) => r.status === "active");
  const pendingRooms = rooms.filter((r) => r.status === "pending");

  // ─── helpers ──────────────────────────────────────────────────────────────

  const formatTime = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso), now = new Date();
      const diff = Math.floor((now - d) / 86400000);
      if (diff === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (diff === 1) return "Yesterday";
      if (diff < 7)  return d.toLocaleDateString([], { weekday: "short" });
      return d.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
    } catch { return ""; }
  };

  const filteredActive  = activeRooms.filter((r) => (r.lawyer_name || "").toLowerCase().includes(search.toLowerCase()));
  const filteredPending = pendingRooms.filter((r) => (r.lawyer_name || "").toLowerCase().includes(search.toLowerCase()));

  const participantName = selectedRoom?.lawyer_name ?? "";

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <UserSidebar />

      {/* ── Conversation Panel ─────────────────────────────────────────── */}
      <div className={`${
        selectedRoom ? "hidden md:flex" : "flex"
      } w-full md:w-[320px] flex-shrink-0 flex-col bg-white shadow-md z-10`}>

        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Scale size={16} className="text-white" />
              </div>
              <span className="font-semibold text-sm tracking-wide">My Chats</span>
            </div>
            <span className="text-white/60 text-xs">{activeRooms.length} active</span>
          </div>
          {/* Search */}
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20 focus-within:bg-white/25 transition">
            <Search size={13} className="text-white/70 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-white placeholder-white/50"
            />
          </div>
        </div>

        {/* Pill Tabs */}
        <div className="flex gap-1.5 px-3 py-2.5 bg-slate-50 border-b border-slate-200">
          {[
            { key: "chats",   label: "Chats",   count: activeRooms.length  },
            { key: "pending", label: "Pending", count: pendingRooms.length, warn: true },
          ].map(({ key, label, count, warn }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition
                ${ activeTab === key
                   ? warn && count > 0
                     ? "bg-amber-500 text-white shadow-sm"
                     : "bg-indigo-600 text-white shadow-sm"
                   : "text-slate-500 hover:bg-slate-200"}`}
            >
              {label}
              {count !== null && count > 0 && (
                <span className={`rounded-full w-4 h-4 flex items-center justify-center text-[10px] leading-none
                  ${activeTab === key ? "bg-white/30 text-white" : warn ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-600"}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">

          {/* ACTIVE CHATS */}
          {activeTab === "chats" && (
            <>
              {filteredActive.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 select-none px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
                    <MessageSquare size={26} className="text-indigo-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">No active chats</p>
                  <p className="text-xs mt-1 text-slate-400">Go to Lawyers tab and send a request</p>
                </div>
              )}
              {filteredActive.map((room) => {
                const online = onlineUsers.has(String(room.lawyer_user_id));
                const active = selectedRoom?.id === room.id;
                return (
                  <button key={room.id} onClick={() => setSelectedRoom(room)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 transition text-left group
                      ${active ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm select-none
                        ${active ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                        {(room.lawyer_name || "L").charAt(0).toUpperCase()}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
                        ${online ? "bg-emerald-400" : "bg-slate-300"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className={`font-semibold text-sm truncate ${active ? "text-indigo-700" : "text-slate-800"}`}>
                          {room.lawyer_name || "Lawyer"}
                        </p>
                        <p className="text-[10px] text-slate-400 flex-shrink-0 ml-1">{formatTime(room.last_message_at)}</p>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{room.last_message || "No messages yet"}</p>
                    </div>
                    {active && <ChevronRight size={14} className="text-indigo-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </>
          )}

          {/* PENDING REQUESTS */}
          {activeTab === "pending" && (
            <>
              {filteredPending.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 select-none px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
                    <Clock size={26} className="text-amber-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">No pending requests</p>
                  <p className="text-xs mt-1 text-slate-400">Sent requests will appear here</p>
                </div>
              )}
              {filteredPending.map((room) => {
                const active = selectedRoom?.id === room.id;
                return (
                  <button key={room.id} onClick={() => setSelectedRoom(room)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 transition text-left
                      ${active ? "bg-amber-50" : "hover:bg-slate-50"}`}>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 select-none
                      ${active ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-600"}`}>
                      {(room.lawyer_name || "L").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${active ? "text-amber-700" : "text-slate-800"}`}>
                        {room.lawyer_name || "Lawyer"}
                      </p>
                      <p className="text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> Awaiting acceptance…
                      </p>
                    </div>
                  </button>
                );
              })}
            </>
          )}

        </div>
      </div>

      {/* ── Right Panel ───────────────────────────────────────────────────── */}
      <div className={`${selectedRoom ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
      {selectedRoom?.status === "active" ? (
        <ChatWindow
          room={selectedRoom}
          participantName={participantName}
          myUserId={myUserId}
          partnerUserId={selectedRoom?.lawyer_user_id}
          onClose={() => setSelectedRoom(null)}
        />
      ) : selectedRoom?.status === "pending" ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-8">
          {/* Mobile back button */}
          <button
            onClick={() => setSelectedRoom(null)}
            className="md:hidden self-start mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Back
          </button>
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-100">
              <Clock size={34} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Request Sent</h2>
            <p className="text-sm text-slate-500 mt-2">
              Your chat request has been sent to{" "}
              <span className="font-semibold text-indigo-600">{selectedRoom.lawyer_name}</span>.
            </p>
            <p className="text-xs text-slate-400 mt-1">Waiting for the lawyer to accept your request.</p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Pending approval
            </div>
            <p className="text-[11px] text-slate-300 mt-4">Room #{selectedRoom.id} · permanent</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 select-none">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-5">
            <MessageSquare size={40} className="text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-slate-700">Start a Conversation</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs text-center">Select a chat from the sidebar to start</p>
        </div>
      )}
      </div>
    </div>
  );
}