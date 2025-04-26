import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, N8nChatHistory } from '@/types/chat';
import { parseMessage } from '@/utils/chatUtils';

export function useChatMessages(selectedChat: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      console.log(`Fetching messages for conversation: ${conversationId}`);
      
      const { data: historyData, error: historyError } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', conversationId)
        .order('id', { ascending: true });
      
      if (historyError) {
        console.error('Error fetching chat history:', historyError);
        throw historyError;
      }
      
      console.log(`Fetched ${historyData?.length || 0} history records`);
      
      let allMessages: ChatMessage[] = [];
      
      if (historyData && historyData.length > 0) {
        historyData.forEach((chatHistory: N8nChatHistory) => {
          console.log(`Processing message with hora: ${chatHistory.hora}`);
          const parsedMessages = parseMessage(chatHistory);
          if (parsedMessages.length > 0) {
            allMessages = [...allMessages, ...parsedMessages];
          }
        });
        
        setMessages(allMessages);
        console.log("Fetched and processed messages:", allMessages.length);
      } else {
        console.log("No messages found for this conversation");
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Ocorreu um erro ao carregar as mensagens.",
        variant: "destructive"
      });
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      setLoading(false);
      return;
    }
    
    console.log(`Setting up realtime listener for chat messages: ${selectedChat}`);
    
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
          console.log('New message received via realtime:', payload);
          
          const chatHistory = payload.new as N8nChatHistory;
          const newMessages = parseMessage(chatHistory);
          
          if (newMessages.length > 0) {
            console.log("Adding new messages from realtime:", newMessages);
            setMessages(prevMessages => [...prevMessages, ...newMessages]);
          }
        }
      )
      .subscribe();
    
    fetchMessages(selectedChat);
    
    return () => {
      console.log(`Cleaning up realtime subscription for chat: ${selectedChat}`);
      subscription.unsubscribe();
    };
  }, [selectedChat, fetchMessages]);

  const handleNewMessage = (message: ChatMessage) => {
    console.log("Adding new message to local state:", message);
    setMessages(currentMessages => [...currentMessages, message]);
  };

  return { messages, loading, handleNewMessage, fetchMessages };
}
