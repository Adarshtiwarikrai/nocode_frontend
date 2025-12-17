import { create } from 'zustand';
import { persist } from 'zustand/middleware';


const useChatStore = create()(
  persist(
    (set, get) => ({
     
      chats: [],
      sidebarCollapsed: false,
      activeChatId: -1,
      setChats: (chats) => set({ chats }),
      setActiveChatId: (chatId) => set({ activeChatId: chatId }),
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
      updateChat: (id, newChat) =>
        set((state) => {
          const chats = state.chats.map((chat) => {
            if (chat.id === id) {
           
              return { ...chat, ...newChat };
            }
            return chat;
          });
          return { chats };
        }),
      deleteChat: (id) =>
        set((state) => {
          return {
            chats: state.chats.filter((chat) => chat.id !== id),
          };
        }),
      getChatById: (id) => {
        return get().chats.find((chat) => chat.id === id);
      },
    }),
    {
      name: 'agentok-chats',
    }
  )
);

export default useChatStore;
