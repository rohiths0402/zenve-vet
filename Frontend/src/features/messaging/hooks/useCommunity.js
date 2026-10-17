import { useCallback, useEffect, useState } from "react";

import {
  COMMUNITY_STORAGE_KEY,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  sendCommunityMessage,
} from "../services/communityService";

export default function useCommunity(onError) {
  const [info, setInfo] = useState(getCommunity);

  const reload = useCallback(() => {
    setInfo(getCommunity());
  }, []);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === null || event.key === COMMUNITY_STORAGE_KEY) {
        reload();
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [reload]);

  const run = useCallback(
    (action) => {
      try {
        action();
        reload();
        return true;
      } catch (error) {
        onError(error.message);
        return false;
      }
    },
    [reload, onError],
  );

  const join = useCallback(() => run(joinCommunity), [run]);

  const leave = useCallback(() => run(leaveCommunity), [run]);

  const send = useCallback(
    async ({ text = "", attachment = null } = {}) => {
      if (attachment) {
        onError("Attachments are not available in the community yet.");
        return false;
      }

      return run(() => sendCommunityMessage(text));
    },
    [run, onError],
  );

  return { info, join, leave, send };
}
