import { create } from "zustand";

type authState = {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
};

export const useAuthStore = create<authState>((set) => ({
  isLoggedIn: true,
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
}));
