import { useEffect, useRef, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markDelivered,
  markRead,
} from "../../services/chatService";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../common/Loader";

const EDIT_DELETE_WINDOW_MS = 60 * 60 * 1000; // must match the backend's window

function ReceiptTicks({ message }) {
  if (message.read_at)
    return <i className="ti ti-checks text-accent-200" title="Read" />;
  if (message.delivered_at)
    return <i className="ti ti-checks text-primary-300" title="Delivered" />;
  return <i className="ti ti-check text-primary-300" title="Sent" />;
}

export default function ChatWindow({ conversationId, otherPartyName }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null); // the message being replied to
  const [editingId, setEditingId] = useState(null); // the message currently being edited
  const [openMenuId, setOpenMenuId] = useState(null); // which message's action menu is open
  const scrollContainerRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    getMessages(conversationId)
      .then((res) => {
        setMessages(res.data);
        markRead(conversationId);
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 0);
      });

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming],
          );

          if (String(incoming.sender_id) !== String(user._id)) {
            markDelivered(conversationId, [incoming.id]);
            markRead(conversationId);
            if (
              document.hidden &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification(otherPartyName, { body: incoming.content });
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Covers ticks updating, AND edits/deletes made from another
          // device/tab showing up here live too.
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? payload.new : m)),
          );
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const canEditOrDelete = (m) =>
    String(m.sender_id) === String(user._id) &&
    !m.deleted_at &&
    Date.now() - new Date(m.created_at).getTime() < EDIT_DELETE_WINDOW_MS;

  const startReply = (m) => {
    setReplyTarget(m);
    setEditingId(null);
    setOpenMenuId(null);
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setInput(m.content);
    setReplyTarget(null);
    setOpenMenuId(null);
  };

  const cancelComposeExtras = () => {
    setReplyTarget(null);
    setEditingId(null);
    setInput("");
  };

  const handleDelete = async (m) => {
    setOpenMenuId(null);
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    try {
      const res = await deleteMessage(conversationId, m.id);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === m.id ? res.data : msg)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete message.");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      if (editingId) {
        const res = await editMessage(conversationId, editingId, trimmed);
        setMessages((prev) =>
          prev.map((m) => (m.id === editingId ? res.data : m)),
        );
      } else {
        const res = await sendMessage(conversationId, trimmed, replyTarget?.id);
        setMessages((prev) => [...prev, res.data]);
      }
      cancelComposeExtras();
    } catch (err) {
      alert(err.response?.data?.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  const findMessage = (id) => messages.find((m) => m.id === id);

  const scrollToMessage = (id) => {
    const el = document.getElementById(`msg-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.classList.add("ring-2", "ring-primary-400");
    setTimeout(() => el?.classList.remove("ring-2", "ring-primary-400"), 1200);
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white border border-neutral-100 rounded-lg overflow-hidden">
      <div className="bg-primary-900 text-white px-4 py-3 shrink-0">
        <p className="font-heading font-semibold text-sm">{otherPartyName}</p>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {loading ? (
          <Loader />
        ) : messages.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">
            No messages yet — say hello.
          </p>
        ) : (
          messages.map((m) => {
            const isMine = String(m.sender_id) === String(user._id);
            const repliedTo = m.reply_to_message_id
              ? findMessage(m.reply_to_message_id)
              : null;

            return (
              <div
                key={m.id}
                id={`msg-${m.id}`}
                className={`flex rounded-lg transition ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div className="group relative max-w-[75%]">
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      m.deleted_at
                        ? "bg-neutral-50 text-neutral-400 italic"
                        : isMine
                          ? "bg-primary-900 text-white"
                          : "bg-neutral-100 text-neutral-900"
                    }`}
                  >
                    {repliedTo && !m.deleted_at && (
                      <button
                        onClick={() => scrollToMessage(repliedTo.id)}
                        className={`block w-full text-left mb-1.5 pl-2 border-l-2 text-xs opacity-80 truncate ${
                          isMine ? "border-primary-300" : "border-neutral-400"
                        }`}
                      >
                        {repliedTo.deleted_at
                          ? "Original message deleted"
                          : repliedTo.content}
                      </button>
                    )}

                    {m.deleted_at ? (
                      <p className="flex items-center gap-1">
                        <i className="ti ti-ban" /> This message was deleted
                      </p>
                    ) : (
                      <p>{m.content}</p>
                    )}

                    <div
                      className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}
                    >
                      {m.edited_at && !m.deleted_at && (
                        <span
                          className={`text-[10px] italic ${isMine ? "text-primary-200" : "text-neutral-400"}`}
                        >
                          edited
                        </span>
                      )}
                      <p
                        className={`text-[10px] ${isMine ? "text-primary-200" : "text-neutral-400"}`}
                      >
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {isMine && !m.deleted_at && <ReceiptTicks message={m} />}
                    </div>
                  </div>

                  {!m.deleted_at && (
                    <div
                      className={`absolute top-0 ${isMine ? "-left-8" : "-right-8"} opacity-0 group-hover:opacity-100 transition`}
                    >
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === m.id ? null : m.id)
                        }
                        className="w-6 h-6 rounded-full bg-white border border-neutral-200 text-neutral-500 flex items-center justify-center text-xs hover:bg-neutral-50"
                      >
                        <i className="ti ti-dots" />
                      </button>
                      {openMenuId === m.id && (
                        <div
                          className={`absolute top-7 ${isMine ? "left-0" : "right-0"} bg-white border border-neutral-100 rounded-lg shadow-lg py-1 z-10 w-28`}
                        >
                          <button
                            onClick={() => startReply(m)}
                            className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                          >
                            Reply
                          </button>
                          {canEditOrDelete(m) && (
                            <>
                              <button
                                onClick={() => startEdit(m)}
                                className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(m)}
                                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {(replyTarget || editingId) && (
        <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-600">
          <span className="truncate">
            {editingId
              ? "Editing message"
              : `Replying to: ${replyTarget.content}`}
          </span>
          <button
            onClick={cancelComposeExtras}
            className="text-neutral-400 hover:text-neutral-700 ml-2 shrink-0"
          >
            <i className="ti ti-x" />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="flex gap-2 p-3 border-t border-neutral-100 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={editingId ? "Edit your message..." : "Type a message..."}
          className="flex-1 h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="h-10 px-4 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-60"
        >
          {editingId ? "Save" : "Send"}
        </button>
      </form>
    </div>
  );
}
