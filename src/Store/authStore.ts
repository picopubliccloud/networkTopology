import { create } from "zustand";

export interface User {
  username: string;
  role: string;
  date_joined: string;
  email: string;
  first_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string | null;  
  last_name: string;
}

interface AuthState {
  user: User | null;
  access: string | null;
  refresh: string | null;
  setAuth: (user: User, access: string, refresh: string) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => {
  // Retrieve the user, accessToken, and refreshToken from localStorage
  const storedUser = localStorage.getItem("user");
  const storedAccess = localStorage.getItem("access");
  const storedRefresh = localStorage.getItem("refresh");

  let user: User | null = null;

  // Safely parse user from localStorage (if it exists)
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (err) {
      console.error("Error parsing user data from localStorage", err);
      user = null; // If parsing fails, reset to null
    }
  }

  return {
    user: user,
    access: storedAccess,
    refresh: storedRefresh,

    setAuth: (user, access, refresh) => {
      // Store values in localStorage and update state
      try {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
      } catch (err) {
        console.error("Error storing data in localStorage", err);
      }
      set({ user, access, refresh });
    },

    clearAuth: () => {
      // Remove values from localStorage and reset state
      try {
        localStorage.removeItem("user");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      } catch (err) {
        console.error("Error clearing data from localStorage", err);
      }
      set({ user: null, access: null, refresh: null });
    },
  };
});

export default useAuthStore;
