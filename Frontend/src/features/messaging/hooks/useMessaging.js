import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import useChatSocket from "./useChatSocket";
import {
  DEFAULT_META,
  deleteConversation,
  getConversations,
  getMessages,
  getProfile,
  normalizeIncomingMessage,
  sendMessage,
  setThreadMeta,
} from "../services/messageService";

const STATUS_RANK = { sent: 0, delivered: 1, read: 2 };
const TYPING_TIMEOUT = 4000;

export default function useMessaging() {
  const [params, setParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [presence, setPresence] = useState({});
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const timer = useRef(null);
  const typingTimers = useRef({});
  const messageRequest = useRef(0);
  const isCommunity = Boolean(params.get("community"));
  const activeId = isCommunity ? null : params.get("to");
  const activeRef = useRef(activeId);

  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  const flash = useCallback((text) => {
    setNotice(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(""), 3500);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const rows = await getConversations();
      setConversations(rows || []);
      return rows;
    } catch (error) {
      flash(error.message || "Could not load conversations.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => {
    refresh();

    const timers = typingTimers.current;

    return () => {
      clearTimeout(timer.current);
      Object.values(timers).forEach(clearTimeout);
    };
  }, [refresh]);

  const updatePresence = useCallback((userId, changes) => {
    setPresence((previous) => ({
      ...previous,
      [userId]: { ...previous[userId], ...changes },
    }));
  }, []);

  const handleSocketEvent = useCallback(
    (event, sendEvent) => {
      switch (event.type) {
        case "socket.closed": {
          setPresence((previous) => {
            const next = {};

            Object.keys(previous).forEach((id) => {
              next[id] = { ...previous[id], online: false, typing: false };
            });

            return next;
          });
          break;
        }

        case "presence.snapshot": {
          const online = new Set((event.onlineUserIds || []).map(String));

          setPresence((previous) => {
            const next = {};

            Object.keys(previous).forEach((id) => {
              const isOnline = online.has(id);

              next[id] = {
                ...previous[id],
                online: isOnline,
                typing: isOnline ? Boolean(previous[id].typing) : false,
              };
            });

            online.forEach((id) => {
              if (!next[id]) next[id] = { online: true, typing: false };
            });

            return next;
          });
          break;
        }

        case "presence": {
          const id = String(event.userId);

          setPresence((previous) => ({
            ...previous,
            [id]: {
              ...previous[id],
              online: Boolean(event.online),
              typing: event.online ? Boolean(previous[id]?.typing) : false,
              lastSeen: event.lastSeen || previous[id]?.lastSeen || null,
            },
          }));
          break;
        }

        case "typing": {
          const id = String(event.userId);
          const isTyping = event.isTyping !== false;

          clearTimeout(typingTimers.current[id]);
          updatePresence(id, { typing: isTyping });

          if (isTyping) {
            typingTimers.current[id] = setTimeout(() => {
              updatePresence(id, { typing: false });
            }, TYPING_TIMEOUT);
          }
          break;
        }

        case "message.new": {
          const profile = getProfile();
          const message = normalizeIncomingMessage(event.message, profile?.id);
          const conversationId = String(event.conversationId);
          const viewing = conversationId === String(activeRef.current);
          const incoming = message.from === "them";

          if (viewing) {
            setMessages((previous) =>
              previous.some((item) => String(item.id) === String(message.id))
                ? previous
                : [...previous, message],
            );
          }

          if (incoming) {
            const senderId = String(
              event.message?.sender?.id ?? event.message?.sender,
            );

            clearTimeout(typingTimers.current[senderId]);
            updatePresence(senderId, { typing: false });

            sendEvent({
              type: viewing ? "read" : "delivered",
              conversationId: Number(conversationId),
              upToId: Number(message.id),
            });
          }

          refresh();
          break;
        }

        case "message.status": {
          if (String(event.conversationId) !== String(activeRef.current)) {
            break;
          }

          const next = event.status === "seen" ? "read" : "delivered";
          const upTo = Number(event.upToId);

          setMessages((previous) =>
            previous.map((item) =>
              item.from === "me" &&
              Number(item.id) <= upTo &&
              STATUS_RANK[item.status] < STATUS_RANK[next]
                ? { ...item, status: next }
                : item,
            ),
          );
          break;
        }

        default:
          break;
      }
    },
    [refresh, updatePresence],
  );

  const { sendEvent } = useChatSocket(handleSocketEvent);

  const conversationCount = conversations.length;

  useEffect(() => {
    if (conversationCount > 0) {
      sendEvent({ type: "presence.sync" });
    }
  }, [conversationCount, sendEvent]);

  useEffect(() => {
    const requestId = ++messageRequest.current;

    if (!activeId) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    setMessages([]);
    setMessagesLoading(true);

    async function loadMessages() {
      try {
        const rows = await getMessages(activeId);

        if (requestId !== messageRequest.current) return;

        setMessages(rows);

        const lastIncoming = [...rows]
          .reverse()
          .find((item) => item.from === "them");

        if (lastIncoming) {
          sendEvent({
            type: "read",
            conversationId: Number(activeId),
            upToId: Number(lastIncoming.id),
          });
        }

        await setThreadMeta(activeId, { unread: 0 });

        if (requestId === messageRequest.current) {
          await refresh();
        }
      } catch (error) {
        if (requestId === messageRequest.current) {
          flash(error.message || "Could not load messages.");
        }
      } finally {
        if (requestId === messageRequest.current) {
          setMessagesLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      if (requestId === messageRequest.current) {
        messageRequest.current += 1;
      }
    };
  }, [activeId, refresh, flash, sendEvent]);

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();

    return conversations.filter(({ doctor, last, meta }) => {
      if (filter === "archived" && !meta.archived) {
        return false;
      }

      if (filter !== "archived" && filter !== "connections" && meta.archived) {
        return false;
      }

      if (filter === "all" && !last && String(doctor.id) !== String(activeId)) {
        return false;
      }

      if (filter === "unread" && Number(meta.unread) === 0) {
        return false;
      }

      if (filter === "starred" && !meta.starred) {
        return false;
      }

      if (!search) return true;

      const haystack =
        `${doctor.name} ${doctor.specialty} ${last?.text || ""}`.toLowerCase();

      return haystack.includes(search);
    });
  }, [conversations, filter, query, activeId]);

  const unreadCount = useMemo(
    () =>
      conversations.filter(
        (conversation) =>
          Number(conversation.meta.unread) > 0 && !conversation.meta.archived,
      ).length,
    [conversations],
  );

  const found = conversations.find(
    (conversation) => String(conversation.id) === String(activeId),
  );

  const active = found ? found.doctor : null;
  const activeMeta = found ? found.meta : DEFAULT_META;
  const activePresence = active ? presence[active.id] || {} : {};

  const openCommunity = useCallback(() => {
    setParams({ community: "1" });
  }, [setParams]);

  const changeFilter = useCallback(
    (key) => {
      if (key === "community") {
        openCommunity();
        return;
      }

      setFilter(key);

      if (isCommunity) {
        setParams({});
      }
    },
    [isCommunity, openCommunity, setParams],
  );

  const select = useCallback(
    (id) => {
      const conversation = conversations.find(
        (item) =>
          String(item.id) === String(id) ||
          String(item.doctor.id) === String(id),
      );

      if (conversation) {
        setParams({ to: String(conversation.id) });
      }
    },
    [conversations, setParams],
  );

  const patch = useCallback(
    async (id, changes) => {
      try {
        await setThreadMeta(id, changes);
        await refresh();
        return true;
      } catch (error) {
        flash(error.message || "Could not update conversation.");
        return false;
      }
    },
    [refresh, flash],
  );

  const send = useCallback(
    async ({ text = "", attachment = null } = {}) => {
      const clean = String(text).trim();

      if ((!clean && !attachment) || !activeId) {
        return false;
      }

      try {
        const message = await sendMessage(activeId, {
          text: clean,
          attachment,
        });

        setMessages((previous) => {
          if (
            previous.some(
              (existing) => String(existing.id) === String(message.id),
            )
          ) {
            return previous;
          }

          return [...previous, message];
        });

        await refresh();
        return true;
      } catch (error) {
        flash(error.message || "Could not send the message.");
        return false;
      }
    },
    [activeId, refresh, flash],
  );

  const act = useCallback(
    async (key) => {
      if (!active) return;

      const id = activeId;

      switch (key) {
        case "star": {
          await patch(id, { starred: !activeMeta.starred });
          break;
        }
        case "mute": {
          const next = !activeMeta.muted;
          if (await patch(id, { muted: next })) {
            flash(next ? "Conversation muted." : "Conversation unmuted.");
          }
          break;
        }
        case "unread": {
          if (await patch(id, { unread: 1 })) {
            setParams({});
          }
          break;
        }
        case "archive": {
          const next = !activeMeta.archived;
          if (await patch(id, { archived: next })) {
            flash(next ? "Conversation archived." : "Conversation unarchived.");
            if (next) setParams({});
          }
          break;
        }
        case "block": {
          if (!activeMeta.blocked && !window.confirm(`Block ${active.name}?`))
            return;
          if (await patch(id, { blocked: !activeMeta.blocked })) {
            flash(activeMeta.blocked ? "Doctor unblocked." : "Doctor blocked.");
          }
          break;
        }
        case "report": {
          if (
            !window.confirm(
              `Report ${active.name} for inappropriate behaviour?`,
            )
          )
            return;
          if (await patch(id, { reported: true })) {
            flash("Reported. Thanks for letting us know.");
          }
          break;
        }
        case "delete": {
          if (
            !window.confirm("Delete this conversation? This cannot be undone.")
          )
            return;
          try {
            await deleteConversation(id);
            setParams({});
            await refresh();
            flash("Conversation deleted.");
          } catch (error) {
            flash(error.message || "Could not delete conversation.");
          }
          break;
        }
        default:
          break;
      }
    },
    [active, activeId, activeMeta, patch, refresh, setParams, flash],
  );

  return {
    loading,
    messagesLoading,
    visible,
    connections: conversations.map((c) => c.doctor), // 💡 👈 இது புதிதாக சேர்க்கப்பட்டுள்ளது!
    active,
    activeId,
    activeMeta,
    activePresence,
    presence,
    messages,
    query,
    setQuery,
    filter: isCommunity ? "community" : filter,
    setFilter: changeFilter,
    isCommunity,
    openCommunity,
    unreadCount,
    hasConnections: conversations.length > 0,
    select,
    send,
    act,
    notice,
    flash,
  };
}
