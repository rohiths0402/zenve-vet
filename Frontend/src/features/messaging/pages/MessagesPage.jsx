import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import CommunityChat from "../components/CommunityChat";
import EmptyState from "../components/EmptyState";
import useMessaging from "../hooks/useMessaging";
import { getProfile } from "../services/messageService";
import RegistrationModal from "../../auth/components/RegistrationModal";
import SignInModal from "../../auth/components/SignInModal";
import "../messages.css";

export default function MessagesPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const [params, setParams] = useSearchParams();
  const profile = getProfile();
  const chat = useMessaging();

  const defaultCommunity = {
    id: "1",
    name: "Zenve Vet Community",
    memberCount: 11,
    joined: true,
    members: [
      {
        id: "101",
        name: "Dr. Arjun Mehta",
        specialty: "Veterinary Surgery",
        city: "Mumbai",
      },
      {
        id: "102",
        name: "Dr. Priya Nair",
        specialty: "Small Animal Medicine",
        city: "Chennai",
      },
      {
        id: "103",
        name: "Dr. Vikram Singh",
        specialty: "Equine Specialist",
        city: "Bengaluru",
      },
    ],
    messages: [
      {
        id: "c1",
        from: "them",
        senderName: "Dr. Vikram Singh",
        text: "Sharing some equine rehab notes this week, will post them under clinical cases.",
        createdAt: new Date().toISOString(),
      },
    ],
  };

  const getStoredCommunities = () => {
    try {
      const raw = localStorage.getItem("zenvet_communities");
      if (!raw) return [defaultCommunity];
      const list = JSON.parse(raw);
      return list.map((c) => ({
        ...c,
        joined: true,
        members:
          Array.isArray(c.members) && c.members.length > 0
            ? c.members
            : defaultCommunity.members,
        messages: Array.isArray(c.messages) ? c.messages : [],
      }));
    } catch {
      return [defaultCommunity];
    }
  };

  const [communities, setCommunities] = useState(getStoredCommunities);

  const communityParam = params.get("community");
  const isCommunityActive = Boolean(communityParam) && !params.get("to");
  const currentFilter = communityParam ? "community" : chat.filter;

  const activeCommunity =
    communities.find((c) => String(c.id) === String(communityParam)) ||
    communities[0] ||
    defaultCommunity;

  const handleCommunitySend = async (payload) => {
    const text = typeof payload === "string" ? payload : payload?.text;
    const attachment = typeof payload === "object" ? payload?.attachment : null;
    const content = String(text ?? "").trim();
    if (!content && !attachment) return;

    const newMsg = {
      id: "cmsg_" + Date.now(),
      from: "me",
      senderName: profile?.name || "You",
      text: content,
      attachment: attachment || null,
      createdAt: new Date().toISOString(),
    };

    const updated = communities.map((comm) => {
      if (String(comm.id) === String(activeCommunity.id)) {
        return {
          ...comm,
          messages: [...(comm.messages || []), newMsg],
        };
      }
      return comm;
    });

    setCommunities(updated);
    localStorage.setItem("zenvet_communities", JSON.stringify(updated));
  };

  const handleCommunityCreate = async ({ title, participantIds = [] }) => {
    const newComm = {
      id: "community_" + Date.now(),
      name: title.trim(),
      memberCount: participantIds.length + 1,
      joined: true,
      members: [
        { id: "me", name: profile?.name || "Dr. Chandran", isYou: true },
        {
          id: "d1",
          name: "Dr. Arun Kumar",
          specialty: "Veterinary Surgeon",
          city: "Chennai",
        },
        {
          id: "d2",
          name: "Dr. Meena Raj",
          specialty: "Veterinary Surgery",
          city: "Coimbatore",
        },
      ],
      messages: [
        {
          id: "init_" + Date.now(),
          from: "me",
          senderName: profile?.name || "You",
          text: `Welcome to ${title.trim()}! Community created.`,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const updated = [newComm, ...communities];
    setCommunities(updated);
    localStorage.setItem("zenvet_communities", JSON.stringify(updated));

    setParams({ community: newComm.id });
  };

  function handleOpenRegistration() {
    setShowSignIn(false);
    setShowRegistration(true);
  }

  function handleOpenSignIn() {
    setShowRegistration(false);
    setShowSignIn(true);
  }

  function handleCloseAuth() {
    setShowRegistration(false);
    setShowSignIn(false);
  }

  if (!profile) {
    return (
      <>
        <EmptyState onCreate={handleOpenRegistration} />
        {showRegistration && (
          <RegistrationModal
            onClose={handleCloseAuth}
            onSignIn={handleOpenSignIn}
          />
        )}
        {showSignIn && (
          <SignInModal
            onClose={handleCloseAuth}
            onRegister={handleOpenRegistration}
          />
        )}
      </>
    );
  }

  if (chat.loading) {
    return (
      <div className="msg-loading" role="status">
        Loading conversations...
      </div>
    );
  }

  return (
    <>
      <div className="msg-shell">
        <ConversationList
          items={chat.visible}
          presence={chat.presence}
          community={activeCommunity}
          communities={communities}
          activeCommunityId={communityParam}
          communityActive={isCommunityActive}
          onOpenCommunity={(commId) => {
            chat.setFilter("community");
            setParams({ community: String(commId || "1") });
          }}
          onCommunityCreate={handleCommunityCreate}
          activeId={chat.activeId}
          query={chat.query}
          onQuery={chat.setQuery}
          onSelect={(id) => {
            setParams({ to: String(id) });
          }}
          filter={currentFilter}
          onFilter={chat.setFilter}
          unreadCount={chat.unreadCount}
        />

        {isCommunityActive ? (
          <CommunityChat
            community={activeCommunity}
            onJoin={() => {}}
            onLeave={() => {}}
            onSend={handleCommunitySend}
            onError={chat.flash}
          />
        ) : (
          <ChatWindow
            doctor={chat.active}
            meta={chat.activeMeta}
            live={chat.activePresence}
            messages={chat.messages}
            onSend={chat.send}
            onError={chat.flash}
            onAction={chat.act}
          />
        )}
      </div>

      {chat.notice && (
        <p className="msg-toast" role="status">
          {chat.notice}
        </p>
      )}
    </>
  );
}
