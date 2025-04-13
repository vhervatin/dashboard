
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, N8nChatHistory, Client } from '@/types/chat';
import { formatMessageTime } from '@/utils/chatUtils';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const intervalRef = useRef<number | null>(null);
  const initialLoadDone = useRef(false);

  const updateConversationLastMessage = async (sessionId: string) => {
    try {
      const { data: historyData, error: historyError } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', sessionId)
        .order('id', { ascending: false })
        .limit(1);
      
      if (historyError) throw historyError;
      
      if (historyData && historyData.length > 0) {
        const chatHistory = historyData[0] as N8nChatHistory;
        
        setConversations(currentConversations => {
          return currentConversations.map(conv => {
            if (conv.id === sessionId) {
              let lastMessageContent = 'Sem mensagem';
              if (chatHistory.message) {
                if (typeof chatHistory.message === 'string') {
                  try {
                    const jsonMessage = JSON.parse(chatHistory.message);
                    if (jsonMessage.type && jsonMessage.content) {
                      lastMessageContent = jsonMessage.content;
                    }
                  } catch (e) {
                    lastMessageContent = chatHistory.message;
                  }
                } else if (typeof chatHistory.message === 'object') {
                  if (chatHistory.message.content) {
                    lastMessageContent = chatHistory.message.content;
                  } else if (chatHistory.message.messages && Array.isArray(chatHistory.message.messages)) {
                    const lastMsg = chatHistory.message.messages[chatHistory.message.messages.length - 1];
                    lastMessageContent = lastMsg?.content || 'Sem mensagem';
                  } else if (chatHistory.message.type && chatHistory.message.content) {
                    lastMessageContent = chatHistory.message.content;
                  }
                }
              }
              
              const messageDate = chatHistory.data 
                ? new Date(chatHistory.data) 
                : new Date();
                
              return {
                ...conv,
                lastMessage: lastMessageContent || 'Sem mensagem',
                time: formatMessageTime(messageDate),
                unread: conv.unread + 1
              };
            }
            return conv;
          });
        });
      }
    } catch (error) {
      console.error('Error updating conversation last message:', error);
    }
  };

  const fetchConversations = useCallback(async (isBackgroundRefresh = false) => {
    try {
      // Only show loading indicator on initial load, not during background refreshes
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
      
      const { data: chatHistoryData, error: chatHistoryError } = await supabase
        .from('n8n_chat_histories')
        .select('session_id')
        .order('id', { ascending: false });
      
      if (chatHistoryError) throw chatHistoryError;
      
      if (!chatHistoryData || chatHistoryData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }
      
      const uniqueSessionIds = Array.from(new Set(
        chatHistoryData.map(item => item.session_id)
      ));
      
      const { data: clientsData, error: clientsError } = await supabase
        .from('dados_cliente')
        .select('*')
        .in('sessionid', uniqueSessionIds)
        .not('telefone', 'is', null);
      
      if (clientsError) throw clientsError;
      
      if (clientsData && clientsData.length > 0) {
        const conversationsData: Conversation[] = clientsData.map((client: Client) => {
          return {
            id: client.sessionid,
            name: client.nome || 'Cliente sem nome',
            lastMessage: 'Carregando...',
            time: 'Recente',
            unread: 0,
            avatar: '👤',
            phone: client.telefone,
            email: client.email || 'Sem email',
            petName: client.nome_pet || 'Não informado',
            petType: client.porte_pet || 'Não informado',
            petBreed: client.raca_pet || 'Não informado',
            sessionId: client.sessionid
          };
        });
        
        // Preserve unread status from existing conversations during background refresh
        if (isBackgroundRefresh) {
          const existingConversationsMap = new Map(
            conversations.map(conv => [conv.id, conv])
          );
          
          for (let i = 0; i < conversationsData.length; i++) {
            const existingConv = existingConversationsMap.get(conversationsData[i].id);
            if (existingConv) {
              conversationsData[i].unread = existingConv.unread;
            }
          }
        }
        
        for (const conversation of conversationsData) {
          const { data: historyData, error: historyError } = await supabase
            .from('n8n_chat_histories')
            .select('*')
            .eq('session_id', conversation.sessionId)
            .order('id', { ascending: false })
            .limit(1);
          
          if (!historyError && historyData && historyData.length > 0) {
            const chatHistory = historyData[0] as N8nChatHistory;
            
            let lastMessageContent = 'Sem mensagem';
            if (chatHistory.message) {
              if (typeof chatHistory.message === 'string') {
                try {
                  const jsonMessage = JSON.parse(chatHistory.message);
                  if (jsonMessage.type && jsonMessage.content) {
                    lastMessageContent = jsonMessage.content;
                  }
                } catch (e) {
                  lastMessageContent = chatHistory.message;
                }
              } else if (typeof chatHistory.message === 'object') {
                if (chatHistory.message.content) {
                  lastMessageContent = chatHistory.message.content;
                } else if (chatHistory.message.messages && Array.isArray(chatHistory.message.messages)) {
                  const lastMsg = chatHistory.message.messages[chatHistory.message.messages.length - 1];
                  lastMessageContent = lastMsg?.content || 'Sem mensagem';
                } else if (chatHistory.message.type && chatHistory.message.content) {
                  lastMessageContent = chatHistory.message.content;
                }
              }
            }
            
            conversation.lastMessage = lastMessageContent || 'Sem mensagem';
            const messageDate = chatHistory.data 
              ? new Date(chatHistory.data) 
              : new Date();
            conversation.time = formatMessageTime(messageDate);
          }
        }
        
        // When performing a background refresh, update state with minimal visual impact
        if (isBackgroundRefresh) {
          setConversations(prevConversations => {
            // Create a map of existing conversations for quick lookup
            const existingMap = new Map(prevConversations.map(conv => [conv.id, conv]));
            const newMap = new Map(conversationsData.map(conv => [conv.id, conv]));
            
            // Start with all new conversations
            const result = [...conversationsData];
            
            // Add any existing conversations that aren't in the new data (though this should be rare)
            prevConversations.forEach(conv => {
              if (!newMap.has(conv.id)) {
                result.push(conv);
              }
            });
            
            // Sort by recency (assuming time can be compared as strings as it's formatted consistently)
            result.sort((a, b) => {
              // This is a simplified sort. You may need more complex logic depending on your time format
              return a.time < b.time ? 1 : -1;
            });
            
            return result;
          });
        } else {
          // Initial load or manual refresh
          setConversations(conversationsData);
        }
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Only show error toasts on initial load or manual refresh, not background refreshes
      if (!isBackgroundRefresh) {
        toast({
          title: "Erro ao carregar conversas",
          description: "Ocorreu um erro ao carregar as conversas.",
          variant: "destructive"
        });
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
      
      // Mark initial load as complete
      if (!initialLoadDone.current) {
        initialLoadDone.current = true;
      }
    }
  }, [toast, conversations]);

  const startAutoRefresh = useCallback(() => {
    console.log('Starting auto refresh of conversations every 1 second');
    
    // Limpar intervalo existente se houver
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    
    // Configurar novo intervalo para atualizar a cada 1 segundo
    // Pass true to indicate this is a background refresh
    intervalRef.current = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('Auto refreshing conversations (background)');
        fetchConversations(true);
      }
    }, 1000);
  }, [fetchConversations]);

  const stopAutoRefresh = useCallback(() => {
    console.log('Stopping auto refresh of conversations');
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Limpa o intervalo quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    setConversations,
    loading,
    updateConversationLastMessage,
    fetchConversations,
    startAutoRefresh,
    stopAutoRefresh
  };
}
