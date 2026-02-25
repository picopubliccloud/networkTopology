import { useEffect, useState } from "react";
import { CanceledError } from "axios";
import apiClient from "../services/api-client";
import useKeycloak from "./useKeycloak";

interface FetchResponse<T> {
  count: number;
  results: T[];
}

const useData = <T>(endpoint: string, deps: any[] = []) => {
  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { keycloak, authenticated } = useKeycloak();

  useEffect(() => {
    if (!authenticated || !keycloak) return;

    const controller = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Refresh Keycloak token if it will expire in <30s
        const refreshed = await keycloak.updateToken(30);
        if (refreshed) console.log("🔄 Keycloak token refreshed");

        const response = await apiClient.get<FetchResponse<T>>(endpoint, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
          signal: controller.signal,
        });

        if (!isMounted) return;

        setData(response.data.results);
        setCount(response.data.count);
        setError("");
      } catch (err: any) {
        if (!isMounted) return;

        if (err instanceof CanceledError) return;

        if (err.response?.status === 401) {
          console.error("⚠️ Unauthorized – redirecting to Keycloak login");
          keycloak.logout();
          return;
        }

        console.error("API Error:", err);
        setError(err.message || "Failed to fetch data");
        setData([]);
        setCount(0);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [endpoint, authenticated, keycloak, ...deps]);

  return { data, count, error, isLoading };
};

export default useData;
