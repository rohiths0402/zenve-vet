import { useNavigate } from "react-router-dom";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import EmptyState from "../components/EmptyState";
import useMessaging from "../hooks/useMessaging";
import { getProfile } from "../services/messageService";
import "../messages.css";

export default function MessagesPage() {
  const navigate = useNavigate();
  const profile = getProfile();
  const chat = useMessaging();

  if (!profile) {
    return <EmptyState onCreate={() => navigate("/create-profile")} />;
  }

  if (chat.loading) return null;

  return (
    <>
      <div className="msg-shell">
        <ConversationList
          items={chat.visible}
          presence={chat.presence}
          activeId={chat.activeId}
          query={chat.query}
          onQuery={chat.setQuery}
          onSelect={chat.select}
          filter={chat.filter}
          onFilter={chat.setFilter}
          unreadCount={chat.unreadCount}
        />
        <ChatWindow
          doctor={chat.active}
          meta={chat.activeMeta}
          live={chat.activePresence}
          messages={chat.messages}
          onSend={chat.send}
          onError={chat.flash}
          onAction={chat.act}
        />
      </div>
      {chat.notice && (
        <p className="msg-toast" role="status">
          {chat.notice}
        </p>
      )}
    </>
  );
}
// localStorage.setItem('zenvet_profile', JSON.stringify({ id: 'me', name: 'Dr. Chandran' }));
// localStorage.setItem('zenvet_connections', JSON.stringify([
//   { id: 'd1', name: 'Dr. Arjun Mehta', specialty: 'Veterinary Surgery', city: 'Mumbai', state: 'Maharashtra', example: true },
//   { id: 'd2', name: 'Dr. Ananya Sharma', specialty: 'Small Animal Medicine', example: true }
// ]));
