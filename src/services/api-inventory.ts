// apiInventory.ts
import axios from "axios";
import Keycloak from "keycloak-js";

let keycloak: Keycloak | null = null;

/**
 * Inject the Keycloak instance once after KeycloakProvider init.
 * Must be called only once after Keycloak.init() succeeds.
 */
export const setKeycloak = (kc: Keycloak) => {
  keycloak = kc;
};

const apiInventory = axios.create({
  baseURL: "https://192.168.30.120:8080/api",
  timeout: 10000,
});

// Request interceptor: attach Keycloak Bearer token
apiInventory.interceptors.request.use(
  async (config) => {
    if (keycloak?.token) {
      try {
        // Refresh token if it will expire in <30s
        const refreshed = await keycloak.updateToken(30);
        if (refreshed) {
          console.log("🔄 Keycloak token refreshed");
        }

        // Ensure headers object
        config.headers = axios.AxiosHeaders.from(config.headers);
        config.headers.set("Authorization", `Bearer ${keycloak.token}`);
      } catch (err) {
        console.error("❌ Keycloak token update failed", err);
        // Optional: logout user if token refresh fails
        // keycloak.logout({ redirectUri: window.location.origin });
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: optional logging / 401 handling
apiInventory.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "⚠️ Unauthorized request - token may be invalid or expired"
      );
      // Optional: force logout here
      // keycloak?.logout({ redirectUri: window.location.origin });
    }
    return Promise.reject(error);
  }
);

export default apiInventory;
