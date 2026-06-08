import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { tasksApi } from '../api/tasksApi';

export function useTasks(params = {}) {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await tasksApi.list(params);
      setTasks(response.data || []);
      setMeta(response.meta || {});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    load();
  }, [load]);

  return { tasks, meta, isLoading, reload: load, setTasks };
}
