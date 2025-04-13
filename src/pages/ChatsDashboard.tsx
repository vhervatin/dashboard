
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatLayout from '@/components/chat/ChatLayout';
import { useConversations } from '@/hooks/useConversations';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useChatMessages } from '@/hooks/useChatMessages';

const ChatsDashboard = () => {
  const { user, signOut } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');
  
  // Use custom hooks for data fetching and state management
  const { conversations, setConversations, loading, updateConversationLastMessage, fetchConversations } = useConversations();
  const { messages, loading: messagesLoading, handleNewMessage } = useChatMessages(selectedChat);
  
  // Set up real-time listeners for new chat messages
  useRealtimeUpdates({ 
    conversations, 
    updateConversationLastMessage, 
    fetchConversations 
  });

  // Find the currently selected conversation
  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  const openPauseDialog = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhoneNumber(phoneNumber);
    setIsLoading(prev => ({ ...prev, [`pause-${phoneNumber}`]: true }));
  };

  const startBot = async (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsLoading(prev => ({ ...prev, [`start-${phoneNumber}`]: true }));
      
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/inicia_bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao iniciar o bot');
      }
    } catch (error) {
      console.error('Erro ao iniciar bot:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, [`start-${phoneNumber}`]: false }));
    }
  };

  // Mark a conversation as read when selected
  const markConversationRead = (sessionId: string) => {
    setConversations(currentConversations => 
      currentConversations.map(conv => {
        if (conv.id === sessionId) {
          return { ...conv, unread: 0 };
        }
        return conv;
      })
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <ChatHeader signOut={signOut} />

      <div className="flex-1 overflow-hidden">
        <ChatLayout 
          conversations={conversations}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          isLoading={isLoading}
          openPauseDialog={openPauseDialog}
          startBot={startBot}
          loading={loading || messagesLoading}
          messages={messages}
          handleNewMessage={handleNewMessage}
          selectedConversation={selectedConversation}
          markConversationRead={markConversationRead}
        />
      </div>
    </div>
  );
};

export default ChatsDashboard;
