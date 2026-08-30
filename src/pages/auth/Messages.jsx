import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMyConversations, getOrCreateConversation } from '../services/chatService';
import ChatWindow from '../components/chat/ChatWindow';
import Loader from '../components/common/Loader';

export default function Messages() {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [startingSupport, setStartingSupport] = useState(false);

  const loadConversations = () => {
    getMyConversations()
      .then((res) => {
        setConversations(res.data);
        // If we arrived here from "Chat with vendor" on a product page,
        // open that conversation immediately instead of the list.
        if (location.state?.openConversationId) {
          setActiveId(location.state.openConversationId);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadConversations, []);

  const handleContactSupport = async () => {
    setStartingSupport(true);
    try {
      const res = await getOrCreateConversation({ type: 'support' });
      setActiveId(res.data.id);
      loadConversations();
    } finally {
      setStartingSupport(false);
    }
  };

  if (loading) return <Loader />;

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-heading text-lg font-semibold text-neutral-900">Messages</h1>
          <button
            onClick={handleContactSupport}
            disabled={startingSupport}
            className="h-8 px-3 rounded-lg bg-accent-50 text-accent-700 text-xs font-medium hover:bg-accent-100 disabled:opacity-60"
          >
            Contact support
          </button>
        </div>

        {conversations.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-8">No conversations yet.</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm ${
                  activeId === c.id
                    ? 'border-primary-600 bg-primary-50 text-primary-800'
                    : 'border-neutral-100 bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <p className="font-medium truncate">{c.otherPartyName}</p>
                <p className="text-xs text-neutral-500">
                  {c.type === 'support' ? 'Support' : 'Vendor chat'}
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
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
