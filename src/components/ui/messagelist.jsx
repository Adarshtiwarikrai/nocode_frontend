import { Icons } from './icons';
import { Button } from './button';
import { stripMatch } from '../../lib/match';
import { StatusMessage } from '../../lib/chat';
import { useChat } from '../../hooks/chat';
import { useUser } from '../../hooks/user';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Card } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Markdown } from '../shared/markdown';
import { ScrollArea } from './scrollarea';
import { cn } from '../../lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from './hovercard';
import SyntaxHighlighter from 'react-syntax-highlighter';

const MessageBubble = ({ chat, message, className }) => {
  const { chatSource } = useChat(chat.id);
  const { user } = useUser();

  const userNodeName =
    chatSource?.flow?.nodes?.find(
      (node) =>
        node.data.type === 'UserProxyAgent' ||
        node.data.type === 'RetrieveUserProxyAgent' ||
        node.data.name.includes('User')
    )?.data?.name ?? '';

  let waitForHumanInput = false;

  // Status messages handling
  if (message.content.startsWith(StatusMessage.completed)) {
    const { found, text } = stripMatch(message.content, StatusMessage.completed);
    const success = found && text.startsWith('DONE');
    const resultClass = success
      ? 'bg-green-500/20 text-green-500'
      : 'bg-red-500/20 text-red-500';

    return (
      <Card
        className={cn(
          'w-full flex flex-col items-start gap-2 shadow-sm px-3 py-1',
          resultClass,
          className
        )}
      >
        <div className="flex items-center gap-2">
          {success ? (
            <Icons.checkCircle className="w-4 h-4" />
          ) : (
            <Icons.alert className="w-4 h-4" />
          )}
          <span className="text-sm font-semibold">
            Collaboration completed with {success ? 'success' : 'failure'}.
          </span>
        </div>
        {!success && <span className="text-xs text-red-500">{text}</span>}
      </Card>
    );
  }

  if (message.content.startsWith(StatusMessage.running)) {
    return (
      <Card
        className={cn(
          'w-full flex items-center gap-2 shadow-sm px-3 py-1 bg-blue-500/20 text-blue-500',
          className
        )}
      >
        <Icons.group className="w-4 h-4" />
        <span className="text-sm font-semibold">Collaboration started...</span>
      </Card>
    );
  }

  if (message.content.startsWith(StatusMessage.receivedHumanInput)) {
    message.content = 'Human input received';
  }

  if (message.content.startsWith(StatusMessage.waitForHumanInput)) {
    const { text } = stripMatch(message.content, StatusMessage.waitForHumanInput);
    message.content = text ?? 'Waiting for human input...';
    waitForHumanInput = true;
  }

  const messageClass = waitForHumanInput
    ? 'bg-yellow-600/20 text-yellow-600'
    : message.type === 'summary'
    ? 'bg-green-500/20 border-green-500/20'
    : 'bg-background text-primary';

  let avatarIcon = <Icons.agent className="w-4 h-4" />;
  if (message.type === 'user') {
    // ✅ FIX: Handle cases where user or avatar_url might be undefined
    const avatarUrl = user?.user_metadata?.avatar_url || message.user?.avatar_url || undefined;
    
    avatarIcon = (
      <Avatar className="w-7 h-7">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          <Icons.user className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
    );
  } else if (message.type === 'summary') {
    avatarIcon = <Icons.info className="w-4 h-4" />;
  } else if (message.sender === userNodeName) {
    avatarIcon = <Icons.userVoiceFill className="w-5 h-5" />;
  }

  let messageHeader = null;
  if (waitForHumanInput) {
    messageHeader = (
      <div className="flex items-center gap-2">Waiting for human input...</div>
    );
  } else if (message.sender) {
    messageHeader = (
      <div className="chat-header flex items-end gap-2 text-xs text-muted-foreground font-semibold">
        <div className="flex items-center gap-1 overflow-x-hidden max-w-full">
          {message.sender}
          {message.receiver && (
            <>
              <Icons.chevronRight className="w-3 h-3 inline-block" />
              <span>{message.receiver}</span>
            </>
          )}
          {message.metadata?.general === 'USING AUTO REPLY...' && (
            <span className="text-yellow-500 ml-2">(Auto Reply)</span>
          )}
        </div>
        <div className="text-muted-foreground text-xs line-clamp-1">
          {message.created_at &&
            new Date(message.created_at).toLocaleString()}
        </div>
      </div>
    );

    if (message.metadata?.next_speaker) {
      messageHeader = (
        <div className="flex flex-col gap-1">
          {messageHeader}
          <div className="text-xs text-blue-500">
            Next speaker: {message.metadata.next_speaker}
          </div>
        </div>
      );
    }
  } else if (message.type === 'summary') {
    messageHeader = <div className="flex items-center gap-2 text-xs">Summary</div>;
  }

  return (
    <Card className={cn(messageClass, 'p-1 w-full max-w-full mx-auto', className)}>
      <div className="flex items-center gap-1 px-1">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm">
          {avatarIcon}
        </div>
        <div className="flex flex-1">{messageHeader}</div>

        {message.content && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="w-5 h-5">
                <Icons.code className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[calc(100vh-2rem)] overflow-hidden p-0 gap-0">
              <DialogTitle className="text-sm font-semibold px-2 py-3 border-b">
                Raw Message Content {message.type}
              </DialogTitle>
              <ScrollArea className="max-h-[calc(100vh-var(--header-height))] text-sm bg-muted/20">
                <pre className="whitespace-pre-wrap p-2">
                  <code>{message.content}</code>
                </pre>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}

        {message.metadata && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="w-5 h-5">
                <Icons.info className="w-3 h-3" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent
              side="left"
              align="start"
              sideOffset={10}
              className="z-50 p-2 w-[calc(100vw-4rem)] text-xs sm:w-[500px] lg:w-[600px] overflow-y-auto max-h-[calc(100vh-4rem)]"
            >
              <SyntaxHighlighter
                language="json"
                className="text-xs bg-muted/80 backdrop-blur-sm"
              >
                {JSON.stringify(message.metadata, null, 2)}
              </SyntaxHighlighter>
            </HoverCardContent>
          </HoverCard>
        )}
      </div>

      <div className="relative group rounded-md p-2 text-sm break-word overflow-x-auto">
        {message.content ? <Markdown>{message.content}</Markdown> : <span className="text-lime-600">(no content)</span>}
      </div>
    </Card>
  );
};

