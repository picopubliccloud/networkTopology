// KeycloakProvider.tsx
import React, { createContext, useEffect, useState } from "react";
import Keycloak from "keycloak-js";
import useAuthStore from "../Store/useAuthStore";
import { setKeycloak as setKCHolder } from "../services/keycloak-holder";


interface KeycloakContextProps {
  keycloak: Keycloak | null;
  authenticated: boolean;
  initialized: boolean;
}

const KeycloakContext = createContext<KeycloakContextProps | undefined>(
  undefined
);

const KeycloakProvider = ({ children }: { children: React.ReactNode }) => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (
      !import.meta.env.VITE_KEYCLOAK_URL ||
      !import.meta.env.VITE_KEYCLOAK_REALM ||
      !import.meta.env.VITE_KEYCLOAK_CLIENT
    ) {
      console.error("❌ Keycloak env variables are missing");
      setInitialized(true);
      return;
    }

    const kc = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT,
    });

    kc.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri:
        window.location.origin + "/silent-check-sso.html",
      checkLoginIframe: false,
      pkceMethod: "S256",
    })
      .then((auth) => {
        console.log("✅ Keycloak initialized, authenticated:", auth);

        // Inject Keycloak instance into Axios
        // injectKeycloak(kc);
        setKCHolder(kc);

        // Store Keycloak instance and auth state
        setKeycloak(kc);
        setAuthenticated(auth);

        // Update Zustand store with user info if authenticated
        if (auth) {
          useAuthStore.getState().setUserFromKeycloak(kc);
        }

        // Set token expiry handler
        // kc.onTokenExpired = () => {
        //   console.log("🔔 Keycloak token expired, clearing auth");
        //   setAuthenticated(false);
        //   useAuthStore.getState().clearAuth();
        // };
        kc.onTokenExpired = async () => {
          try {
            await kc.updateToken(0);
          } catch {
            setAuthenticated(false);
            useAuthStore.getState().clearAuth();
          }
        };


        // Optional: periodic background token refresh (every 1 minute)
        const refreshInterval = setInterval(async () => {
          if (kc.token) {
            try {
              const refreshed = await kc.updateToken(30);
              if (refreshed) {
                console.log("🔄 Keycloak token refreshed in background");
              }
            } catch (err) {
              console.error("❌ Background token refresh failed", err);
            }
          }
        }, 60000);

        // Cleanup interval on unmount
        return () => clearInterval(refreshInterval);
      })
      .catch((err) => {
        console.error("❌ Keycloak init failed:", err);
      })
      .finally(() => {
        setInitialized(true);
      });
  }, []);

  return (
    <KeycloakContext.Provider
      value={{ keycloak, authenticated, initialized }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};

export { KeycloakProvider, KeycloakContext };
