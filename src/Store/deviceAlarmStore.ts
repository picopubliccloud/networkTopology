import { create } from "zustand";
import { DownDevice } from "../hooks/useAlarmData";

interface deviceAlarmStore {
  selectedDeviceAlarm: DownDevice | null;
  setSelectedDeviceAlarm: (data: DownDevice | null) => void;
}

export const useDeviceAlarmStore = create<deviceAlarmStore>((set) => ({
  selectedDeviceAlarm: null,
  setSelectedDeviceAlarm: (data) => set({ selectedDeviceAlarm: data }),
}));
