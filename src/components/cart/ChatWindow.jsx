import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { getMessages, sendMessage, markDelivered, markRead } from '../../services/chatService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../common/Loader';

// Renders the sent/delivered/read tick indicator for the logged-in user's
// own messages — single grey tick (sent), double grey (delivered: the
// other person's browser received it live), double accent-colored (read:
// they had this conversation open).
function ReceiptTicks({ message }) {
  if (message.read_at) {
    return <i className="ti ti-checks text-accent-200" title="Read" />;
  }
  if (message.delivered_at) {
    return <i className="ti ti-checks text-primary-300" title="Delivered" />;
  }
  return <i className="ti ti-check text-primary-300" title="Sent" />;
}

export default function ChatWindow({ conversationId, otherPartyName }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollContainerRef = useRef(null);

  // Scroll only the internal message list, never the page itself.
  const scrollToBottom = (smooth = true) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    // Ask for notification permission once, quietly — if they say no,
    // we just never show any, no repeated prompting.
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    getMessages(conversationId)
      .then((res) => {
        setMessages(res.data);
        markRead(conversationId); // opening the conversation reads everything in it
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 0);
      });

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const incoming = payload.new;
          setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));

          if (String(incoming.sender_id) !== String(user._id)) {
            // This chat is open right now, so it counts as both delivered
            // and read immediately — same as WhatsApp showing blue ticks
            // right away when the recipient already has the chat open.
            markDelivered(conversationId, [incoming.id]);
            markRead(conversationId);

            // Only notify if the tab isn't actually being looked at —
            // no point interrupting someone already watching the chat.
            if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(otherPartyName, { body: incoming.content });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          // Keeps tick marks in sync if the OTHER person's client marks
          // our sent messages as delivered/read while we're looking.
          setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? payload.new : m)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setInput('');
    try {
      const res = await sendMessage(conversationId, trimmed);
      setMessages((prev) => [...prev, res.data]);
    } catch {
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white border border-neutral-100 rounded-lg overflow-hidden">
      <div className="bg-primary-900 text-white px-4 py-3 shrink-0">
        <p className="font-heading font-semibold text-sm">{otherPartyName}</p>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <Loader />
        ) : messages.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">
            No messages yet — say hello.
          </p>
        ) : (
          messages.map((m) => {
            const isMine = String(m.sender_id) === String(user._id);
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    isMine ? 'bg-primary-900 text-white' : 'bg-neutral-100 text-neutral-900'
                  }`}
                >
                  <p>{m.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                    <p className={`text-[10px] ${isMine ? 'text-primary-200' : 'text-neutral-400'}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {isMine && <ReceiptTicks message={m} />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-neutral-100 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="h-10 px-4 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}
