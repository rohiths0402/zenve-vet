
import { useCallback, useEffect, useState } from "react";
import { fetchFeedPosts } from "../service/feedService.js";

export default function useFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeed = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchFeedPosts({ signal });

      if (!signal?.aborted) {
        setPosts(data);
      }
    } catch (err) {
      if (err.name !== "AbortError" && !signal?.aborted) {
        setError(err.message || "Failed to load feed posts.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadFeed(controller.signal);

    return () => controller.abort();
  }, [loadFeed]);

  const refresh = useCallback(() => {
    return loadFeed();
  }, [loadFeed]);

  return {
    posts,
    loading,
    error,
    refresh,
  };
}
