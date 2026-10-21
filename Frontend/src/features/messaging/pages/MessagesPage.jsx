import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Users } from "lucide-react";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import CommunityChat from "../components/CommunityChat";
import EmptyState from "../components/EmptyState";
import useMessaging from "../hooks/useMessaging";
import {
  getProfile,
  sendMessage,
  startConversation,
} from "../services/messageService";
import {
  COMMUNITIES_KEY,
  acceptInvite,
  appendMessage,
  buildInviteLink,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  loadCommunities,
  makeMessage,
  saveCommunities,
  viewCommunity,
} from "../services/communityStore";
import RegistrationModal from "../../auth/components/RegistrationModal";
import SignInModal from "../../auth/components/SignInModal";
import "../messages.css";

const NO_COMMUNITY = "none";

export default function MessagesPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [communityTab, setCommunityTab] = useState(false);
  const [communities, setCommunities] = useState(loadCommunities);

  const [params, setParams] = useSearchParams();
  const profile = getProfile();
  const chat = useMessaging();
  const { flash } = chat;

  const profileId = profile ? String(profile.id) : null;
  const profileName = profile?.name || "Doctor";
  const joinCode = params.get("join");
  const joinName = params.get("name");

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === COMMUNITIES_KEY) {
        setCommunities(loadCommunities());
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!joinCode || !profileId) return;

    const result = acceptInvite(
      loadCommunities(),
      { code: joinCode, name: joinName },
      { id: profileId, name: profileName },
    );

    saveCommunities(result.list);
    setCommunities(result.list);
    setParams({ community: String(result.community.id) }, { replace: true });

    if (result.status === "joined") {
      flash(`You joined ${result.community.name}.`);
    }

    if (result.status === "copied") {
      flash(
        `${result.community.name} was not found on this device, so a local copy was created.`,
      );
    }
  }, [joinCode, joinName, profileId, profileName, setParams, flash]);

  const me = { id: profileId, name: profileName };

  const views = communities.map((item) => viewCommunity(item, profileId));

  const listItems = views.map((item) => ({
    ...item,
    messages: item.messages.filter((message) => !message.system),
  }));

  const communityParam = params.get("community");
  const isCommunityActive = Boolean(communityParam) && !params.get("to");
  const currentFilter = communityTab ? "community" : chat.filter;

  const activeCommunity =
    views.find((item) => String(item.id) === String(communityParam)) ||
    views[0] ||
    null;

  function update(mutator) {
    const next = mutator(loadCommunities());
    saveCommunities(next);
    setCommunities(next);
  }

  function handleFilter(key) {
    if (key === "community") {
      setCommunityTab(true);

      if (!isCommunityActive) {
        setParams({
          community: activeCommunity
            ? String(activeCommunity.id)
            : NO_COMMUNITY,
        });
      }

      return;
    }

    setCommunityTab(false);
    chat.setFilter(key);
  }

  function handleOpenCommunity(id) {
    setParams({ community: String(id) });
  }

  function handleJoin() {
    update((list) => joinCommunity(list, activeCommunity.id, me));
  }

  function handleLeave() {
    update((list) => leaveCommunity(list, activeCommunity.id, me));
  }

  async function handleCommunitySend(payload) {
    const text = typeof payload === "string" ? payload : payload?.text;
    const attachment = typeof payload === "object" ? payload?.attachment : null;
    const content = String(text ?? "").trim();

    if (!content && !attachment) return false;

    if (!activeCommunity?.joined) {
      flash("Join the community to send messages.");
      return false;
    }

    const message = makeMessage(me, { text: content, attachment });
    update((list) => appendMessage(list, activeCommunity.id, message));
    return true;
  }

  function handleCommunityCreate({
    title,
    participantIds = [],
    selectedDoctors = [],
  }) {
    const name = String(title || "").trim();

    if (!name) return;

    let selected = selectedDoctors;

    if (!selected || selected.length === 0) {
      const selectedIds = participantIds.map(String);
      selected = (chat.connections || [])
        .filter((doctor) => selectedIds.includes(String(doctor.id)))
        .map((doctor) => ({
          id: String(doctor.id),
          name: doctor.name,
          specialty: doctor.specialty,
          city: doctor.city,
          avatar: doctor.avatar,
        }));
    }

    const created = createCommunity({ name, profile: me, selected });

    update((list) => [created, ...list]);
    setParams({ community: created.id });
  }

  async function handleShareToDoctor(doctor) {
    if (!doctor.conversationId) {
      flash("Start a conversation with this doctor first.");
      return false;
    }

    const text = `Join "${activeCommunity.name}" on Zenve Vet: ${buildInviteLink(activeCommunity)}`;

    try {
      await sendMessage(doctor.conversationId, { text });
      flash(`Invite sent to ${doctor.name}.`);
      return true;
    } catch (error) {
      flash(error.message || "Could not send the invite.");
      return false;
    }
  }

  async function handleMessageMember(member) {
    const existing = chat.connections.find(
      (doctor) => String(doctor.id) === String(member.id),
    );

    if (existing?.conversationId) {
      setCommunityTab(false);
      chat.select(existing.conversationId);
      return;
    }

    try {
      const conversationId = await startConversation(member.id);
      setCommunityTab(false);
      setParams({ to: conversationId });
    } catch (error) {
      flash(error.message || "Could not start the conversation.");
    }
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

  function renderMain() {
    if (!isCommunityActive) {
      return (
        <ChatWindow
          doctor={chat.active}
          meta={chat.activeMeta}
          live={chat.activePresence}
          messages={chat.messages}
          onSend={chat.send}
          onError={flash}
          onAction={chat.act}
        />
      );
    }

    if (!activeCommunity) {
      return (
        <section className="msg-chat msg-chat-empty">
          <Users size={28} strokeWidth={1.5} />
          <h2>No communities yet</h2>
          <p className="msg-hint">
            Create one with the community button, or open an invite link to
            join.
          </p>
        </section>
      );
    }

    return (
      <CommunityChat
        key={activeCommunity.id}
        community={activeCommunity}
        inviteLink={buildInviteLink(activeCommunity)}
        connections={chat.connections}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onSend={handleCommunitySend}
        onShare={handleShareToDoctor}
        onMessageMember={handleMessageMember}
        onNotice={flash}
        onError={flash}
      />
    );
  }

  return (
    <>
      <div className="msg-shell">
        <ConversationList
          items={chat.visible}
          connections={chat.connections}
          presence={chat.presence}
          community={listItems[0]}
          communities={listItems}
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

        {renderMain()}
      </div>

      {chat.notice && (
        <p className="msg-toast" role="status">
          {chat.notice}
        </p>
      )}
    </>
  );
}
