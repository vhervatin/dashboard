import { ChatMessage } from '@/types/chat';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageProps {
  message: ChatMessage;
  className?: string;
}

export function Message({ message, className }: MessageProps) {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
  
  return (
    <div className={cn(
      'flex gap-2 p-4',
      isUser ? 'flex-row-reverse' : 'flex-row',
      className
    )}>
      <Avatar className="h-8 w-8">
        <div className="flex h-full w-full items-center justify-center font-semibold uppercase">
          {isUser ? 'U' : 'A'}
        </div>
      </Avatar>
      <div className={cn(
        'flex flex-col max-w-[70%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'rounded-lg p-3',
          isUser ? 'bg-petshop-blue text-white' : 'bg-muted'
        )}>
          {message.content}
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {format(timestamp, 'HH:mm', { locale: ptBR })}
          {message.status && (
            <span className="ml-2 text-xs">
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'read' && '✓✓'}
            </span>
          )}
        </span>
      </div>
    </div>
  );
} 