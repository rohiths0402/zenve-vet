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

const COMMUNITIES_KEY = "zenvet_communities";

const DEFAULT_COMMUNITY = {
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

function loadCommunities() {
  try {
    const raw = localStorage.getItem(COMMUNITIES_KEY);

    if (!raw) return [DEFAULT_COMMUNITY];

    const list = JSON.parse(raw);

    if (!Array.isArray(list) || list.length === 0) {
      return [DEFAULT_COMMUNITY];
    }

    return list.map((community) => ({
      ...community,
      joined: true,
      members:
        Array.isArray(community.members) && community.members.length > 0
          ? community.members
          : DEFAULT_COMMUNITY.members,
      messages: Array.isArray(community.messages) ? community.messages : [],
    }));
  } catch {
    return [DEFAULT_COMMUNITY];
  }
}

function saveCommunities(list) {
  try {
    localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(list));
  } catch {
    return;
  }
}

export default function MessagesPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [communityTab, setCommunityTab] = useState(false);
  const [communities, setCommunities] = useState(loadCommunities);

  const [params, setParams] = useSearchParams();
  const profile = getProfile();
  const chat = useMessaging();

  const communityParam = params.get("community");
  const isCommunityActive = Boolean(communityParam) && !params.get("to");
  const currentFilter = communityTab ? "community" : chat.filter;

  const activeCommunity =
    communities.find((item) => String(item.id) === String(communityParam)) ||
    communities[0] ||
    DEFAULT_COMMUNITY;

  function handleFilter(key) {
    if (key === "community") {
      setCommunityTab(true);

      if (!isCommunityActive) {
        setParams({ community: String(activeCommunity.id) });
      }

      return;
    }

    setCommunityTab(false);
    chat.setFilter(key);
  }

  function handleOpenCommunity(id) {
    setParams({ community: String(id || "1") });
  }

  async function handleCommunitySend(payload) {
    const text = typeof payload === "string" ? payload : payload?.text;
    const attachment = typeof payload === "object" ? payload?.attachment : null;
    const content = String(text ?? "").trim();

    if (!content && !attachment) return false;

    const message = {
      id: `cmsg_${Date.now()}`,
      from: "me",
      senderName: profile?.name || "You",
      text: content,
      attachment: attachment || null,
      createdAt: new Date().toISOString(),
    };

    const updated = communities.map((item) =>
      String(item.id) === String(activeCommunity.id)
        ? { ...item, messages: [...(item.messages || []), message] }
        : item,
    );

    setCommunities(updated);
    saveCommunities(updated);
    return true;
  }

  async function handleCommunityCreate({ title, participantIds = [] }) {
    const communityName = String(title || "").trim();

    if (!communityName) return;

    const selectedIds = participantIds.map(String);

    const selected = chat.connections
      .filter((doctor) => selectedIds.includes(String(doctor.id)))
      .map(({ id, name, specialty, city, avatar }) => ({
        id,
        name,
        specialty,
        city,
        avatar,
      }));

    const members = [
      {
        id: String(profile?.id || "me"),
        name: profile?.name || "You",
        isYou: true,
      },
      ...selected,
    ];

    const created = {
      id: `community_${Date.now()}`,
      name: communityName,
      memberCount: members.length,
      joined: true,
      members,
      messages: [
        {
          id: `init_${Date.now()}`,
          from: "me",
          senderName: profile?.name || "You",
          text: `Welcome to ${communityName}! Community created.`,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const updated = [created, ...communities];

    setCommunities(updated);
    saveCommunities(updated);
    setParams({ community: created.id });
  }

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
          connections={chat.connections}
          presence={chat.presence}
          community={activeCommunity}
          communities={communities}
          activeCommunityId={communityParam}
          communityActive={isCommunityActive}
          onOpenCommunity={handleOpenCommunity}
          onCommunityCreate={handleCommunityCreate}
          activeId={chat.activeId}
          query={chat.query}
          onQuery={chat.setQuery}
          onSelect={chat.select}
          filter={currentFilter}
          onFilter={handleFilter}
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
