
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@/types/chat';

interface UseRealtimeUpdatesProps {
  conversations: Conversation[];
  updateConversationLastMessage: (sessionId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
}

export function useRealtimeUpdates({ 
  conversations, 
  updateConversationLastMessage,
  fetchConversations 
}: UseRealtimeUpdatesProps) {
  
  const handleNewMessage = useCallback((payload: any) => {
    console.log('New chat history entry detected:', payload);
    
    const sessionId = payload.new.session_id;
    
    const existingConvIndex = conversations.findIndex(conv => conv.id === sessionId);
    console.log(`Checking for conversation with ID ${sessionId}. Found: ${existingConvIndex >= 0}`);
    
    if (existingConvIndex >= 0) {
      console.log('Updating last message for conversation:', sessionId);
      updateConversationLastMessage(sessionId);
    } else {
      console.log('Fetching all conversations as new conversation detected');
      fetchConversations();
    }
  }, [conversations, updateConversationLastMessage, fetchConversations]);
  
  useEffect(() => {
    console.log('Setting up realtime updates with conversations:', conversations.length);
    
    const subscription = supabase
      .channel('n8n_chat_histories_updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'n8n_chat_histories' 
        }, 
        handleNewMessage
      )
      .subscribe();
      
    console.log('Realtime subscription established');
      
    return () => {
      console.log('Cleaning up realtime subscription');
      subscription.unsubscribe();
    };
  }, [conversations, updateConversationLastMessage, fetchConversations, handleNewMessage]);
}