/**
 * Filter messages to show ONLY:
 * - User messages
 * - Summary messages (final answer)
 * - Failed/status messages
 * 
 * CRITICAL: Filters out ALL regular assistant messages - only summaries are shown as final answers
 */
const filterMessages = (messages) => {
  return messages.filter((message) => {
    // ✅ Always keep user messages
    if (message.type === 'user') {
      return true;
    }
    
    // ✅ Always keep summary messages (these are the final answers)
    if (message.type === 'summary') {
      return true;
    }
    
    // ✅ Always keep status messages (completed, failed, running, etc.)
    const content = message.content || '';
    if (
      content.startsWith('__STATUS_') ||
      content.startsWith(StatusMessage.completed) ||
      content.startsWith(StatusMessage.running) ||
      content.startsWith(StatusMessage.receivedHumanInput) ||
      content.startsWith(StatusMessage.waitForHumanInput)
    ) {
      return true;
    }
    
    // ✅ CRITICAL: Filter out ALL other assistant messages
    // Only summaries and status messages are kept - all regular assistant messages are filtered
    if (message.type === 'assistant') {
      return false;
    }
    
    // ✅ Filter out everything else
    return false;
  });
};

export const MessageList = ({ chat, messages, className }) => {
  // Filter messages before displaying
  const filteredMessages = filterMessages(messages);
  
  return (
    <>
      {filteredMessages.map((message, index) => (
        <MessageBubble
          key={message.id || index}
          chat={chat}
          message={message}
          className={className}
        />
      ))}
    </>
  );
}; 