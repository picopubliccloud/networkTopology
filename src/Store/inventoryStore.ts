import { create } from "zustand";
import { InventoryModel } from "../models/InventoryModel";

interface InventoryStore {
  editingRecord: InventoryModel | null;
  setEditingRecord: (data: InventoryModel | null) => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  editingRecord: null,
  setEditingRecord: (data) => set({ editingRecord: data }),
}));
