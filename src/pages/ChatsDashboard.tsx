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
  Video,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import PauseDurationDialog from '@/components/PauseDurationDialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { supabase, ChatMessage, Conversation, MessageData } from '@/integrations/supabase/client';

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
  const [botStatus, setBotStatus] = useState<Record<string, { status: string, timestamp: string }>>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const filteredConversations = conversations.filter(
    conv => conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);
  const currentMessages = selectedChat ? messages[selectedChat] || [] : [];

  useEffect(() => {
    fetchBotStatus();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      
      // First get unique session_ids from n8n_chat_histories
      const { data: chatData, error: chatError } = await supabase
        .from('n8n_chat_histories')
        .select('session_id')
        .order('id', { ascending: false });
      
      if (chatError) {
        console.error('Error fetching chat histories:', chatError);
        return;
      }

      // Get unique session IDs
      const uniqueSessionIds = [...new Set(chatData.map(item => item.session_id))];
      
      if (uniqueSessionIds.length === 0) {
        setIsLoadingConversations(false);
        return;
      }

      // Then get client information from dados_cliente based on sessionid
      const { data: clientData, error: clientError } = await supabase
        .from('dados_cliente')
        .select('*')
        .in('sessionid', uniqueSessionIds);

      if (clientError) {
        console.error('Error fetching client data:', clientError);
        return;
      }

      // Get last message for each session
      const lastMessagesPromises = uniqueSessionIds.map(async (sessionId) => {
        const { data, error } = await supabase
          .from('n8n_chat_histories')
          .select('*')
          .eq('session_id', sessionId)
          .order('id', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error(`Error fetching last message for session ${sessionId}:`, error);
          return null;
        }
        
        return { sessionId, lastMessage: data[0] };
      });

      const lastMessagesResults = await Promise.all(lastMessagesPromises);
      const lastMessages = lastMessagesResults.filter(Boolean).reduce((acc, item) => {
        if (item) {
          acc[item.sessionId] = item.lastMessage;
        }
        return acc;
      }, {} as Record<string, any>);

      // Create conversation objects
      const newConversations: Conversation[] = uniqueSessionIds.map((sessionId, index) => {
        const client = clientData?.find(c => c.sessionid === sessionId) || null;
        const lastMessage = lastMessages[sessionId];
        
        // Extract message content from the JSON structure
        let messageContent = '';
        let messageTime = '';
        
        if (lastMessage) {
          try {
            const messageData = lastMessage.message;
            if (typeof messageData === 'object') {
              // Try to extract the content from various possible structures
              messageContent = messageData.text || 
                             (messageData.content && messageData.content.text) || 
                             (messageData.message && messageData.message.text) || 
                             JSON.stringify(messageData).substring(0, 30) + '...';
              
              // Try to format the time (assuming it might be in the message data or use the database id as fallback)
              const timestamp = new Date();
              messageTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          } catch (e) {
            console.error('Error parsing message:', e);
            messageContent = 'Mensagem não disponível';
            messageTime = 'Recente';
          }
        }

        // Generate a placeholder avatar based on name or phone
        const name = client?.nome || 'Cliente';
        const avatar = name.charAt(0).toUpperCase();

        return {
          id: sessionId,
          name: client?.nome || `Cliente ${index + 1}`,
          lastMessage: messageContent || 'Sem mensagens recentes',
          time: messageTime || 'Recente',
          unread: 0, // Placeholder for now
          avatar: getRandomEmoji(),
          phone: client?.telefone || 'Número não disponível',
          email: client?.email,
          address: null,
          petName: null,
          petType: null,
          petBreed: null,
          sessionId: sessionId
        };
      });

      setConversations(newConversations);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const getRandomEmoji = () => {
    const emojis = ['👩‍🦰', '👨', '👩', '👨‍🦱', '👩‍🦱', '👴', '👵', '👦', '👧'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      setIsLoadingMessages(true);
      
      const { data, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', sessionId)
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Parse and format messages
      const chatMessages: ChatMessage[] = data.map((item, index) => {
        try {
          const messageData = item.message;
          let content = '';
          let sender: 'client' | 'me' = 'client';
          
          // Check if messageData is an object
          if (messageData && typeof messageData === 'object' && !Array.isArray(messageData)) {
            const typedMessage = messageData as MessageData;
            
            // Try to determine if it's from client or bot
            if (
              typedMessage.role === 'assistant' || 
              typedMessage.from === 'bot' || 
              (typedMessage.sender && typedMessage.sender === 'bot')
            ) {
              sender = 'me';
            }
            
            // Extract message content with proper type checking
            content = 
              typedMessage.text || 
              (typedMessage.content && typeof typedMessage.content === 'object' && typedMessage.content.text) || 
              (typedMessage.message && typeof typedMessage.message === 'object' && typedMessage.message.text) || 
              JSON.stringify(messageData).substring(0, 100) + '...';
          } else {
            content = String(messageData);
          }

          // Generate a timestamp (using the message ID as a seed for demonstration)
          const date = new Date(item.id * 1000);
          const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return {
            id: item.id,
            sender,
            content,
            time
          };
        } catch (e) {
          console.error('Error parsing message:', e);
          return {
            id: item.id,
            sender: 'client',
            content: 'Erro ao carregar mensagem',
            time: 'Desconhecido'
          };
        }
      });

      // Update messages state
      setMessages(prev => ({
        ...prev,
        [sessionId]: chatMessages
      }));
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const fetchBotStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('pausa_bot')
        .select('number, status, data');

      if (error) {
        console.error('Error fetching bot status:', error);
        return;
      }

      const statusMap: Record<string, { status: string, timestamp: string }> = {};
      
      data.forEach(item => {
        // Extract the phone number from the format "11977748661@s.whatsapp.net"
        const phoneNumber = item.number ? item.number.split('@')[0] : '';
        if (phoneNumber) {
          statusMap[phoneNumber] = {
            status: item.status || 'ATIVA',
            timestamp: item.data || ''
          };
        }
      });
      
      setBotStatus(statusMap);
    } catch (error) {
      console.error('Error in fetchBotStatus:', error);
    }
  };

  const getBotStatusForPhone = (phone: string) => {
    // Remove any non-numeric characters from the phone
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Try to find the status for this phone
    const status = botStatus[cleanPhone];
    
    if (!status) return { isActive: true, statusText: 'ATIVA' };
    
    // Check if the timestamp is within the last 10 minutes
    if (status.status === 'PAUSADA') {
      return { isActive: false, statusText: 'PAUSADA' };
    }
    
    // If status is 'ATIVA', check the timestamp
    if (status.timestamp) {
      const [datePart, timePart] = status.timestamp.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hour, minute] = timePart.split(':');
      
      const statusDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
      const currentDate = new Date();
      
      // Calculate the difference in minutes
      const diffMinutes = (currentDate.getTime() - statusDate.getTime()) / (1000 * 60);
      
      // If the last status update was more than 10 minutes ago, consider it inactive
      if (diffMinutes > 10) {
        return { isActive: false, statusText: 'INATIVA (timeout)' };
      }
    }
    
    return { isActive: true, statusText: 'ATIVA' };
  };

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
      
      // Refresh bot status after pausing
      setTimeout(fetchBotStatus, 1000);
      
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
      
      // Refresh bot status after starting
      setTimeout(fetchBotStatus, 1000);
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
                {isLoadingConversations ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => {
                    const { isActive, statusText } = getBotStatusForPhone(conv.phone);
                    
                    return (
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
                            
                            <div className="flex items-center mt-1 gap-2">
                              <div className="flex gap-1 items-center">
                                {isActive ? (
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                                )}
                                <span className={`text-xs ${isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {statusText}
                                </span>
                              </div>
                              
                              <div className="flex ml-auto">
                                <ToggleGroup type="single" className="h-6">
                                  <ToggleGroupItem 
                                    value="pause" 
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 data-[state=on]:bg-red-100 dark:data-[state=on]:bg-red-900/50 rounded-r-none border border-red-200 dark:border-red-800"
                                    onClick={(e) => openPauseDialog(conv.phone, e)}
                                    disabled={isLoading[`pause-${conv.phone}`]}
                                  >
                                    {isLoading[`pause-${conv.phone}`] ? (
                                      <span className="h-3 w-3 border-2 border-t-transparent border-current rounded-full animate-spin" />
                                    ) : (
                                      <Pause className="h-3 w-3" />
                                    )}
                                  </ToggleGroupItem>
                                  <ToggleGroupItem 
                                    value="start" 
                                    size="sm"
                                    className="h-6 w-6 p-0 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 data-[state=on]:bg-green-100 dark:data-[state=on]:bg-green-900/50 rounded-l-none border border-l-0 border-green-200 dark:border-green-800"
                                    onClick={(e) => startBot(conv.phone, e)}
                                    disabled={isLoading[`start-${conv.phone}`]}
                                  >
                                    {isLoading[`start-${conv.phone}`] ? (
                                      <span className="h-3 w-3 border-2 border-t-transparent border-current rounded-full animate-spin" />
                                    ) : (
                                      <Play className="h-3 w-3" />
                                    )}
                                  </ToggleGroupItem>
                                </ToggleGroup>
                              </div>
                            </div>
                          </div>
                          {conv.unread > 0 && (
                            <div className="ml-2 bg-green-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                              {conv.unread}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <MessageSquare className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">Nenhuma conversa encontrada</p>
                  </div>
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
                    <div className="flex items-center gap-1.5">
                      {selectedConversation && getBotStatusForPhone(selectedConversation.phone).isActive ? (
                        <>
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <p className="text-xs text-green-600 dark:text-green-400">Bot Ativo</p>
                        </>
                      ) : (
                        <>
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          <p className="text-xs text-red-600 dark:text-red-400">Bot Pausado</p>
                        </>
                      )}
                    </div>
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
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                  ) : currentMessages.length > 0 ? (
                    <div className="space-y-4">
                      {currentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === 'me' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender === 'me'
                                ? 'bg-green-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'me'
                                ? 'text-green-100'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>{message.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40">
                      <MessageSquare className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">Nenhuma mensagem encontrada</p>
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
                  {selectedConversation && (
                    <Badge className={`mt-2 ${getBotStatusForPhone(selectedConversation.phone).isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {getBotStatusForPhone(selectedConversation.phone).statusText}
                    </Badge>
                  )}
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
                          <p>{selectedConversation?.email || 'Não informado'}</p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Telefone</h3>
                          <p>{selectedConversation?.phone}</p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Session ID</h3>
                          <p className="break-all">{selectedConversation?.sessionId}</p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Histórico</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <p className="text-sm">Total de mensagens: {currentMessages.length}</p>
                            </div>
                          </div>
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
