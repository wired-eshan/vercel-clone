import { useState, useEffect } from "react";

type ApiFunction<T> = (data?: any) => Promise<T>;

interface UseApiOptions {
  auto?: boolean; // should call automatically on mount?
  params?: any; // request body
}

function useApi<T>(apiFunc: ApiFunction<T>, options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc(params);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-call on mount if enabled
  useEffect(() => {
    if (options.auto) {
      execute(options.params);
    }
  }, []);

  return { execute, data, error, loading };
}

export default useApi;
