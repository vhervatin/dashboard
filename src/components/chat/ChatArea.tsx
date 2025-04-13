
import React, { useState, useEffect } from 'react';
import { ChatMessage, Conversation } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import ChatConversationHeader from './ChatConversationHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import NoSelectedChat from './NoSelectedChat';

interface ChatAreaProps {
  selectedChat: string | null;
  selectedConversation: Conversation | undefined;
  messages: ChatMessage[];
  loading: boolean;
  onNewMessage?: (message: ChatMessage) => void;
}

const ChatArea = ({ selectedChat, selectedConversation, messages, loading, onNewMessage }: ChatAreaProps) => {
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  
  // Update local messages when props messages change
  useEffect(() => {
    console.log("Messages prop updated in ChatArea:", messages.length);
    setLocalMessages(messages);
  }, [messages]);

  // Set up real-time listener for new chat messages
  useEffect(() => {
    if (!selectedChat) return;
    
    console.log(`Setting up realtime listener for chat: ${selectedChat}`);
    
    const subscription = supabase
      .channel(`chat_messages_${selectedChat}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'n8n_chat_histories',
          filter: `session_id=eq.${selectedChat}`
        }, 
        (payload) => {
          console.log('New message received from supabase realtime:', payload);
          
          // Parse the new message
          const newMessageData = payload.new;
          
          // Process the message based on its format
          let parsedMessage: ChatMessage | null = null;
          
          if (typeof newMessageData.message === 'string') {
            try {
              const messageObj = JSON.parse(newMessageData.message);
              parsedMessage = {
                role: messageObj.type === 'human' ? 'user' : 'assistant',
                content: messageObj.content || '',
                timestamp: newMessageData.data || new Date().toISOString(),
                type: messageObj.type
              };
            } catch (e) {
              parsedMessage = {
                role: 'assistant',
                content: newMessageData.message,
                timestamp: newMessageData.data || new Date().toISOString()
              };
            }
          } else if (typeof newMessageData.message === 'object' && newMessageData.message) {
            if (newMessageData.message.type && newMessageData.message.content) {
              parsedMessage = {
                role: newMessageData.message.type === 'human' ? 'user' : 'assistant',
                content: newMessageData.message.content,
                timestamp: newMessageData.data || new Date().toISOString(),
                type: newMessageData.message.type
              };
            } else if (newMessageData.message.messages && Array.isArray(newMessageData.message.messages)) {
              const lastMsg = newMessageData.message.messages[newMessageData.message.messages.length - 1];
              if (lastMsg) {
                parsedMessage = {
                  role: lastMsg.type === 'human' ? 'user' : 'assistant',
                  content: lastMsg.content || '',
                  timestamp: newMessageData.data || new Date().toISOString(),
                  type: lastMsg.type
                };
              }
            }
          }
          
          // If we successfully parsed a message, add it to the messages
          if (parsedMessage && parsedMessage.content) {
            console.log("Adding new message from realtime:", parsedMessage);
            
            // Update local messages state
            setLocalMessages(currentMessages => [...currentMessages, parsedMessage!]);
            
            // Call the callback if provided
            if (onNewMessage) {
              onNewMessage(parsedMessage);
            }
          }
        }
      )
      .subscribe();
    
    console.log(`Realtime subscription created for chat: ${selectedChat}`);
      
    return () => {
      console.log(`Cleaning up realtime subscription for chat: ${selectedChat}`);
      subscription.unsubscribe();
    };
  }, [selectedChat, onNewMessage]);

  const handleNewMessage = (message: ChatMessage) => {
    console.log("New message sent from input:", message);
    setLocalMessages(prev => [...prev, message]);
    
    // Call the parent callback if provided
    if (onNewMessage) {
      onNewMessage(message);
    }
  };

  if (!selectedChat) {
    return <NoSelectedChat />;
  }

  return (
    <>
      <ChatConversationHeader selectedConversation={selectedConversation} />
      <MessageList messages={localMessages} loading={loading} />
      <MessageInput 
        selectedChat={selectedChat}
        selectedConversation={selectedConversation}
        onMessageSent={handleNewMessage}
      />
    </>
  );
};

export default ChatArea;
