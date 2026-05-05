import React, { useEffect, useRef, useState, useCallback } from "react";
import { Send, Paperclip, ChevronLeft, Trash2, MessageSquareX, X } from "lucide-react";
import { getMessages, clearMessages, deleteChat } from "../services/chatApi";
import { connectChatSocket } from "../services/chatSocket";

/**
 * ChatWindow – WhatsApp-Web-style message pane.
 *
 * Props
 * ─────
 *  room            : { id, lawyer_name, client_name, lawyer_id, client_id }
 *  participantName : display name shown in the header
 *  myUserId        : current user's Django user.id (number or numeric string)
 *  partnerUserId   : the OTHER participant's Django user.id (for presence matching)
 *  onClose         : callback to close / deselect the room (optional)
 */
export default function ChatWindow({ room, participantName, myUserId, partnerUserId, partnerOnline: partnerOnlineProp, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [wsStatus, setWsStatus] = useState("connecting"); // connecting | open | closed
  const [roomPartnerOnline, setRoomPartnerOnline] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // 'clear' | 'delete'
  const menuRef = useRef(null);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const myId = myUserId != null ? String(myUserId) : null;
  const partnerId = partnerUserId != null ? String(partnerUserId) : null;

  // Prefer global presence (from ws/presence) when available; OR with room-level presence.
  const partnerOnline = Boolean(partnerOnlineProp) || roomPartnerOnline;

  // ─── helpers ────────────────────────────────────────────────────────────

  /** Returns true when this message was sent by the logged-in user. */
  const isOwn = useCallback(
    (msg) => {
      if (!myId) return false;
      const sid =
        msg.sender_id != null
          ? String(msg.sender_id)
          : msg.sender != null
          ? String(msg.sender)
          : null;
      return sid === myId;
    },
    [myId]
  );

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ─── load history + open socket whenever room changes ───────────────────

  useEffect(() => {
    if (!room?.id) return;

    let ws = null;
    let cancelled = false;

    // Close previous socket cleanly
    if (socketRef.current) {
      socketRef.current.onclose = null;
      socketRef.current.close();
      socketRef.current = null;
    }

    setMessages([]);
    setWsStatus("connecting");
    setRoomPartnerOnline(false);

    // Fetch REST message history
    getMessages(room.id)
      .then((data) => {
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      });

    // Open WebSocket
    ws = connectChatSocket(room.id);
    socketRef.current = ws;

    ws.onopen = () => {
      if (!cancelled) setWsStatus("open");
    };

    ws.onmessage = (event) => {
      if (cancelled) return;
      try {
        const data = JSON.parse(event.data);

        // ── Presence event ──────────────────────────────────────────────
        if (data.type === "presence") {
          // Only update if it's the partner's status, not our own echo
          if (partnerId && String(data.user_id) === partnerId) {
            setRoomPartnerOnline(Boolean(data.online));
          } else if (!partnerId && String(data.user_id) !== myId) {
            // fallback when partnerUserId wasn't passed
            setRoomPartnerOnline(Boolean(data.online));
          }
          return;
        }

        // ── Chat message ────────────────────────────────────────────────
        setMessages((prev) => {
          if (data.id && prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      if (!cancelled) {
        setWsStatus("closed");
        setRoomPartnerOnline(false);
      }
    };

    ws.onerror = () => {
      if (!cancelled) setWsStatus("closed");
    };

    return () => {
      cancelled = true;
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [room?.id, myId, partnerId]);

  // Auto-scroll when messages grow
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── send ────────────────────────────────────────────────────────────────

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ message: text }));
    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── clear / delete actions ────────────────────────────────────────────────

  const handleClearMessages = useCallback(async () => {
    if (!window.confirm("Clear all messages in this chat? This cannot be undone.")) return;
    setMenuOpen(false);
    setActionLoading("clear");
    try {
      await clearMessages(room.id);
      setMessages([]);
    } catch (err) {
      alert(err.message || "Failed to clear messages.");
    } finally {
      setActionLoading(null);
    }
  }, [room?.id]);

  const handleDeleteChat = useCallback(async () => {
    if (!window.confirm("Permanently delete this chat and all messages? This cannot be undone.")) return;
    setMenuOpen(false);
    setActionLoading("delete");
    try {
      await deleteChat(room.id);
      if (onClose) onClose();
    } catch (err) {
      alert(err.message || "Failed to delete chat.");
    } finally {
      setActionLoading(null);
    }
  }, [room?.id, onClose]);

  // ─── format timestamp ─────────────────────────────────────────────────────

  const formatTime = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // ─── empty state ─────────────────────────────────────────────────────────

  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400 select-none">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <p className="text-lg font-medium">Select a conversation</p>
        <p className="text-sm mt-1">Choose from the sidebar to start chatting</p>
      </div>
    );
  }

  // ─── header status line ───────────────────────────────────────────────────

  const headerStatusText =
    wsStatus !== "open"
      ? wsStatus === "connecting"
        ? "connecting…"
        : "reconnecting…"
      : partnerOnline
      ? "online"
      : "offline";

  const headerStatusDotClass =
    wsStatus !== "open"
      ? "bg-yellow-300"
      : partnerOnline
      ? "bg-green-400"
      : "bg-gray-400";

  const headerStatusTextClass =
    wsStatus !== "open"
      ? "text-yellow-300"
      : partnerOnline
      ? "text-green-300"
      : "text-gray-300";

  const headerStatus = (
    <span className={`text-xs flex items-center gap-1 ${headerStatusTextClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${headerStatusDotClass}`} />
      {headerStatusText}
    </span>
  );

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col h-full bg-[#efeae2]">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow z-10 text-left">

        {/* Back button — always on the left */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition flex-shrink-0"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Name + status */}
        <div className="flex-1 min-w-0 flex flex-col items-start text-left">
          <p className="font-semibold truncate text-sm leading-tight text-left">{participantName || "Chat"}</p>
          <p className="leading-tight text-left">{headerStatus}</p>
        </div>

        {/* Profile avatar + dropdown — right side */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center font-bold text-sm select-none focus:outline-none"
            aria-label="Chat options"
            title="Chat options"
          >
            {participantName ? participantName.charAt(0).toUpperCase() : "?"}
            {/* Online dot */}
            {wsStatus === "open" && (
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-indigo-600
                            ${partnerOnline ? "bg-green-400" : "bg-gray-400"}`}
              />
            )}
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 overflow-hidden">
              {/* Profile header */}
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="font-semibold text-sm text-slate-800 truncate">{participantName || "Chat"}</p>
                <p className={`text-xs mt-0.5 flex items-center gap-1 ${partnerOnline ? "text-emerald-500" : "text-slate-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${partnerOnline ? "bg-emerald-400" : "bg-slate-300"}`} />
                  {partnerOnline ? "Online" : "Offline"}
                </p>
              </div>

              {/* Close menu button inside dropdown */}
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition"
              >
                <X size={13} />
              </button>

              {/* Actions */}
              <button
                onClick={handleClearMessages}
                disabled={actionLoading === "clear"}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                <MessageSquareX size={15} className="text-amber-500 flex-shrink-0" />
                {actionLoading === "clear" ? "Clearing…" : "Clear messages"}
              </button>

              <button
                onClick={handleDeleteChat}
                disabled={actionLoading === "delete"}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
              >
                <Trash2 size={15} className="flex-shrink-0" />
                {actionLoading === "delete" ? "Deleting…" : "Delete chat"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Message list ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8 select-none">
            No messages yet. Say hello! 👋
          </div>
        )}

        {messages.map((msg, idx) => {
          const own = isOwn(msg);
          const msgId = msg.id ?? `tmp-${idx}`;

          return (
            <div key={msgId} className={`flex ${own ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[65%] rounded-2xl px-4 py-2 shadow-sm
                  ${own
                    ? "bg-[#9b9ce9] rounded-br-sm text-gray-800"   /* sender  – right, green  */
                    : "bg-white     rounded-bl-sm text-gray-800"}  /* receiver – left, white  */
                `}
              >
                {/* Sender name — shown only on received messages */}
                {!own && msg.sender_name && (
                  <p className="text-xs font-semibold text-teal-600 mb-0.5 leading-tight">
                    {msg.sender_name}
                  </p>
                )}

                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {msg.message}
                </p>

                <p className={`text-[11px] mt-0.5 text-right leading-none
                               ${own ? "text-gray-500" : "text-gray-400"}`}>
                  {formatTime(msg.created_at)}
                  {own && <span className="ml-1 text-blue-500 font-bold" title="sent">✓</span>}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ─────────────────────────────────────────────────── */}
      <div className="flex items-end gap-2 px-3 py-2 bg-[#f0f0f0] border-t border-gray-200">
        <button className="p-2 text-gray-500 hover:text-teal-600 transition flex-shrink-0">
          <Paperclip size={20} />
        </button>

        <textarea
          rows={1}
          className="flex-1 resize-none rounded-full px-4 py-2 text-sm bg-white border border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-teal-400 max-h-28 overflow-y-auto"
          placeholder="Type a message…"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || wsStatus !== "open"}
          className="p-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex-shrink-0
                     hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}