export const COMMUNITIES_KEY = "zenvet_communities";

function randomPart() {
  return Math.random().toString(36).slice(2, 8);
}

function isMine(member, profileId) {
  return String(member.id) === String(profileId);
}

function systemMessage(text) {
  return {
    id: `sys_${Date.now()}_${randomPart()}`,
    system: true,
    text,
    createdAt: new Date().toISOString(),
  };
}

function normalise(community) {
  return {
    ...community,
    inviteCode: community.inviteCode || String(community.id),
    members: Array.isArray(community.members) ? community.members : [],
    messages: Array.isArray(community.messages) ? community.messages : [],
  };
}

export function loadCommunities() {
  try {
    const list = JSON.parse(localStorage.getItem(COMMUNITIES_KEY));

    if (Array.isArray(list)) {
      return list.map(normalise);
    }
  } catch {
    return [];
  }

  return [];
}

export function saveCommunities(list) {
  try {
    localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(list));
  } catch {
    return;
  }
}

export function viewCommunity(community, profileId) {
  const members = community.members.map((member) => ({
    ...member,
    isYou: isMine(member, profileId),
  }));

  return {
    ...community,
    members,
    memberCount: members.length,
    joined: members.some((member) => member.isYou),
    messages: community.messages.map((message) => {
      if (message.system) return message;

      return {
        ...message,
        from: String(message.senderId) === String(profileId) ? "me" : "them",
      };
    }),
  };
}

export function buildInviteLink(community) {
  const query = new URLSearchParams({
    join: community.inviteCode,
    name: community.name,
  });

  return `${window.location.origin}/messages?${query.toString()}`;
}

export function makeMessage(profile, { text, attachment }) {
  return {
    id: `cmsg_${Date.now()}_${randomPart()}`,
    senderId: String(profile.id),
    senderName: profile.name,
    text,
    attachment: attachment || null,
    createdAt: new Date().toISOString(),
  };
}

export function appendMessage(list, communityId, message) {
  return list.map((community) =>
    String(community.id) === String(communityId)
      ? { ...community, messages: [...community.messages, message] }
      : community,
  );
}

export function createCommunity({ name, profile, selected }) {
  return {
    id: `community_${Date.now()}`,
    inviteCode: randomPart() + randomPart(),
    name,
    members: [{ id: String(profile.id), name: profile.name }, ...selected],
    messages: [systemMessage(`${profile.name} created ${name}`)],
  };
}

export function joinCommunity(list, communityId, profile) {
  return list.map((community) => {
    if (String(community.id) !== String(communityId)) return community;

    if (community.members.some((member) => isMine(member, profile.id))) {
      return community;
    }

    return {
      ...community,
      members: [
        ...community.members,
        { id: String(profile.id), name: profile.name },
      ],
      messages: [
        ...community.messages,
        systemMessage(`${profile.name} joined`),
      ],
    };
  });
}

export function leaveCommunity(list, communityId, profile) {
  return list.map((community) => {
    if (String(community.id) !== String(communityId)) return community;

    const remaining = community.members.filter(
      (member) => !isMine(member, profile.id),
    );

    if (remaining.length === community.members.length) return community;

    return {
      ...community,
      members: remaining,
      messages: [...community.messages, systemMessage(`${profile.name} left`)],
    };
  });
}

export function acceptInvite(list, { code, name }, profile) {
  const existing = list.find(
    (community) =>
      community.inviteCode === code || String(community.id) === code,
  );

  if (existing) {
    const alreadyMember = existing.members.some((member) =>
      isMine(member, profile.id),
    );

    return {
      list: alreadyMember ? list : joinCommunity(list, existing.id, profile),
      community: existing,
      status: alreadyMember ? "member" : "joined",
    };
  }

  const copy = {
    id: `community_${Date.now()}`,
    inviteCode: code,
    name: name || "Shared community",
    members: [{ id: String(profile.id), name: profile.name }],
    messages: [systemMessage(`${profile.name} joined with an invite link`)],
  };

  return { list: [copy, ...list], community: copy, status: "copied" };
}
