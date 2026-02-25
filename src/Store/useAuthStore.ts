import { create } from "zustand";

export interface User {
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    roles: string[];
}

interface AuthState {
    user: User | null;
    authenticated: boolean;

    setUserFromKeycloak: (kc: any) => void;
    clearAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    authenticated: false,

    setUserFromKeycloak: (kc) => {
        if (!kc?.tokenParsed) return;

        const token = kc.tokenParsed as any;

        const user: User = {
            username: token.preferred_username,
            email: token.email,
            first_name: token.given_name,
            last_name: token.family_name,
            roles: [
                ...(token.realm_access?.roles || []),
                ...(token.resource_access?.["client-web"]?.roles || []),
            ],
        };

        set({
            user,
            authenticated: true,
        });
    },

    clearAuth: () => {
        set({
            user: null,
            authenticated: false,
        });
    },
}));

export default useAuthStore;
