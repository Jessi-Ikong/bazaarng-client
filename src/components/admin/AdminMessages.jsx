import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMyConversations } from '../../services/chatService';
import ChatWindow from '../../components/chat/ChatWindow';
import Loader from '../../components/common/Loader';

export default function AdminMessages() {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    getMyConversations()
      .then((res) => {
        setConversations(res.data);
        if (location.state?.openConversationId) {
          setActiveId(location.state.openConversationId);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (id) => {
    setActiveId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
  };

  if (loading) return <Loader />;

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <h1 className="font-heading text-lg font-semibold text-neutral-900 mb-3">Support inbox</h1>

        {conversations.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-8">No support conversations yet.</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm ${
                  activeId === c.id
                    ? 'border-primary-600 bg-primary-50 text-primary-800'
                    : 'border-neutral-100 bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">{c.otherPartyName}</p>
                  {c.unreadCount > 0 && (
                    <span className="bg-accent-200 text-primary-900 text-[10px] font-semibold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shrink-0">
                      {c.unreadCount > 9 ? '9+' : c.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 capitalize truncate">
                  {c.lastMessage || c.participant_a_role}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        {active ? (
          <ChatWindow conversationId={active.id} otherPartyName={active.otherPartyName} />
        ) : (
          <div className="h-[70vh] flex items-center justify-center text-sm text-neutral-400 bg-white border border-neutral-100 rounded-lg">
            Select a conversation to respond.
          </div>
        )}
      </div>
    </div>
  );
}
