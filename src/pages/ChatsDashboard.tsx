import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import PauseDurationDialog from '@/components/PauseDurationDialog';
import ChatHeader from '@/components/chat/ChatHeader';
import ConversationList from '@/components/chat/ConversationList';
import ChatArea from '@/components/chat/ChatArea';
import ClientInfoPanel from '@/components/chat/ClientInfoPanel';
import { Client, ChatMessage, N8nChatHistory, Conversation } from '@/types/chat';
import { formatMessageTime, parseMessage } from '@/utils/chatUtils';

const ChatsDashboard = () => {
  const { user, signOut } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true);
        
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
          
          setConversations(conversationsData);
        } else {
          setConversations([]);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Erro ao carregar conversas",
          description: "Ocorreu um erro ao carregar as conversas.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchConversations();
  }, [toast]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      
      const { data: historyData, error: historyError } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', conversationId)
        .order('id', { ascending: true });
      
      if (historyError) throw historyError;
      
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
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Ocorreu um erro ao carregar as mensagens.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  const openPauseDialog = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhoneNumber(phoneNumber);
    setPauseDialogOpen(true);
  };

  const closePauseDialog = () => {
    setPauseDialogOpen(false);
  };

  const pauseBot = async (phoneNumber: string, duration: number | null) => {
    try {
      setIsLoading(prev => ({ ...prev, [`pause-${phoneNumber}`]: true }));
      
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/pausa_bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber,
          duration,
          unit: 'seconds'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao pausar o bot');
      }
      
      toast({
        title: "Bot pausado",
        description: duration ? `O bot foi pausado para ${phoneNumber} por ${duration} segundos` : `O bot não foi pausado para ${phoneNumber}`,
      });
      
      closePauseDialog();
    } catch (error) {
      console.error('Erro ao pausar bot:', error);
      toast({
        title: "Erro ao pausar bot",
        description: "Ocorreu um erro ao tentar pausar o bot.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`pause-${phoneNumber}`]: false }));
    }
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
      
      toast({
        title: "Bot iniciado",
        description: `O bot foi iniciado para ${phoneNumber}`,
      });
    } catch (error) {
      console.error('Erro ao iniciar bot:', error);
      toast({
        title: "Erro ao iniciar bot",
        description: "Ocorreu um erro ao tentar iniciar o bot.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`start-${phoneNumber}`]: false }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <ChatHeader signOut={signOut} />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={25} minSize={20} maxSize={30} className="bg-white dark:bg-gray-800">
            <ConversationList 
              conversations={conversations} 
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              isLoading={isLoading}
              openPauseDialog={openPauseDialog}
              startBot={startBot}
              loading={loading}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={40} className="bg-gray-50 dark:bg-gray-900 flex flex-col">
            <ChatArea 
              selectedChat={selectedChat}
              selectedConversation={selectedConversation}
              messages={messages}
              loading={loading}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={25} minSize={20} maxSize={30} className="bg-white dark:bg-gray-800">
            <ClientInfoPanel 
              selectedChat={selectedChat}
              selectedConversation={selectedConversation}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      <PauseDurationDialog 
        isOpen={pauseDialogOpen}
        onClose={closePauseDialog}
        onConfirm={(duration) => pauseBot(selectedPhoneNumber, duration)}
        phoneNumber={selectedPhoneNumber}
      />
    </div>
  );
};

export default ChatsDashboard;
