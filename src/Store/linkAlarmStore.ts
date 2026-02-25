import { create } from "zustand";
import { LinkDown } from "../hooks/useAlarmData";

interface linkAlarmStore {
  selectedLinkAlarm: LinkDown | null;
  setSelectedLinkAlarm: (data: LinkDown | null) => void;
}

export const useLinkAlarmStore = create<linkAlarmStore>((set) => ({
  selectedLinkAlarm: null,
  setSelectedLinkAlarm: (data) => set({ selectedLinkAlarm: data }),
}));
