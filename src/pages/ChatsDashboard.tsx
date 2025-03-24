
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  LogOut, 
  MessageSquare, 
  MoreVertical, 
  PawPrint, 
  Phone, 
  Play,
  Pause,
  Search, 
  Send, 
  User, 
  Video
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import PauseDurationDialog from '@/components/PauseDurationDialog';
import { supabase } from '@/integrations/supabase/client';

// Define interfaces for our data
interface Client {
  id: number;
  telefone: string;
  nome: string;
  email: string;
  sessionid: string;
  cpf_cnpj?: string;
}

interface ChatMessage {
  id: number;
  conversation_id: string;
  user_message: string | null;
  bot_message: string | null;
  created_at: string;
  phone: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  phone: string;
  email: string;
  address?: string;
  petName?: string;
  petType?: string;
  petBreed?: string;
  sessionId: string;
}

const ChatsDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch conversations from Supabase
  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true);
        
        // First get unique clients with session IDs
        const { data: clientsData, error: clientsError } = await supabase
          .from('dados_cliente')
          .select('*')
          .not('telefone', 'is', null);
        
        if (clientsError) throw clientsError;
        
        if (clientsData && clientsData.length > 0) {
          // Create conversations from clients data
          const conversationsData: Conversation[] = clientsData.map((client: Client) => {
            return {
              id: client.sessionid,
              name: client.nome || 'Cliente sem nome',
              lastMessage: 'Carregando...',
              time: 'Recente',
              unread: 0,
              avatar: '👤', // Default avatar
              phone: client.telefone,
              email: client.email || 'Sem email',
              sessionId: client.sessionid
            };
          });
          
          // For each conversation, get the last message
          for (const conversation of conversationsData) {
            const { data: lastMessageData, error: lastMessageError } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('phone', conversation.phone)
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (!lastMessageError && lastMessageData && lastMessageData.length > 0) {
              const lastMessage = lastMessageData[0];
              conversation.lastMessage = lastMessage.user_message || lastMessage.bot_message || 'Sem mensagem';
              // Format time
              const messageDate = new Date(lastMessage.created_at);
              conversation.time = formatMessageTime(messageDate);
            }
          }
          
          setConversations(conversationsData);
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

  // Fetch messages for selected conversation
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  // Format time for display
  const formatMessageTime = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Ontem';
    } else if (diffInDays < 7) {
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      
      // Find the conversation to get the phone number
      const conversation = conversations.find(conv => conv.id === conversationId);
      
      if (conversation) {
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('phone', conversation.phone)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        
        if (messagesData) {
          setMessages(messagesData);
        }
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

  const filteredConversations = conversations.filter(
    conv => conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const goBack = () => {
    navigate('/dashboard');
  };

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
      <header className="bg-petshop-blue dark:bg-gray-800 text-white shadow-md transition-colors duration-300 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goBack} 
              className="text-white hover:bg-blue-700 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <PawPrint className="h-8 w-8 text-petshop-gold" />
            <h1 className="text-2xl font-bold">Chats</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              {user?.user_metadata?.name || user?.email}
            </Badge>
            <ThemeToggle />
            <Button variant="outline" onClick={signOut} className="border-white text-white bg-gray-950/50 hover:bg-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={25} minSize={20} maxSize={30} className="bg-white dark:bg-gray-800">
            <div className="flex flex-col h-full">
              <div className="p-3 bg-green-50 dark:bg-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                  <Input
                    placeholder="Buscar conversas"
                    className="pl-10 bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="p-4 text-center">
                    <p>Carregando conversas...</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div key={conv.id} className="border-b border-gray-200 dark:border-gray-700">
                      <div
                        className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          selectedChat === conv.id ? 'bg-green-50 dark:bg-gray-700' : ''
                        }`}
                        onClick={() => setSelectedChat(conv.id)}
                      >
                        <div className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-2xl mr-3">
                          {conv.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium truncate">{conv.name}</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                              {conv.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {conv.lastMessage}
                          </p>
                          
                          <div className="flex space-x-2 mt-2">
                            <Button
                              variant="danger"
                              size="xs"
                              className="rounded-full px-3 flex items-center gap-1"
                              onClick={(e) => openPauseDialog(conv.phone, e)}
                              disabled={isLoading[`pause-${conv.phone}`]}
                            >
                              {isLoading[`pause-${conv.phone}`] ? (
                                <span className="h-3 w-3 border-2 border-t-transparent border-current rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Pause className="h-3 w-3" />
                                  <span>Pausar</span>
                                </>
                              )}
                            </Button>
                            <Button
                              variant="success"
                              size="xs"
                              className="rounded-full px-3 flex items-center gap-1"
                              onClick={(e) => startBot(conv.phone, e)}
                              disabled={isLoading[`start-${conv.phone}`]}
                            >
                              {isLoading[`start-${conv.phone}`] ? (
                                <span className="h-3 w-3 border-2 border-t-transparent border-current rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Play className="h-3 w-3" />
                                  <span>Ativar</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        {conv.unread > 0 && (
                          <div className="ml-2 bg-green-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {conv.unread}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={40} className="bg-gray-50 dark:bg-gray-900 flex flex-col">
            {selectedChat ? (
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
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.bot_message ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.bot_message
                                ? 'bg-green-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            <p>{message.bot_message || message.user_message}</p>
                            <p className={`text-xs mt-1 ${
                              message.bot_message
                                ? 'text-green-100'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>{new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
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
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <MessageSquare size={64} className="mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">Selecione uma conversa</h3>
                <p className="text-sm">Escolha uma conversa para começar a interagir</p>
              </div>
            )}
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={25} minSize={20} maxSize={30} className="bg-white dark:bg-gray-800">
            {selectedChat ? (
              <div className="h-full flex flex-col">
                <div className="text-center p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-24 h-24 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-4xl mx-auto mb-4">
                    {selectedConversation?.avatar}
                  </div>
                  <h2 className="text-xl font-semibold">{selectedConversation?.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{selectedConversation?.phone}</p>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    <Tabs defaultValue="info">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="info">Informações</TabsTrigger>
                        <TabsTrigger value="pet">Pet</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="info" className="mt-4 space-y-4">
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Email</h3>
                          <p>{selectedConversation?.email}</p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Telefone</h3>
                          <p>{selectedConversation?.phone}</p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Endereço</h3>
                          <p>{selectedConversation?.address || 'Não informado'}</p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Session ID</h3>
                          <p className="text-xs break-all">{selectedConversation?.sessionId || 'Não informado'}</p>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="pet" className="mt-4 space-y-4">
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Nome do Pet</h3>
                          <p>{selectedConversation?.petName || 'Não informado'}</p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tipo</h3>
                          <p>{selectedConversation?.petType || 'Não informado'}</p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Raça</h3>
                          <p>{selectedConversation?.petBreed || 'Não informado'}</p>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <User size={64} className="mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">Informações do Cliente</h3>
                <p className="text-sm text-center px-4">Selecione uma conversa para ver as informações do cliente</p>
              </div>
            )}
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
