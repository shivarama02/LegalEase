import React, { useEffect, useState, useRef, useCallback } from "react";
import { Search, MessageSquare, Clock, Send } from "lucide-react";
import ChatWindow from "../../components/ChatWindow";
import UserSidebar from "../../components/UserSidebar";
import { requestChat, getMyRooms, getAllLawyers } from "../../services/chatApi";
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
  const [lawyers, setLawyers]           = useState([]);
  const [rooms, setRooms]               = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loadingLawyers, setLoadingLawyers] = useState(true);
  const [requestingId, setRequestingId] = useState(null); // lawyerId being requested
  const [search, setSearch]             = useState("");
  const [activeTab, setActiveTab]       = useState("chats"); // "chats" | "pending" | "lawyers"
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
    setLoadingLawyers(true);
    try {
      const [lawyerRes, roomRes] = await Promise.allSettled([getAllLawyers(), getMyRooms()]);
      if (lawyerRes.status === "fulfilled")
        setLawyers(Array.isArray(lawyerRes.value) ? lawyerRes.value : lawyerRes.value?.results ?? []);
      if (roomRes.status === "fulfilled")
        setRooms(Array.isArray(roomRes.value) ? roomRes.value : []);
    } finally {
      setLoadingLawyers(false);
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
  const roomByLawyerId = Object.fromEntries(rooms.map((r) => [String(r.lawyer_id), r]));

  // ─── actions ──────────────────────────────────────────────────────────────

  const handleLawyerClick = useCallback(async (lawyer) => {
    const existing = roomByLawyerId[String(lawyer.id)];

    // Active → open chat immediately
    if (existing?.status === "active") {
      setSelectedRoom(existing);
      setActiveTab("chats");
      return;
    }

    // Pending → switch to pending tab and highlight
    if (existing?.status === "pending") {
      setSelectedRoom(existing);
      setActiveTab("pending");
      return;
    }

    // No room yet → send chat request
    setRequestingId(lawyer.id);
    try {
      const room = await requestChat(lawyer.id);
      setRooms((prev) => [room, ...prev]);
      setSelectedRoom(room);
      setActiveTab("pending");
    } catch {
      // silently ignore, user can retry
    } finally {
      setRequestingId(null);
    }
  }, [roomByLawyerId]);

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
  const filteredLawyers = lawyers.filter((l) =>
    (l.lname || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.specialization || "").toLowerCase().includes(search.toLowerCase())
  );

  const participantName = selectedRoom?.lawyer_name ?? "";

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <UserSidebar />

      {/* ── Chat Sidebar ─────────────────────────────────────────────────── */}
      <div className="w-[340px] flex-shrink-0 flex flex-col bg-white border-r border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#075e54] text-white">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-teal-300 flex items-center justify-center font-bold text-teal-900 text-sm select-none">U</div>
            <span className="font-semibold text-sm">Chat with Lawyers</span>
          </div>
          <MessageSquare size={20} className="opacity-80" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 text-xs font-medium">
          {[
            { key: "chats",   label: "Chats",    count: activeRooms.length },
            { key: "pending", label: "Pending",  count: pendingRooms.length, badge: true },
            { key: "lawyers", label: "Lawyers",  count: null },
          ].map(({ key, label, count, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1 transition
                ${activeTab === key ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              {label}
              {count !== null && count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none
                  ${badge ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 border border-gray-300 focus-within:border-teal-400 transition">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={activeTab === "lawyers" ? "Search lawyers…" : "Search…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">

          {/* ACTIVE CHATS */}
          {activeTab === "chats" && (
            <>
              {filteredActive.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 select-none px-4 text-center">
                  <MessageSquare size={36} className="mb-2 opacity-40" />
                  <p className="text-sm font-medium">No active chats</p>
                  <p className="text-xs mt-1">Go to "Lawyers" tab and send a chat request</p>
                </div>
              )}
              {filteredActive.map((room) => {
                const online = onlineUsers.has(String(room.lawyer_user_id));
                return (
                  <button key={room.id} onClick={() => setSelectedRoom(room)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition text-left
                      ${selectedRoom?.id === room.id ? "bg-teal-50 border-l-4 border-l-teal-500" : ""}`}>
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-sm select-none">
                        {(room.lawyer_name || "L").charAt(0).toUpperCase()}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${online ? "bg-green-400" : "bg-gray-300"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="font-semibold text-sm text-gray-800 truncate">{room.lawyer_name || "Lawyer"}</p>
                        <p className="text-[11px] text-gray-400 flex-shrink-0 ml-1">{formatTime(room.last_message_at)}</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{room.last_message || "No messages yet"}</p>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* PENDING REQUESTS */}
          {activeTab === "pending" && (
            <>
              {filteredPending.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 select-none px-4 text-center">
                  <Clock size={36} className="mb-2 opacity-40" />
                  <p className="text-sm font-medium">No pending requests</p>
                  <p className="text-xs mt-1">Requests you've sent will appear here</p>
                </div>
              )}
              {filteredPending.map((room) => (
                <button key={room.id} onClick={() => setSelectedRoom(room)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition text-left
                    ${selectedRoom?.id === room.id ? "bg-orange-50 border-l-4 border-l-orange-400" : ""}`}>
                  <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-sm flex-shrink-0 select-none">
                    {(room.lawyer_name || "L").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">{room.lawyer_name || "Lawyer"}</p>
                    <p className="text-xs text-orange-500 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> Awaiting acceptance…
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* ALL LAWYERS */}
          {activeTab === "lawyers" && (
            <>
              {loadingLawyers && <p className="text-center text-sm text-gray-400 py-8">Loading lawyers…</p>}
              {!loadingLawyers && filteredLawyers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 select-none">
                  <MessageSquare size={36} className="mb-2 opacity-40" />
                  <p className="text-sm">No lawyers found</p>
                </div>
              )}
              {filteredLawyers.map((lawyer) => {
                const room     = roomByLawyerId[String(lawyer.id)];
                const status   = room?.status;            // undefined | 'pending' | 'active'
                const isReqing = requestingId === lawyer.id;
                const online   = onlineUsers.has(String(lawyer.user_id));
                return (
                  <button key={lawyer.id} onClick={() => handleLawyerClick(lawyer)} disabled={isReqing}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition text-left disabled:opacity-60">
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm select-none">
                        {(lawyer.lname || "L").charAt(0).toUpperCase()}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${online ? "bg-green-400" : "bg-gray-300"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{lawyer.lname || "Lawyer"}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{lawyer.specialization || ""}</p>
                    </div>
                    {/* Status chip */}
                    {isReqing ? (
                      <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    ) : status === "active" ? (
                      <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full flex-shrink-0">Open</span>
                    ) : status === "pending" ? (
                      <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex-shrink-0">Pending</span>
                    ) : (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-0.5">
                        <Send size={9} /> Request
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ── Right Panel ───────────────────────────────────────────────────── */}
      {selectedRoom?.status === "active" ? (
        <ChatWindow
          room={selectedRoom}
          participantName={participantName}
          myUserId={myUserId}
          partnerUserId={selectedRoom?.lawyer_user_id}
          onClose={() => setSelectedRoom(null)}
        />
      ) : selectedRoom?.status === "pending" ? (
        /* Pending state panel */
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500 select-none px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <Clock size={36} className="text-orange-400" />
          </div>
          <p className="text-lg font-semibold text-gray-700">Request Sent</p>
          <p className="text-sm mt-2 text-gray-500">
            Your chat request has been sent to <span className="font-medium text-teal-700">{selectedRoom.lawyer_name}</span>.
          </p>
          <p className="text-xs mt-1 text-gray-400">
            The lawyer needs to accept before you can start chatting.
          </p>
          <p className="text-xs mt-4 text-gray-300">Room #{selectedRoom.id} · permanent</p>
        </div>
      ) : (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400 select-none">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <MessageSquare size={36} className="text-gray-400" />
          </div>
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm mt-1">Or browse "Lawyers" to request a chat</p>
        </div>
      )}
    </div>
  );
}