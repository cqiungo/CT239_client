// store/roomStore.ts
import { create } from "zustand";
interface RoomState {
  roomId: string | null;
  player: string | null;
  setRoomInfo: (roomId: string, player: string) => void;
}
export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  player: null,
  setRoomInfo: (roomId: string, player: string) => set({ roomId, player }),
}));
