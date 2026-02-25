import { useEffect, useState } from "react";
import { CanceledError } from "axios";
import apiClient from "../services/api-client";
import useKeycloak from "./useKeycloak";

interface FetchResponse<T> {
  count: number;
  results: T[];
}

const useInventory = <T>(endpoint: string, deps: any[] = []) => {
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

export default useInventory;

// import { useCallback, useEffect, useState } from "react";
// import axios, { AxiosError } from "axios";
// import { InventoryModel } from "../models/InventoryModel";
// import useKeycloak from "../hooks/useKeycloak";

// const API_BASE = "https://192.168.30.120:8080/api";

// // Response data type:
// interface Response<T> {
//   count: number;
//   results: T[];
// }

// export function useInventory(page: number, limit: number) {
//   const [inventory, setInventory] = useState<InventoryModel[]>([]);
//   const [inventoryCount, setInventoryCount] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const { keycloak, authenticated } = useKeycloak();

//   /**
//    * Ensure token is valid (refresh if needed)
//    */
//   const ensureValidToken = async () => {
//     if (!keycloak) throw new Error("Keycloak not initialized");

//     await keycloak.updateToken(30);
//     return keycloak.token;
//   };

//   /**
//    * Fetch Inventory List
//    */
//   const fetchInventory = useCallback(async () => {
//     if (!authenticated || !keycloak) return;

//     const controller = new AbortController();
//     setLoading(true);

//     try {
//       const token = await ensureValidToken();

//       const response = await axios.get<Response<InventoryModel>>(
//         `${API_BASE}/inventory`,
//         {
//           signal: controller.signal,
//           params: { page, limit },
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setInventory(response.data.results);
//       setError(null);
//     } catch (err) {
//       if (axios.isCancel(err)) return;

//       const error = err as AxiosError;

//       if (error.response?.status === 401) {
//         console.error("Unauthorized – logging out");
//         keycloak.logout();
//         return;
//       }

//       setError(error.message || "Failed to load inventory");
//     } finally {
//       setLoading(false);
//     }

//     return () => controller.abort();
//   }, [page, limit, authenticated, keycloak]);

//   const fetchInventoryCount = useCallback(async () => {
//     if (!authenticated || !keycloak) return;

//     const controller = new AbortController();

//     try {
//       const token = await ensureValidToken();

//       const response = await axios.get<{ total: number }>(
//         `${API_BASE}/inventory_count`,
//         {
//           signal: controller.signal,
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setInventoryCount(response.data.total);
//     } catch (err) {
//       if (axios.isCancel(err)) return;

//       const error = err as AxiosError;

//       if (error.response?.status === 401) {
//         keycloak.logout();
//         return;
//       }

//       setError(error.message || "Failed to get inventory count");
//     }

//     return () => controller.abort();
//   }, [authenticated, keycloak]);

//   useEffect(() => {
//     fetchInventory();
//   }, [fetchInventory]);

//   useEffect(() => {
//     fetchInventoryCount();
//   }, [fetchInventoryCount]);

//   const refetch = useCallback(async () => {
//     setError(null);
//     setLoading(true);

//     await Promise.all([fetchInventory(), fetchInventoryCount()]);

//     setLoading(false);
//   }, [fetchInventory, fetchInventoryCount]);

//   return {
//     loading,
//     inventory,
//     inventoryCount,
//     error,
//     refetch,
//   };
// }
