
import React from 'react';
import { PawPrint, User } from 'lucide-react';
import { ChatMessage } from '@/types/chat';

interface MessageItemProps {
  message: ChatMessage;
  index: number;
}

const MessageItem = ({ message, index }: MessageItemProps) => {
  if (!message.content) return null;
  
  const isAI = message.role === 'assistant' || 
               message.type === 'ai' || 
               message.role === 'ai';
  
  return (
    <div
      key={`message-${index}`}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-green-200 dark:bg-green-700 flex items-center justify-center mr-2">
          <PawPrint size={16} className="text-green-700 dark:text-green-200" />
        </div>
      )}
      
      <div 
        className={`max-w-[70%] rounded-lg p-3 shadow ${
          isAI 
            ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tr-none' 
            : 'bg-green-500 text-white rounded-tl-none'
        }`}
      >
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 text-right ${
          isAI 
            ? 'text-gray-500 dark:text-gray-400' 
            : 'text-green-100'
        }`}>
          {message.timestamp 
            ? new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) 
            : ''}
        </p>
      </div>
      
      {!isAI && (
        <div className="w-8 h-8 rounded-full bg-green-200 dark:bg-green-700 flex items-center justify-center ml-2">
          <User size={16} className="text-green-700 dark:text-green-200" />
        </div>
      )}
    </div>
  );
};

export default MessageItem;
