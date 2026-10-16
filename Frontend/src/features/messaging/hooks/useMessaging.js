
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import {
  DEFAULT_META,
  deleteConversation,
  getConversations,
  getMessages,
  getPresence,
  sendMessage,
  setThreadMeta,
} from "../services/messageService";

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
  const messageRequest = useRef(0);
  const activeId = params.get("to");

  const flash = useCallback((text) => {
    setNotice(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(""), 3500);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const rows = await getConversations();
      setConversations(rows);
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

    return () => {
      clearTimeout(timer.current);
    };
  }, [refresh]);

  // Presence is currently read from local storage.
  // This does not establish a WebSocket connection.
  useEffect(() => {
    const loadPresence = () => {
      setPresence((previous) => {
        const next = getPresence();

        return JSON.stringify(previous) === JSON.stringify(next)
          ? previous
          : next;
      });
    };

    loadPresence();

    const intervalId = setInterval(loadPresence, 2000);

    return () => clearInterval(intervalId);
  }, []);

  // Load messages whenever the selected conversation changes.
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
  }, [activeId, refresh, flash]);

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();

    return conversations.filter(({ doctor, last, meta }) => {
      if (filter === "archived" && !meta.archived) {
        return false;
      }

      if (
        filter !== "archived" &&
        filter !== "connections" &&
        meta.archived
      ) {
        return false;
      }

      if (
        filter === "all" &&
        !last &&
        String(doctor.id) !== String(activeId)
      ) {
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
          Number(conversation.meta.unread) > 0 &&
          !conversation.meta.archived
      ).length,
    [conversations]
  );

  // The URL's "to" parameter stores the conversation ID.
  const found = conversations.find(
    (conversation) => String(conversation.id) === String(activeId)
  );

  const active = found ? found.doctor : null;
  const activeMeta = found ? found.meta : DEFAULT_META;

  const activePresence = active
    ? presence[active.id] || presence[activeId] || {}
    : {};

  const select = useCallback(
    (id) => {
      const conversation = conversations.find(
        (item) =>
          String(item.id) === String(id) ||
          String(item.doctor.id) === String(id)
      );

      if (conversation) {
        setParams({ to: String(conversation.id) });
      }
    },
    [conversations, setParams]
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
    [refresh, flash]
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
              (existing) => String(existing.id) === String(message.id)
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
    [activeId, refresh, flash]
  );

  const act = useCallback(
    async (key) => {
      if (!active) return;

      const id = activeId;

      switch (key) {
        case "star": {
          await patch(id, {
            starred: !activeMeta.starred,
          });
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
            flash(
              next
                ? "Conversation archived."
                : "Conversation unarchived."
            );

            if (next) setParams({});
          }
          break;
        }

        case "block": {
          if (
            !activeMeta.blocked &&
            !window.confirm(`Block ${active.name}?`)
          ) {
            return;
          }

          if (
            await patch(id, {
              blocked: !activeMeta.blocked,
            })
          ) {
            flash(
              activeMeta.blocked
                ? "Doctor unblocked."
                : "Doctor blocked."
            );
          }
          break;
        }

        case "report": {
          if (
            !window.confirm(
              `Report ${active.name} for inappropriate behaviour?`
            )
          ) {
            return;
          }

          if (await patch(id, { reported: true })) {
            flash("Reported. Thanks for letting us know.");
          }
          break;
        }

        case "delete": {
          if (
            !window.confirm(
              "Delete this conversation? This cannot be undone."
            )
          ) {
            return;
          }

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
    [active, activeId, activeMeta, patch, refresh, setParams, flash]
  );

  return {
    loading,
    messagesLoading,
    visible,
    active,
    activeId,
    activeMeta,
    activePresence,
    presence,
    messages,
    query,
    setQuery,
    filter,
    setFilter,
    unreadCount,
    hasConnections: conversations.length > 0,
    select,
    send,
    act,
    notice,
    flash,
  };
}
