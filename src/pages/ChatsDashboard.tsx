import React, { useState } from 'react';
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

const mockConversations = [
  { 
    id: '1', 
    name: 'Maria Silva', 
    lastMessage: 'Olá, gostaria de agendar um banho para meu cachorro', 
    time: '10:30', 
    unread: 2,
    avatar: '👩‍🦰',
    phone: '+55 11 99999-9999',
    email: 'maria@example.com',
    address: 'Rua das Flores, 123',
    petName: 'Rex',
    petType: 'Cachorro',
    petBreed: 'Golden Retriever'
  },
  { 
    id: '2', 
    name: 'João Pereira', 
    lastMessage: 'Que horas vocês fecham hoje?', 
    time: '09:15', 
    unread: 0,
    avatar: '👨',
    phone: '+55 11 98888-8888',
    email: 'joao@example.com',
    address: 'Av. Paulista, 1000',
    petName: 'Mia',
    petType: 'Gato',
    petBreed: 'Siamês'
  },
  { 
    id: '3', 
    name: 'Ana Costa', 
    lastMessage: 'Preciso remarcar a consulta', 
    time: 'Ontem', 
    unread: 1,
    avatar: '👩',
    phone: '+55 11 97777-7777',
    email: 'ana@example.com',
    address: 'Rua Augusta, 500',
    petName: 'Totó',
    petType: 'Cachorro',
    petBreed: 'Poodle'
  },
  { 
    id: '4', 
    name: 'Carlos Oliveira', 
    lastMessage: 'Obrigado pelo atendimento!', 
    time: 'Ontem', 
    unread: 0,
    avatar: '👨‍🦱',
    phone: '+55 11 96666-6666',
    email: 'carlos@example.com',
    address: 'Rua Oscar Freire, 200',
    petName: 'Luna',
    petType: 'Gato',
    petBreed: 'Persa'
  },
  { 
    id: '5', 
    name: 'Fernanda Santos', 
    lastMessage: 'Quanto custa a tosa?', 
    time: 'Segunda', 
    unread: 0,
    avatar: '👨‍🦱',
    phone: '+55 11 95555-5555',
    email: 'fernanda@example.com',
    address: 'Av. Rebouças, 750',
    petName: 'Thor',
    petType: 'Cachorro',
    petBreed: 'Bulldog'
  }
];

const mockMessages = {
  '1': [
    { id: '1', sender: 'client', content: 'Olá, gostaria de agendar um banho para meu cachorro', time: '10:15' },
    { id: '2', sender: 'me', content: 'Olá Maria! Claro, podemos agendar. Para qual dia você gostaria?', time: '10:20' },
    { id: '3', sender: 'client', content: 'Para o próximo sábado, se possível', time: '10:25' },
    { id: '4', sender: 'me', content: 'Temos horário disponível às 10h e às 14h no sábado. Qual você prefere?', time: '10:30' }
  ],
  '2': [
    { id: '1', sender: 'client', content: 'Que horas vocês fecham hoje?', time: '09:15' },
    { id: '2', sender: 'me', content: 'Olá João! Hoje fechamos às 19h.', time: '09:20' }
  ],
  '3': [
    { id: '1', sender: 'client', content: 'Preciso remarcar a consulta do Totó', time: 'Ontem 15:30' },
    { id: '2', sender: 'me', content: 'Olá Ana! Claro, para qual dia você gostaria de remarcar?', time: 'Ontem 15:45' },
    { id: '3', sender: 'client', content: 'Para a próxima semana, se possível', time: 'Ontem 16:00' }
  ],
  '4': [
    { id: '1', sender: 'client', content: 'O atendimento foi excelente, muito obrigado!', time: 'Ontem 14:20' },
    { id: '2', sender: 'me', content: 'Ficamos felizes em atender, Carlos! Sempre que precisar estamos à disposição.', time: 'Ontem 14:30' },
    { id: '3', sender: 'client', content: 'Obrigado pelo atendimento!', time: 'Ontem 14:35' }
  ],
  '5': [
    { id: '1', sender: 'client', content: 'Quanto custa a tosa para um Bulldog?', time: 'Segunda 11:10' },
    { id: '2', sender: 'me', content: 'Olá Fernanda! A tosa para Bulldog custa R$80,00. Inclui banho, secagem, corte de unhas e limpeza de ouvidos.', time: 'Segunda 11:25' }
  ]
};

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

  const filteredConversations = mockConversations.filter(
    conv => conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = mockConversations.find(conv => conv.id === selectedChat);
  const messages = selectedChat ? mockMessages[selectedChat] : [];

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

  const pauseBot = async (phoneNumber: string, duration: number, unit: string) => {
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
        description: `O bot foi pausado para ${phoneNumber} por ${duration} segundos`,
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
                {filteredConversations.map((conv) => (
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
                        <div className="flex mt-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900 dark:text-red-400"
                            onClick={(e) => openPauseDialog(conv.phone, e)}
                            disabled={isLoading[`pause-${conv.phone}`]}
                          >
                            {isLoading[`pause-${conv.phone}`] ? (
                              <span className="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2" />
                            ) : (
                              <Pause className="h-4 w-4 mr-1" />
                            )}
                            Pausar Bot
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-500 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900 dark:text-green-400"
                            onClick={(e) => startBot(conv.phone, e)}
                            disabled={isLoading[`start-${conv.phone}`]}
                          >
                            {isLoading[`start-${conv.phone}`] ? (
                              <span className="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2" />
                            ) : (
                              <Play className="h-4 w-4 mr-1" />
                            )}
                            Inicia Bot
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
                ))}
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
                  <div className="space-y-4">
                    {messages.map((message) => (
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
                          <p>{selectedConversation?.address}</p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Histórico</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <p className="text-sm">Último atendimento: 15/05/2023</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <p className="text-sm">Cliente desde: 01/01/2023</p>
                            </div>
                          </div>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="pet" className="mt-4 space-y-4">
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Nome do Pet</h3>
                          <p>{selectedConversation?.petName}</p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tipo</h3>
                          <p>{selectedConversation?.petType}</p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Raça</h3>
                          <p>{selectedConversation?.petBreed}</p>
                        </Card>
                        
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Histórico Médico</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <p className="text-sm">Última consulta: 10/05/2023</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <p className="text-sm">Vacinas: Em dia</p>
                            </div>
                          </div>
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
        onConfirm={(duration, unit) => {
          pauseBot(selectedPhoneNumber, duration, unit);
        }}
        phoneNumber={selectedPhoneNumber}
      />
    </div>
  );
};

export default ChatsDashboard;
