import { useRef, useState, useCallback } from 'react';
import { Icons } from './icons';
import { Button } from './button';
import { Textarea } from './textarea';
import { cn } from '../../lib/utils';
import { useChat } from '../../hooks/chat';
import { toast } from '../../hooks/toast';
import useUserStore from '../../store/user';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

const BACKEND_URL = 'http://localhost:8000/v1';

// ✅ Dynamic auth headers
const getAuthHeaders = () => {
  const user = useUserStore.getState().user;
  const token = user?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ChatInput = ({
  chatId,
  onSend,
  onReset,
  loading,
  disabled,
  sampleMessages,
  className,
}) => {
  const { chat, isLoading, updateChat, isUpdating } = useChat(chatId);
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // ✅ Enhanced handleSend with strict validation
  const handleSend = useCallback(async (input) => {
    const messageToSend = input || message;
    
    // ✅ CRITICAL: Strict validation - trim and check for actual content
    const trimmedMessage = messageToSend.trim();
    
    if (!trimmedMessage || trimmedMessage.length === 0) {
      console.warn('⚠️ Empty message blocked in ChatInput');
      return;
    }

    // ✅ Prevent double sends
    if (isSending) {
      console.warn('⚠️ Already sending a message');
      return;
    }

    setIsSending(true);
    try {
      // Clear input immediately
      setMessage('');
      
      // ✅ Delegate to parent's onSend with validated, trimmed message
      await onSend(trimmedMessage);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Restore message on error
      setMessage(messageToSend);
    } finally {
      setIsSending(false);
    }
  }, [chatId, message, onSend, isSending]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [chatId, handleSend]);

  const handleClean = useCallback(async () => {
    setIsCleaning(true);
    try {
      const response = await fetch(`${BACKEND_URL}/chats/${chatId}/messages`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clean messages');
      }

      onReset?.();
      toast({
        title: 'Success',
        description: 'Chat messages cleared',
      });
    } catch (e) {
      console.error('Failed to clean chat:', e);
      toast({
        title: 'Error',
        description: 'Failed to clean chat messages',
        variant: 'destructive',
      });
    } finally {
      setIsCleaning(false);
    }
  }, [chatId, onReset]);

  const handleAbort = useCallback(async () => {
    try {
      console.log('🛑 Abort button clicked - forcefully stopping agent...');
      
      // ✅ CRITICAL: Immediately update UI to show aborting state
      updateChat({ status: 'aborted' });
      
      const resp = await fetch(`${BACKEND_URL}/chats/${chatId}/abort`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      
      const result = await resp.json();
      
      if (!resp.ok) {
        throw new Error(result.error || 'Failed to abort chat');
      }

      // ✅ Force update chat status to aborted
      updateChat({ status: 'aborted' });
      
      toast({
        title: 'Agent Stopped',
        description: result.detail || 'Agent forcefully terminated',
      });
      
      console.log('✅ Agent aborted successfully:', result);
    } catch (err) {
      console.error('❌ Failed to abort chat:', err);
      
      // Still update status to aborted even if request failed
      updateChat({ status: 'aborted' });
      
      toast({
        title: 'Agent Stop Requested',
        description: err instanceof Error ? err.message : 'Force stop command sent',
      });
    }
  }, [chatId, updateChat]);

  const handleReset = useCallback(async () => {
    try {
      setIsResetting(true);
      await handleAbort();
      await handleClean();
      updateChat({ status: 'ready' });
    } catch (e) {
      console.error('Failed to reset chat:', e);
      toast({
        title: 'Error',
        description: 'Failed to reset chat',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  }, [chatId, handleAbort, handleClean, updateChat]);

  // ✅ Quick actions with validation
  const handleQuickAction = useCallback(async (action) => {
    // ✅ These special actions are allowed even if they look "empty"
    // '\n' for enter and 'exit' are valid commands
    if (action === '\n' || action === 'exit') {
      onSend(action);
      return;
    }
    
    // For other actions, validate normally
    const trimmedAction = action.trim();
    if (!trimmedAction) {
      console.warn('⚠️ Empty quick action blocked');
      return;
    }
    
    onSend(trimmedAction);
  }, [chatId, onSend]);

  // ✅ Compute disabled state for send button
  const isSendDisabled = disabled || isResetting || isSending || !message.trim();
  
  return (
    <div
      className={cn('relative flex items-end gap-2 w-full mx-auto', className)}
    >
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled 
            ? 'Chat unavailable' 
            : chat?.status === 'running'
            ? 'Agent is running...'
            : chat?.status === 'wait_for_human_input'
            ? 'Agent is waiting for your input...'
            : 'Enter message to start chat ...'
        }
        className={cn(
          'min-h-[80px] w-full resize-none border border-primary/20 rounded-xl shadow-xl bg-primary-foreground',
          disabled && 'bg-muted cursor-not-allowed',
          sampleMessages?.length && 'pt-10 min-h-[100px]'
        )}
        disabled={disabled || isSending}
      />
      
      {/* Sample Messages */}
      {sampleMessages && sampleMessages.length > 0 && (
        <div className="absolute top-1 left-2 flex gap-1 right-2">
          {sampleMessages.slice(0, 3).map((sampleMsg, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSend(sampleMsg)}
              disabled={disabled || isSending}
              className="h-6 text-xs text-muted-foreground line-clamp-1 flex items-center justify-start hover:bg-primary/10"
            >
              {sampleMsg}
            </Button>
          ))}
        </div>
      )}
      
      {/* Bottom Controls */}
      <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
        {/* Left side - Reset button */}
        <div className="flex items-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-6 w-6"
                  disabled={isUpdating || isCleaning || isResetting || isSending}
                >
                  <Icons.reset
                    className={cn(
                      'w-4 h-4',
                      isResetting && 'animate-spin'
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Reset chat {chat?.id}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-end gap-2">
          {/* Quick action buttons when waiting for input */}
          {chat?.status === 'wait_for_human_input' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-6 border-primary/50"
                onClick={() => handleQuickAction('\n')}
                disabled={isSending}
              >
                enter
                <Icons.enter className="w-3 h-3 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 border-primary/50"
                onClick={() => handleQuickAction('exit')}
                disabled={isSending}
              >
                exit
                <Icons.exit className="w-3 h-3 ml-1" />
              </Button>
            </>
          )}
          
          {/* Stop/Send button */}
          {chat?.status === 'running' || chat?.status === 'wait_for_human_input' ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🛑 Abort button clicked - force stopping agent');
                      handleAbort();
                    }}
                    disabled={isSending || isResetting}
                    type="button"
                  >
                    <Icons.stop className="w-5 h-5 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Forcefully stop agent</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    disabled={isSendDisabled}
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => handleSend()}
                  >
                    {isSending ? (
                      <Icons.spinner className="w-5 h-5 shrink-0 animate-spin" />
                    ) : (
                      <Icons.send className="w-5 h-5 shrink-0" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {!message.trim() 
                    ? 'Type a message to send' 
                    : 'Send message (Enter)'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};