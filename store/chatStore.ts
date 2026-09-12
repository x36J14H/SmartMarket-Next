import { create } from "zustand";

export type ChatMode = 'ai' | 'operator';

interface ChatStore {
  isOpen: boolean;
  isFullScreen: boolean;
  input: string;
  pendingPrompt: string | null;
  mode: ChatMode;
  chatId: string | null;
  unreadOperatorCount: number;

  setIsOpen: (isOpen: boolean) => void;
  setIsFullScreen: (isFullScreen: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setInput: (input: string) => void;
  openWithPrompt: (text: string, autoSend?: boolean) => void;
  clearPendingPrompt: () => void;
  setMode: (mode: ChatMode) => void;
  setChatId: (chatId: string | null) => void;
  setUnreadOperatorCount: (count: number) => void;
  incrementUnread: () => void;
  clearUnread: () => void;
  openOperatorChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  isFullScreen: false,
  input: "",
  pendingPrompt: null,
  mode: 'ai',
  chatId: null,
  unreadOperatorCount: 0,

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
      mode: 'ai',
    });
  },

  clearPendingPrompt: () => set({ pendingPrompt: null }),

  setMode: (mode) => set({ mode }),
  setChatId: (chatId) => set({ chatId }),
  setUnreadOperatorCount: (unreadOperatorCount) => set({ unreadOperatorCount }),
  incrementUnread: () => set((state) => ({ unreadOperatorCount: state.unreadOperatorCount + 1 })),
  clearUnread: () => set({ unreadOperatorCount: 0 }),

  openOperatorChat: () => set({ isOpen: true, mode: 'operator', unreadOperatorCount: 0 }),
}));
