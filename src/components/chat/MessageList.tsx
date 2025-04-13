
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types/chat';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
}

const MessageList = ({ messages, loading }: MessageListProps) => {
  return (
    <ScrollArea className="flex-1 p-4">
      {loading ? (
        <div className="text-center py-10">
          <p>Carregando mensagens...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <MessageSquare className="mx-auto mb-2 h-12 w-12 opacity-30" />
          <p>Nenhuma mensagem encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <MessageItem key={index} message={message} index={index} />
          ))}
        </div>
      )}
    </ScrollArea>
  );
};

export default MessageList;
