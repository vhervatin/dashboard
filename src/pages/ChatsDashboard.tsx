import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useConversations } from '@/hooks/useConversations';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useChatMessages } from '@/hooks/useChatMessages';
import PauseDurationDialog from '@/components/PauseDurationDialog';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Bot, Phone, Send } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Message } from '@/components/chat/Message';
import { cn } from '@/lib/utils';
import { useWebhookUrls } from '@/hooks/useWebhookUrls';

const ChatsDashboard = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { conversations, loading: conversationsLoading, setConversations, updateConversationLastMessage, fetchConversations } = useConversations();
  const { messages, loading: messagesLoading, handleNewMessage } = useChatMessages(selectedChat);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { urls } = useWebhookUrls();

  useRealtimeUpdates({ updateConversationLastMessage, fetchConversations });

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.phone.includes(searchTerm)
  );

  const openPauseDialog = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhoneNumber(phoneNumber);
    setPauseDialogOpen(true);
  };

  const closePauseDialog = () => {
    setPauseDialogOpen(false);
  };

  const pauseBot = async (duration: number | null) => {
    try {
      setIsLoading(prev => ({ ...prev, [`pause-${selectedPhoneNumber}`]: true }));
      
      const response = await fetch('https://nwh.devautomatizadores.com.br/webhook/pausa_bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: selectedPhoneNumber,
          duration,
          unit: 'seconds'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao pausar o bot');
      }
      
      toast({
        title: "Bot pausado",
        description: duration ? `Bot pausado com sucesso por ${duration} segundos` : `Bot não foi pausado`,
      });
      
    } catch (error) {
      console.error('Erro ao pausar bot:', error);
      toast({
        title: "Erro ao pausar bot",
        description: "Ocorreu um erro ao pausar o bot.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`pause-${selectedPhoneNumber}`]: false }));
      closePauseDialog();
    }
  };

  const startBot = async (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsLoading(prev => ({ ...prev, [`start-${phoneNumber}`]: true }));
      
      const response = await fetch('https://nwh.devautomatizadores.com.br/webhook/inicia_bot', {
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
        title: "Bot ativado",
        description: `Bot ativado com sucesso`
      });
    } catch (error) {
      console.error('Erro ao iniciar bot:', error);
      toast({
        title: "Erro ao ativar bot",
        description: "Ocorreu um erro ao ativar o bot.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`start-${phoneNumber}`]: false }));
    }
  };

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

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    try {
      const response = await fetch(urls.chatSendMessageDirect, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: selectedChat,
          message: messageText.trim(),
          phone: selectedConversation?.phone
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      handleNewMessage({
        content: messageText.trim(),
        role: 'assistant',
        timestamp: new Date().toISOString(),
        status: 'sent'
      });

      setMessageText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Ocorreu um erro ao enviar a mensagem.",
        variant: "destructive"
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const handleSelectChat = async (chatId: string) => {
    try {
      setSelectedChat(chatId);
      markConversationRead(chatId);
      setMessageText('');
    } catch (error) {
      console.error('Erro ao selecionar chat:', error);
      toast({
        title: "Erro ao carregar chat",
        description: "Ocorreu um erro ao carregar a conversa.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petshop-blue dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-petshop-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        <PageHeader
          title="Chats"
          description="Gerencie suas conversas e atendimentos"
        />
        
        <div className="flex-1 grid grid-cols-12 gap-4 mt-4 min-h-0">
          {/* Lista de Conversas */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col bg-card rounded-lg border shadow h-[calc(100vh-12rem)]">
            <div className="p-4 border-b flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversa..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-0">
              {conversationsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="h-8 w-8 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhuma conversa encontrada
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 border-b transition-colors",
                      selectedChat === conv.id && "bg-muted"
                    )}
                    onClick={() => handleSelectChat(conv.id)}
                  >
                    <Avatar>
                      <div className="flex h-full w-full items-center justify-center font-semibold uppercase">
                        {conv.name?.[0] || '?'}
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conv.name || "Cliente sem nome"}</p>
                        {conv.unread > 0 && (
                          <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Área de Chat */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9 bg-card rounded-lg border shadow flex flex-col h-[calc(100vh-12rem)]">
            {selectedChat ? (
              <>
                {/* Cabeçalho do Chat */}
                <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <div className="flex h-full w-full items-center justify-center font-semibold uppercase">
                        {selectedConversation?.name?.[0] || '?'}
                      </div>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedConversation?.name || "Cliente sem nome"}</h3>
                      <p className="text-sm text-muted-foreground">{selectedConversation?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => openPauseDialog(selectedConversation?.phone || '', e)}
                      disabled={isLoading[`pause-${selectedConversation?.phone}`]}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Pausar Bot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => startBot(selectedConversation?.phone || '', e)}
                      disabled={isLoading[`start-${selectedConversation?.phone}`]}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Iniciar Bot
                    </Button>
                  </div>
                </div>

                {/* Área de Mensagens */}
                <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="h-8 w-8 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Nenhuma mensagem encontrada
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <Message
                          key={`${message.timestamp}-${index}`}
                          message={message}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input de Mensagem */}
                <div className="p-4 border-t flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite uma mensagem..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Selecione uma conversa para começar
              </div>
            )}
          </div>
        </div>
      </div>
      
      <PauseDurationDialog 
        isOpen={pauseDialogOpen}
        onClose={closePauseDialog}
        onConfirm={pauseBot}
        phoneNumber={selectedPhoneNumber}
      />
    </PageLayout>
  );
};

export default ChatsDashboard;
