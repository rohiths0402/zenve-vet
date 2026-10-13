import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [notice, setNotice] = useState("");
  const timer = useRef(null);
  const activeId = params.get("to");

  const flash = useCallback((text) => {
    setNotice(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(""), 3500);
  }, []);

  const refresh = useCallback(async () => {
    setConversations(await getConversations());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    return () => clearTimeout(timer.current);
  }, [refresh]);

  useEffect(() => {
    const load = () => {
      setPresence((prev) => {
        const next = getPresence();
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    };

    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    getMessages(activeId).then(setMessages);
    setThreadMeta(activeId, { unread: 0 }).then(refresh);
  }, [activeId, refresh]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return conversations.filter(({ doctor, last, meta }) => {
      if (filter === "archived" && !meta.archived) return false;
      if (filter !== "archived" && filter !== "connections" && meta.archived)
        return false;
      if (filter === "all" && !last && doctor.id !== activeId) return false;
      if (filter === "unread" && meta.unread === 0) return false;
      if (filter === "starred" && !meta.starred) return false;
      if (!q) return true;

      const haystack =
        `${doctor.name} ${doctor.specialty} ${last ? last.text : ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [conversations, filter, query, activeId]);

  const unreadCount = useMemo(
    () =>
      conversations.filter((c) => c.meta.unread > 0 && !c.meta.archived).length,
    [conversations],
  );

  const found = conversations.find((c) => c.doctor.id === activeId);
  const active = found ? found.doctor : null;
  const activeMeta = found ? found.meta : DEFAULT_META;
  const activePresence = presence[activeId] || {};

  const select = (id) => setParams({ to: id });

  const patch = async (id, changes) => {
    await setThreadMeta(id, changes);
    await refresh();
  };

  const send = async ({ text, attachment }) => {
    const clean = text.trim();
    if ((!clean && !attachment) || !activeId) return false;

    try {
      const message = await sendMessage(activeId, { text: clean, attachment });
      setMessages((prev) => [...prev, message]);
      refresh();
      return true;
    } catch {
      flash("Could not send. Storage is full, try a smaller file.");
      return false;
    }
  };

  const act = async (key) => {
    if (!active) return;
    const id = activeId;

    switch (key) {
      case "star":
        await patch(id, { starred: !activeMeta.starred });
        break;
      case "mute":
        await patch(id, { muted: !activeMeta.muted });
        flash(
          activeMeta.muted ? "Conversation unmuted." : "Conversation muted.",
        );
        break;
      case "unread":
        await patch(id, { unread: 1 });
        setParams({});
        break;
      case "archive": {
        const next = !activeMeta.archived;
        await patch(id, { archived: next });
        flash(next ? "Conversation archived." : "Conversation unarchived.");
        if (next) setParams({});
        break;
      }
      case "block":
        if (!activeMeta.blocked && !window.confirm(`Block ${active.name}?`))
          return;
        await patch(id, { blocked: !activeMeta.blocked });
        flash(activeMeta.blocked ? "Doctor unblocked." : "Doctor blocked.");
        break;
      case "report":
        if (
          !window.confirm(`Report ${active.name} for inappropriate behaviour?`)
        )
          return;
        await patch(id, { reported: true });
        flash("Reported. Thanks for letting us know.");
        break;
      case "delete":
        if (!window.confirm("Delete this conversation? This cannot be undone."))
          return;
        await deleteConversation(id);
        setParams({});
        await refresh();
        flash("Conversation deleted.");
        break;
      default:
        break;
    }
  };

  return {
    loading,
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
