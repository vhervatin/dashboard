
import { useEffect } from 'react';
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
  
  useEffect(() => {
    const subscription = supabase
      .channel('n8n_chat_histories_updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'n8n_chat_histories' 
        }, 
        (payload) => {
          console.log('New chat history entry detected:', payload);
          
          const sessionId = payload.new.session_id;
          
          const existingConvIndex = conversations.findIndex(conv => conv.id === sessionId);
          
          if (existingConvIndex >= 0) {
            updateConversationLastMessage(sessionId);
          } else {
            fetchConversations();
          }
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [conversations, updateConversationLastMessage, fetchConversations]);
}
