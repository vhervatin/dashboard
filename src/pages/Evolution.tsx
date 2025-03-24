
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, PawPrint, Plus, QrCode, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Evolution = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [instanceName, setInstanceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  
  const handleCreateInstance = async () => {
    if (!instanceName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe um nome para a instância.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setQrCodeData(null);
    
    try {
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/instanciaevolution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim() 
        }),
      });
      
      if (response.ok) {
        // Handle the PNG response
        const blob = await response.blob();
        const qrCodeUrl = URL.createObjectURL(blob);
        setQrCodeData(qrCodeUrl);
        
        toast({
          title: "Instância criada!",
          description: "Escaneie o QR code para conectar seu WhatsApp.",
        });
      } else {
        throw new Error('Falha ao criar instância');
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a instância. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetQrCode = () => {
    setQrCodeData(null);
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
        
        <div className="max-w-xl mx-auto">
          {/* Create Instance Card */}
          <Card className="dark:bg-gray-800 shadow-lg border-green-100 dark:border-green-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                {qrCodeData ? (
                  <QrCode className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                {qrCodeData ? "Conectar WhatsApp" : "Criar Nova Instância"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {qrCodeData ? (
                <div className="space-y-6 text-center">
                  <div className="bg-white p-4 rounded-md inline-block mx-auto">
                    <img 
                      src={qrCodeData} 
                      alt="QR Code para conectar WhatsApp" 
                      className="mx-auto max-w-full h-auto"
                      style={{ maxHeight: '250px' }}
                    />
                  </div>
                  
                  <div className="space-y-2 text-center">
                    <h3 className="font-medium text-lg">Conecte seu WhatsApp</h3>
                    <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left list-decimal pl-5">
                      <li>Abra o WhatsApp no seu celular</li>
                      <li>Toque em Menu ou Configurações e selecione Aparelhos conectados</li>
                      <li>Toque em Conectar um aparelho</li>
                      <li>Escaneie o código QR</li>
                    </ol>
                  </div>
                  
                  <Button 
                    onClick={resetQrCode}
                    variant="outline"
                    className="mt-4"
                  >
                    Voltar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="instance-name">Nome da Instância</Label>
                      <Input 
                        id="instance-name" 
                        placeholder="Ex: Atendimento Principal" 
                        className="dark:bg-gray-700"
                        value={instanceName}
                        onChange={(e) => setInstanceName(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleCreateInstance}
                      className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </span>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Criar Instância
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Evolution;
