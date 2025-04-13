
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, N8nChatHistory } from '@/types/chat';
import { parseMessage } from '@/utils/chatUtils';

export function useChatMessages(selectedChat: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
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
          const parsedMessages = parseMessage(chatHistory);
          if (parsedMessages.length > 0) {
            allMessages = [...allMessages, ...parsedMessages];
          }
        });
        
        setMessages(allMessages);
        console.log("Fetched messages:", allMessages);
      } else {
        console.log("No messages found for this conversation");
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Only show toast if component is still mounted
      toast({
        title: "Erro ao carregar mensagens",
        description: "Ocorreu um erro ao carregar as mensagens.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [selectedChat, fetchMessages]);

  const handleNewMessage = useCallback((message: ChatMessage) => {
    console.log("Adding new message to local state:", message);
    setMessages(prev => [...prev, message]);
  }, []);

  return { messages, loading, handleNewMessage, fetchMessages };
}
