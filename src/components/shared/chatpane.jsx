import { useCallback, useEffect, useRef, useState } from 'react';
import { useChats } from '../../hooks/chat';
import { useUser } from '../../hooks/user';
import { useProjects } from '../../hooks/project';
import { useChat } from '../../hooks/chat';
import useUserStore from '../../store/user';
import { Icons } from '../ui/icons';
import { ChatInput } from '../ui/chatinput';
import { MessageList } from '../ui/messagelist';
import { useToast } from '../../hooks/toast';
import { Loading } from '../ui/loading';
import {ScrollArea} from '../ui/scrollarea'
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { genId } from '../../lib/id';
import { cn } from '../../lib/utils';
const BACKEND_URL = 'http://localhost:8000/v1';

const getAuthHeaders = () => {
  const user = useUserStore.getState().user;
  const token = user?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ChatPane = ({ projectId, chatId }) => {
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const { chat, isLoading: isLoadingChat, updateChat } = useChat(currentChatId);
  const { createChat, isCreating } = useChats();
  const { projects } = useProjects();
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isFirstRender = useRef(true);
  const messagesEndRef = useRef(null);
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [toolFile, setToolFile] = useState(null);

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('title', file.name);
      const resp = await fetch(`${BACKEND_URL}/knowledge/uploads`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
        body: form,
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Upload failed');
      }
      const json = await resp.json();
      setUploadedDocs((docs) => [{ id: json.id, title: json.title }, ...docs]);
      toast({ title: 'Uploaded', description: `${file.name} is ready for RAG` });
      e.target.value = '';
    } catch (err) {
      toast({ 
        title: 'Upload error', 
        description: err instanceof Error ? err.message : 'Failed', 
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const handleToolFileChange = useCallback((e) => {
    const file = e.target.files?.[0] || null;
    setToolFile(file);
  }, []);

  // ✅ Fetch chat messages
  const fetchMessages = useCallback(async () => {
    if (chatId === -1 || !chat) return;
    
    setIsLoadingMessages(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/chats/${chatId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (!resp.ok) {
        if (resp.status === 404) {
          console.warn(`Chat ${chatId} not found`);
          return;
        }
        throw new Error('Failed to fetch messages');
      }
      
      const json = await resp.json();
      setMessages(json || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [chatId, chat]);

  // ✅ Fetch messages when chat changes
  useEffect(() => {
    setCurrentChatId(chatId);
    
    if (chatId === -1 || !chat) {
      setMessages([]);
      return;
    }

    fetchMessages();
  }, [chatId, chat, fetchMessages]);

  // ✅ Scroll behavior
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      messagesEndRef.current?.scrollIntoView();
      isFirstRender.current = false;
    } else {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // ✅ Send message with async/await (NO POLLING)
  const handleSend = useCallback(
    async (message) => {
      const trimmedMessage = message.trim();
      
      if (!trimmedMessage || trimmedMessage.length === 0) {
        console.warn('⚠️ Empty message blocked in ChatPane');
        toast({
          title: 'Invalid message',
          description: 'Message cannot be empty',
          variant: 'destructive',
        });
        return;
      }

      if (!chat) {
        console.error('❌ No chat available');
        return;
      }

      const tempMessage = {
        id: genId(),
        chat_id: chatId,
        type: 'user',
        sender: user?.email,
        content: trimmedMessage,
        created_at: new Date().toISOString(),
        user: {
          email: user?.email,
          avatar_url: user?.avatar_url || null,
        },
      };

      try {
        // Set sending state
        setIsSending(true);

        // Optimistic UI update
        setMessages((msgs) => [...msgs, tempMessage]);

        const chatStatus = chat?.status?.toLowerCase() || 'idle';
        let endpoint;

        if (chatStatus === 'running') {
          toast({
            title: 'Agent is running',
            description: 'Please wait until the agent completes.',
          });
          setMessages((msgs) => msgs.filter((m) => m.id !== tempMessage.id));
          return;
        } else if (chatStatus === 'wait_for_human_input' || chatStatus === 'waiting') {
          endpoint = `${BACKEND_URL}/chats/${chatId}/input`;
        } else {
          endpoint = `${BACKEND_URL}/chats/${chatId}/messages`;
        }

        // Upload tool attachment first (optional)
        let attachmentMeta = undefined;
        if (toolFile) {
          const form = new FormData();
          form.append('file', toolFile);
          form.append('title', toolFile.name);
          const up = await fetch(`${BACKEND_URL}/tools/attachments`, {
            method: 'POST',
            headers: { ...getAuthHeaders() },
            body: form,
          });
          if (!up.ok) {
            const t = await up.text();
            throw new Error(t || 'Attachment upload failed');
          }
          attachmentMeta = await up.json();
          setToolFile(null); // Clear after upload
        }

        const payload = {
          type: 'user',
          content: trimmedMessage,
          sender: user?.email || 'unknown',
          user_id: user?.id,
          meta: attachmentMeta ? {
            attachment_path: attachmentMeta.path,
            attachment_name: attachmentMeta.filename,
            attachment_mime: attachmentMeta.mime,
          } : undefined,
        };

        // ✅ Send message and WAIT for complete response
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const errText = await resp.text();
          console.error('❌ Backend error:', resp.status, errText);
          throw new Error(errText);
        }

        const responseData = await resp.json();
        
        if (responseData && responseData.error) {
          throw new Error(responseData.error);
        }

        // ✅ After response, fetch updated messages
        await fetchMessages();

        toast({
          title: 'Message sent',
          description: 'Response received successfully',
        });

      } catch (err) {
        console.error('Failed to send message:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to send message',
          variant: 'destructive',
        });
        // Remove optimistic message on error
        setMessages((msgs) => msgs.filter((m) => m.id !== tempMessage.id));
        await fetchMessages();
      } finally {
        setIsSending(false);
      }
    },
    [chatId, chat, user, toast, fetchMessages, toolFile]
  );

  // ✅ Start a new chat
  const handleStartChat = useCallback(async () => {
    try {
      const newChat = await createChat(projectId, 'project');
      setCurrentChatId(newChat.id);
    } catch (err) {
      console.error('Failed to start chat:', err);
      toast({
        title: 'Error',
        description: 'Failed to start new chat',
        variant: 'destructive',
      });
    }
  }, [projectId, createChat, toast]);

  const handleReset = useCallback(() => setMessages([]), []);

  // ✅ Abort chat
  const handleAbort = useCallback(async () => {
    try {
      console.log('🛑 Aborting chat...');
      
      // Update UI immediately
      if (updateChat) {
        updateChat({ status: 'aborted' });
      }
      
      // Call abort endpoint
      const resp = await fetch(`${BACKEND_URL}/chats/${chatId}/abort`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      
      const result = await resp.json();
      
      if (resp.ok) {
        if (updateChat) {
          updateChat({ status: 'aborted' });
        }
        
        toast({
          title: 'Agent Stopped',
          description: result.detail || 'Agent successfully terminated',
        });
        
        // Refresh messages
        await fetchMessages();
      } else {
        throw new Error(result.error || 'Failed to abort chat');
      }
    } catch (err) {
      console.error('❌ Failed to abort chat:', err);
      
      if (updateChat) {
        updateChat({ status: 'aborted' });
      }
      
      toast({
        title: 'Agent Stop Requested',
        description: err instanceof Error ? err.message : 'Force stop command sent',
        variant: 'destructive',
      });
    }
  }, [chatId, updateChat, toast, fetchMessages]);

  // 🟡 Empty state
  if (!chat && !isLoadingChat) {
    return (
      <div className="flex flex-col w-full h-full bg-muted items-center justify-center gap-2 text-muted-foreground/50">
        <Icons.agent className="w-8 h-8" />
        <p>Let's start chatting!</p>
        <Button onClick={handleStartChat} disabled={isCreating}>
          {isCreating && <Icons.spinner className="w-4 h-4 animate-spin mr-2" />}
          Start Chat
        </Button>
      </div>
    );
  }

  const sampleMessages = chat?.sample_messages || [];

  return (
    <div className="flex flex-col w-full h-full bg-muted">
      {isLoadingMessages ? (
        <div className="flex justify-center items-center flex-1">
          <Loading />
        </div>
      ) : messages.length > 0 ? (
        <ScrollArea className="flex flex-col max-w-full w-full flex-1 p-2 pb-1 [&_[data-radix-scroll-area-viewport]>div]:!max-w-full">
          <div className="flex flex-col w-full gap-1 max-w-full">
            <MessageList
              chat={chat}
              messages={messages}
              className="max-w-4xl mx-auto"
            />
            <div className="flex justify-center gap-2 p-1 items-center">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  chat?.status === 'running' && "bg-yellow-500/20 text-yellow-600 border-yellow-500/50",
                  chat?.status === 'completed' && "bg-green-500/20 text-green-600 border-green-500/50",
                  chat?.status === 'aborted' && "bg-red-500/20 text-red-600 border-red-500/50",
                  chat?.status === 'failed' && "bg-red-500/20 text-red-600 border-red-500/50"
                )}
              >
                {chat?.status || 'idle'}
              </Badge>
              
              

              {/* Abort Button */}
              {(chat?.status === 'running' || chat?.status === 'wait_for_human_input') && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleAbort}
                  className="text-xs h-6 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500 font-semibold"
                >
                  <Icons.stop className="w-3 h-3 mr-1" />
                  Stop Agent
                </Button>
              )}

              {/* Sending indicator */}
              {isSending && (
                <Badge variant="outline" className="text-xs">
                  <Icons.spinner className="w-3 h-3 mr-1 animate-spin" />
                  Sending...
                </Badge>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/50">
          <Icons.agent className="w-8 h-8" />
          <p>No messages yet. Start chatting below!</p>
        </div>
      )}

      <div className="relative flex flex-col gap-1 w-full max-w-4xl mx-auto p-2 pt-0">
        <ChatInput
          chatId={chatId}
          onSend={handleSend}
          onReset={handleReset}
          disabled={currentChatId === -1 || !chat || isSending}
          className="w-full"
          sampleMessages={sampleMessages}
        />
      </div>
    </div>
  );
};