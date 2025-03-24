
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, PawPrint, Database, RefreshCw, MessageSquare, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Evolution = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleCreateInstance = () => {
    toast({
      title: "Instância criada!",
      description: "Uma nova instância Evolution foi criada com sucesso.",
    });
  };
  
  const handleConnectWhatsApp = () => {
    setIsDialogOpen(true);
  };
  
  const handleSubmitPhone = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Formato inválido",
        description: "Por favor, digite o número no formato 5511977748661",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    
    try {
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/instanciaevolution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber,
          userId: user?.id || 'anonymous'
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Solicitação enviada!",
          description: "Verifique seu WhatsApp para finalizar a conexão.",
        });
        setIsDialogOpen(false);
        setPhoneNumber('');
      } else {
        throw new Error('Falha ao conectar');
      }
    } catch (error) {
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível conectar ao WhatsApp. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-petshop-blue dark:bg-gray-800 text-white shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <PawPrint className="h-8 w-8 text-petshop-gold" />
            <h1 className="text-2xl font-bold">Pet Paradise</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              {user?.user_metadata?.name || user?.email}
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <Link className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            Conectar Evolution
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Connection Card */}
          <Card className="dark:bg-gray-800 shadow-lg border-blue-100 dark:border-blue-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Database className="h-5 w-5" />
                Configuração da Conexão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">Chave de API</Label>
                  <Input 
                    id="api-key" 
                    placeholder="Digite sua chave de API da Evolution" 
                    className="dark:bg-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Input 
                    id="endpoint" 
                    placeholder="https://api.evolution.com/v1" 
                    className="dark:bg-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="store-id">ID da Loja</Label>
                  <Input 
                    id="store-id" 
                    placeholder="Digite o ID da sua loja" 
                    className="dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div className="pt-4 space-y-4">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                  <Link className="mr-2 h-4 w-4" />
                  Conectar
                </Button>
                
                <Button variant="outline" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Testar Conexão
                </Button>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mt-6">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Informações para Conexão
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Ao conectar seu sistema com a Evolution, você terá acesso a sincronização de dados, 
                  estoque, pedidos e clientes. Certifique-se de usar uma chave de API válida para 
                  garantir uma conexão segura.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Create Instance Card */}
          <Card className="dark:bg-gray-800 shadow-lg border-green-100 dark:border-green-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Plus className="h-5 w-5" />
                Criar Nova Instância
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">
                  Nova Instância Evolution
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Crie uma nova instância para integrar seu WhatsApp com a Evolution. 
                  Cada instância representa uma conexão única com um número de WhatsApp.
                </p>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="instance-name">Nome da Instância</Label>
                  <Input 
                    id="instance-name" 
                    placeholder="Ex: Atendimento Principal" 
                    className="dark:bg-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instance-description">Descrição (opcional)</Label>
                  <Input 
                    id="instance-description" 
                    placeholder="Descreva o uso desta instância" 
                    className="dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div className="pt-4 space-y-4">
                <Button 
                  onClick={handleCreateInstance}
                  className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Instância
                </Button>
                
                <Button 
                  onClick={handleConnectWhatsApp}
                  variant="outline" 
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/30"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Conectar WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Dialog for WhatsApp Connection */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Digite o número de telefone no formato internacional sem espaços ou símbolos.
              Ex: 5511977748661
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone-number">Número de Telefone</Label>
              <Input
                id="phone-number"
                placeholder="5511977748661"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Certifique-se de incluir o código do país (Ex: 55 para Brasil)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setIsDialogOpen(false)} 
              variant="outline"
              disabled={isConnecting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitPhone}
              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Conectar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Evolution;
