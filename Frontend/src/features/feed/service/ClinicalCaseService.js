
import { useCallback, useEffect, useState } from "react";
import {
  fetchClinicalCases,
  createClinicalCase as submitClinicalCase,
  likeFeedPost,
  unlikeFeedPost,
} from "../service/feedService.js";

export default function useClinicalCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchClinicalCases({ signal });

      if (!signal?.aborted) {
        setCases(data);
      }

      return data;
    } catch (err) {
      if (err.name !== "AbortError" && !signal?.aborted) {
        setError(err.message || "Failed to load clinical cases.");
      }

      return null;
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    refresh(controller.signal);

    return () => controller.abort();
  }, [refresh]);

  const createCase = useCallback(
    async (payload) => {
      setSubmitting(true);
      setError("");

      try {
        const created = await submitClinicalCase(payload);

        // Display the newly created case without waiting for another visit.
        setCases((previous) => [
          created,
          ...previous.filter((item) => item.id !== created.id),
        ]);

        return created;
      } catch (err) {
        setError(err.message || "Failed to publish clinical case.");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const toggleLike = useCallback(async (post) => {
    const wasLiked = Boolean(post.is_liked);

    // Optimistic UI update; roll back if the API request fails.
    setCases((previous) =>
      previous.map((item) =>
        item.id === post.id
          ? {
              ...item,
              is_liked: !wasLiked,
              likes_count: Math.max(
                0,
                (Number(item.likes_count) || 0) + (wasLiked ? -1 : 1)
              ),
            }
          : item
      )
    );

    try {
      if (wasLiked) {
        await unlikeFeedPost(post.id);
      } else {
        await likeFeedPost(post.id);
      }
    } catch (err) {
      setCases((previous) =>
        previous.map((item) =>
          item.id === post.id
            ? {
                ...item,
                is_liked: wasLiked,
                likes_count: Math.max(
                  0,
                  (Number(item.likes_count) || 0) + (wasLiked ? 1 : -1)
                ),
              }
            : item
        )
      );

      throw err;
    }
  }, []);

  return {
    cases,
    loading,
    submitting,
    error,
    refresh,
    createCase,
    toggleLike,
  };
}
