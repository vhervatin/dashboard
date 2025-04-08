
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, Video, MoreVertical, MessageSquare, User, PawPrint, Send } from 'lucide-react';
import { ChatMessage, Conversation } from '@/types/chat';

interface ChatAreaProps {
  selectedChat: string | null;
  selectedConversation: Conversation | undefined;
  messages: ChatMessage[];
  loading: boolean;
}

const ChatArea = ({ selectedChat, selectedConversation, messages, loading }: ChatAreaProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  if (!selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <MessageSquare size={64} className="mb-4 opacity-50" />
        <h3 className="text-xl font-medium mb-2">Selecione uma conversa</h3>
        <p className="text-sm">Escolha uma conversa para começar a interagir</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-xl mr-3">
          {selectedConversation?.avatar}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{selectedConversation?.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <Phone size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <Video size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <MoreVertical size={20} />
          </Button>
        </div>
      </div>
      
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
            {messages.map((message, index) => {
              if (!message.content) return null;
              
              const isAI = message.role === 'assistant' || 
                           message.type === 'ai' || 
                           message.role === 'ai';
              
              return (
                <div
                  key={`message-${index}`}
                  className={`flex ${isAI ? 'justify-end' : 'justify-start'}`}
                >
                  {!isAI && (
                    <div className="w-8 h-8 rounded-full bg-green-200 dark:bg-green-700 flex items-center justify-center mr-2">
                      <User size={16} className="text-green-700 dark:text-green-200" />
                    </div>
                  )}
                  
                  <div 
                    className={`max-w-[70%] rounded-lg p-3 shadow ${
                      isAI 
                        ? 'bg-green-500 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 text-right ${
                      isAI ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp 
                        ? new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) 
                        : ''}
                    </p>
                  </div>
                  
                  {isAI && (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center ml-2">
                      <PawPrint size={16} className="text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Digite uma mensagem"
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" size="icon" className="bg-green-500 hover:bg-green-600 text-white">
            <Send size={18} />
          </Button>
        </div>
      </form>
    </>
  );
};

export default ChatArea;
