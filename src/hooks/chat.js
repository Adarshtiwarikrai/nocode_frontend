import useSWR from 'swr';
import useChatStore from '../store/chat';
import useUserStore from '../store/user';
import useProjectState from '../store/project';
import { useEffect, useState, useRef, useCallback } from 'react';
import { isEqual } from 'lodash-es';

const backendUrl = 'http://localhost:8000/v1';

const getAuthHeaders = () => {
  const user = useUserStore.getState().user;
  const token = user?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const authenticatedFetcher = async (url) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

export function useChats() {
  const { data, error, mutate } = useSWR(
    `${backendUrl}/chats`,
    authenticatedFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  const chats = useChatStore((state) => state.chats);
  const setChats = useChatStore((state) => state.setChats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);
  const deleteChat = useChatStore((state) => state.deleteChat);

  const projects = useProjectState((state) => state.projects);

  const prevDataRef = useRef(data);

  useEffect(() => {
    if (data && !isEqual(data, prevDataRef.current)) {
      setChats(data);
      prevDataRef.current = data;
    }
  }, [data, setChats]);

  const getInitialName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return `Chat for ${project?.name || ''}`;
  };

  /* -------------------- Create Chat -------------------- */
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateChat = useCallback(
    async (projectId) => {
      setIsCreating(true);
      try {
        const user = useUserStore.getState().user;
        if (!user) throw new Error('User not authenticated');

        const body = {
          name: getInitialName(projectId),
          from_type: 'project',
          from_project: projectId,
          user_id: user.id,
        };

        const response = await fetch(`${backendUrl}/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const newChat = await response.json();
        setChats([newChat, ...chats]);
        await mutate();
        return newChat;
      } finally {
        setIsCreating(false);
      }
    },
    [projects, chats, setChats, mutate]
  );

  /* -------------------- Delete Chat -------------------- */
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteChat = useCallback(
    async (id) => {
      setIsDeleting(true);
      const previousChats = [...chats];
      deleteChat(id);

      try {
        const response = await fetch(`${backendUrl}/chats/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        await mutate();
      } catch (err) {
        console.error('Failed to delete chat:', err);
        setChats(previousChats);
        await mutate();
      } finally {
        setIsDeleting(false);
      }
    },
    [chats, deleteChat, setChats, mutate]
  );

  /* -------------------- Update Chat -------------------- */
  const [isUpdating, setIsUpdating] = useState(false);

  const updateChat = useCallback(
    async (id, chatUpdate) => {
      setIsUpdating(true);
      const previousChat = chats.find((c) => c.id === id);
      if (!previousChat) return;

      setChats(
        chats.map((c) => (c.id === id ? { ...c, ...chatUpdate } : c))
      );

      try {
        if (chatUpdate.status || chatUpdate.content) {
          const user = useUserStore.getState().user;

          const payload = {
            type: chatUpdate.type ?? 'user',
            content: chatUpdate.content ?? '',
            sender: user?.email,
            user_id: user?.id,
          };

          const response = await fetch(
            `${backendUrl}/chats/${id}/messages`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) throw new Error(await response.text());

          const updatedChat = await response.json();
          setChats(
            chats.map((c) =>
              c.id === id ? { ...c, ...updatedChat } : c
            )
          );
        }

        await mutate();
      } catch (err) {
        console.error('Failed to update chat:', err);
        setChats(
          chats.map((c) => (c.id === id ? previousChat : c))
        );
        await mutate();
      } finally {
        setIsUpdating(false);
      }
    },
    [chats, setChats, mutate]
  );

  return {
    chats: data ?? [],
    activeChatId,
    setActiveChatId,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
    createChat: handleCreateChat,
    isCreating,
    updateChat,
    isUpdating,
    deleteChat: handleDeleteChat,
    isDeleting,
  };
}

/* -------------------- Single Chat Hook -------------------- */
export function useChat(chatId) {
  const { chats, updateChat, isUpdating, isLoading, isError } = useChats();
  const chat = chats.find((c) => c.id === chatId);

  return {
    chat,
    updateChat: (chatUpdate) =>
      updateChat(chatId, chatUpdate),
    isUpdating,
    isLoading,
    isError,
  };
}
