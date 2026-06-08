import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../api/categoriesApi';

export function useCategories(params = {}) {
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await categoriesApi.list(params);
      setCategories(response.data || []);
      setMeta(response.meta || {});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load categories');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, meta, isLoading, reload: load, setCategories };
}
