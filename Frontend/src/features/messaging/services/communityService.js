import { getProfile } from "./messageService";

export const COMMUNITY_STORAGE_KEY = "zenvet_community";
export const COMMUNITY_NAME = "Zenve Vet Community";

const MAX_LENGTH = 1000;
const MAX_STORED_MESSAGES = 200;

export const COMMUNITY_MEMBERS = [
  {
    id: "c1",
    name: "Dr. Arjun Mehta",
    specialty: "Veterinary Surgery",
    city: "Mumbai",
  },
  {
    id: "c2",
    name: "Dr. Priya Nair",
    specialty: "Veterinary Dermatology",
    city: "Kochi",
  },
  {
    id: "c3",
    name: "Dr. Vikram Singh",
    specialty: "Equine Medicine",
    city: "Jaipur",
  },
  {
    id: "c4",
    name: "Dr. Ananya Sharma",
    specialty: "Small Animal Medicine",
    city: "Delhi",
  },
  {
    id: "c5",
    name: "Dr. Rahul Verma",
    specialty: "Livestock Medicine",
    city: "Pune",
  },
  {
    id: "c6",
    name: "Dr. Sneha Iyer",
    specialty: "Exotic Animal Care",
    city: "Bengaluru",
  },
  {
    id: "c7",
    name: "Dr. Karthik Subramanian",
    specialty: "Veterinary Oncology",
    city: "Chennai",
  },
  {
    id: "c8",
    name: "Dr. Divya Menon",
    specialty: "Animal Nutrition",
    city: "Thiruvananthapuram",
  },
  {
    id: "c9",
    name: "Dr. Imran Qureshi",
    specialty: "Poultry Health",
    city: "Hyderabad",
  },
  {
    id: "c10",
    name: "Dr. Lakshmi Narayanan",
    specialty: "Veterinary Radiology",
    city: "Madurai",
  },
];

const SEED_MESSAGES = [
  {
    id: "seed-1",
    senderId: "c1",
    text: "Welcome to the Zenve Vet community, everyone!",
  },
  {
    id: "seed-2",
    senderId: "c2",
    text: "Happy to be here. Anyone dealing with chronic skin cases in dogs lately?",
  },
  {
    id: "seed-3",
    senderId: "c3",
    text: "Sharing some equine rehab notes this week, will post them under clinical cases.",
  },
];

function save(data) {
  try {
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(data));
  } catch {
    return;
  }
}

function initialise() {
  const now = Date.now();

  const messages = SEED_MESSAGES.map((item, index) => {
    const member = COMMUNITY_MEMBERS.find(
      (entry) => entry.id === item.senderId,
    );
    const minutesAgo = (SEED_MESSAGES.length - index) * 40;

    return {
      id: item.id,
      senderId: item.senderId,
      senderName: member.name,
      text: item.text,
      createdAt: new Date(now - minutesAgo * 60 * 1000).toISOString(),
    };
  });

  const data = { joinedUsers: [], messages };
  save(data);
  return data;
}

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(COMMUNITY_STORAGE_KEY));

    if (
      stored &&
      Array.isArray(stored.messages) &&
      Array.isArray(stored.joinedUsers)
    ) {
      return stored;
    }
  } catch {
    return initialise();
  }

  return initialise();
}

function hasJoined(data, profileId) {
  return data.joinedUsers.some((user) => String(user.id) === String(profileId));
}

export function getCommunity() {
  const data = load();
  const profile = getProfile();
  const profileId = profile ? String(profile.id) : null;

  const joinedMembers = data.joinedUsers.map((user) => ({
    id: String(user.id),
    name: user.name,
    specialty: "",
    city: "",
    isYou: String(user.id) === profileId,
  }));

  return {
    name: COMMUNITY_NAME,
    members: [...COMMUNITY_MEMBERS, ...joinedMembers],
    memberCount: COMMUNITY_MEMBERS.length + joinedMembers.length,
    joined: profileId !== null && hasJoined(data, profileId),
    messages: data.messages.map((message) => ({
      id: message.id,
      from:
        profileId !== null && String(message.senderId) === profileId
          ? "me"
          : "them",
      senderName: message.senderName,
      text: message.text,
      createdAt: message.createdAt,
    })),
  };
}

export function joinCommunity() {
  const profile = getProfile();

  if (!profile) {
    throw new Error("Create your profile to join the community.");
  }

  const data = load();

  if (!hasJoined(data, profile.id)) {
    data.joinedUsers.push({ id: profile.id, name: profile.name });
    save(data);
  }
}

export function leaveCommunity() {
  const profile = getProfile();

  if (!profile) return;

  const data = load();

  data.joinedUsers = data.joinedUsers.filter(
    (user) => String(user.id) !== String(profile.id),
  );

  save(data);
}

export function sendCommunityMessage(text) {
  const profile = getProfile();
  const content = String(text ?? "").trim();

  if (!profile) {
    throw new Error("Sign in to send messages.");
  }

  if (!content) {
    throw new Error("Message cannot be empty.");
  }

  if (content.length > MAX_LENGTH) {
    throw new Error(`Message is too long. Limit is ${MAX_LENGTH} characters.`);
  }

  const data = load();

  if (!hasJoined(data, profile.id)) {
    throw new Error("Join the community to send messages.");
  }

  data.messages.push({
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    senderId: profile.id,
    senderName: profile.name,
    text: content,
    createdAt: new Date().toISOString(),
  });

  data.messages = data.messages.slice(-MAX_STORED_MESSAGES);
  save(data);
}
