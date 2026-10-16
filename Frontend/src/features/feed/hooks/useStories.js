
import { useCallback, useEffect, useState } from 'react';
import {
  fetchStories,
  fetchMyStories,
  createStory,
} from '../service/storyService.js';

export default function useStories() {
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (signal) => {
    setLoading(true);
    setError('');

    try {
      const [allStories, ownStories] = await Promise.all([
        fetchStories({ signal }),
        fetchMyStories({ signal }),
      ]);

      if (!signal?.aborted) {
        setStories(allStories);
        setMyStories(ownStories);
      }
    } catch (err) {
      if (err.name !== 'AbortError' && !signal?.aborted) {
        setError(err.message || 'Failed to load stories.');
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  const addStory = useCallback(async (image, caption = '') => {
    const created = await createStory({ image, caption });
    await refresh();
    return created;
  }, [refresh]);

  return {
    stories,
    myStories,
    loading,
    error,
    refresh: () => refresh(),
    addStory,
  };
}
