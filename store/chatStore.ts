import { create } from "zustand";

interface ChatStore {
  isOpen: boolean;
  isFullScreen: boolean;
  input: string;
  pendingPrompt: string | null;

  setIsOpen: (isOpen: boolean) => void;
  setIsFullScreen: (isFullScreen: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setInput: (input: string) => void;
  openWithPrompt: (text: string, autoSend?: boolean) => void;
  clearPendingPrompt: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  isFullScreen: false,
  input: "",
  pendingPrompt: null,

  setIsOpen: (isOpen) => set({ isOpen }),
  setIsFullScreen: (isFullScreen) => set({ isFullScreen }),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false, isFullScreen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  setInput: (input) => set({ input }),

  openWithPrompt: (text: string, autoSend = false) => {
    set({
      isOpen: true,
      input: autoSend ? "" : text,
      pendingPrompt: autoSend ? text : null,
    });
  },

  clearPendingPrompt: () => set({ pendingPrompt: null }),
}));
