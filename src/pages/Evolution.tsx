import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, PawPrint, Plus, QrCode, Loader2, RefreshCw, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentCard } from '@/components/ui/ContentCard';
import { useWebhookUrls } from '@/hooks/useWebhookUrls';

const Evolution = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [instanceName, setInstanceName] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<'waiting' | 'confirmed' | 'failed' | null>(null);
  const statusCheckIntervalRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;
  const [isLoading, setIsLoading] = useState(false);
  const { urls } = useWebhookUrls();
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);
  
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current !== null) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);
  
  const checkConnectionStatus = async () => {
    try {
      console.log('Checking connection status for:', instanceName);
      const response = await fetch(urls.evolutionConfirm, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim() 
        }),
      });
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('Connection status response:', responseText);
        
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
          console.log('Parsed response data:', responseData);
        } catch (parseError) {
          console.error('Error parsing response JSON:', parseError);
          toast({
            title: "Erro no formato da resposta",
            description: "Não foi possível processar a resposta do servidor.",
            variant: "destructive"
          });
          return;
        }
        
        if (responseData && typeof responseData.respond === 'string') {
          const status = responseData.respond;
          console.log('Response status value:', status);
          
          if (status === "positivo") {
            console.log('Connection confirmed - stopping interval');
            if (statusCheckIntervalRef.current !== null) {
              clearInterval(statusCheckIntervalRef.current);
              statusCheckIntervalRef.current = null;
            }
            setConfirmationStatus('confirmed');
            retryCountRef.current = 0;
            toast({
              title: "Conexão estabelecida!",
              description: "Seu WhatsApp foi conectado com sucesso.",
              variant: "default" 
            });
          } else if (status === "negativo") {
            retryCountRef.current += 1;
            console.log(`Connection failed - attempt ${retryCountRef.current} of ${maxRetries}`);
            
            if (retryCountRef.current >= maxRetries) {
              console.log('Maximum retry attempts reached - updating QR code');
              if (statusCheckIntervalRef.current !== null) {
                clearInterval(statusCheckIntervalRef.current);
                statusCheckIntervalRef.current = null;
              }
              setConfirmationStatus('failed');
              retryCountRef.current = 0;
              toast({
                title: "Falha na conexão",
                description: "Não foi possível conectar após várias tentativas. Obtendo novo QR code...",
                variant: "destructive"
              });
              updateQrCode();
            } else {
              console.log(`Retrying... (${retryCountRef.current}/${maxRetries})`);
              toast({
                title: "Tentando novamente",
                description: `Tentativa ${retryCountRef.current} de ${maxRetries}`,
                variant: "default"
              });
            }
          } else {
            console.log('Unknown status value:', status);
            toast({
              title: "Status desconhecido",
              description: "Recebemos uma resposta inesperada do servidor.",
              variant: "destructive"
            });
          }
        } else {
          console.log('Response does not have a valid respond property:', responseData);
          toast({
            title: "Formato inesperado",
            description: "A resposta do servidor não está no formato esperado.",
            variant: "destructive"
          });
        }
      } else {
        console.error('Erro ao verificar status:', await response.text());
        toast({
          title: "Erro na verificação",
          description: "Não foi possível verificar o status da conexão.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error);
      toast({
        title: "Erro de conexão",
        description: "Ocorreu um erro ao verificar o status da conexão.",
        variant: "destructive"
      });
    }
  };
  
  const updateQrCode = async () => {
    try {
      setIsLoading(true);
      console.log('Updating QR code for instance:', instanceName);
      const response = await fetch(urls.evolutionUpdateQrCode, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim() 
        }),
      });
      
      console.log('QR code update response status:', response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('Received blob content type:', blob.type);
        
        const qrCodeUrl = URL.createObjectURL(blob);
        setQrCodeData(qrCodeUrl);
        setConfirmationStatus('waiting');
        retryCountRef.current = 0;
        console.log('QR code updated successfully');
        
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
        }
        
        console.log('Starting new polling interval');
        statusCheckIntervalRef.current = window.setInterval(() => {
          checkConnectionStatus();
        }, 10000);
        
        toast({
          title: "QR Code atualizado",
          description: "Escaneie o novo QR code para conectar seu WhatsApp.",
        });
      } else {
        const errorText = await response.text();
        console.error('Falha ao atualizar QR code:', errorText);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o QR code. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar QR code:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o QR code.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
    setConfirmationStatus(null);
    retryCountRef.current = 0;
    
    try {
      console.log('Creating instance with name:', instanceName);
      const response = await fetch(urls.evolutionInstance, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim() 
        }),
      });
      
      console.log('Create instance response status:', response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('Received blob content type:', blob.type);
        
        const qrCodeUrl = URL.createObjectURL(blob);
        setQrCodeData(qrCodeUrl);
        setConfirmationStatus('waiting');
        
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
        }
        
        console.log('Starting polling interval');
        statusCheckIntervalRef.current = window.setInterval(() => {
          checkConnectionStatus();
        }, 10000);
        
        toast({
          title: "Instância criada",
          description: "Escaneie o QR code para conectar seu WhatsApp.",
        });
      } else {
        const errorText = await response.text();
        console.error('Falha ao criar instância:', errorText);
        toast({
          title: "Erro",
          description: "Não foi possível criar a instância. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a instância.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setConfirmationStatus(null);
    setQrCodeData(null);
    handleCreateInstance();
  };

  const resetQrCode = () => {
    setConfirmationStatus(null);
    setQrCodeData(null);
    updateQrCode();
  };
  
  return (
    <PageLayout>
      <div className="space-y-8">
        <PageHeader
          title="Configurações"
          description="Gerencie as configurações do sistema"
        />
        
        <ContentCard title="Configuração do WhatsApp">
          <Card>
            <CardHeader>
              <CardTitle>Conectar WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                    <div className="space-y-2">
                  <Label htmlFor="instanceName">Nome da Instância</Label>
                      <Input 
                    id="instanceName"
                    placeholder="Digite um nome para a instância"
                        value={instanceName}
                        onChange={(e) => setInstanceName(e.target.value)}
                    disabled={isLoading || confirmationStatus === 'confirmed'}
                      />
                  </div>
                  
                {!qrCodeData && !confirmationStatus && (
                    <Button 
                      onClick={handleCreateInstance}
                    disabled={isLoading || !instanceName.trim()}
                    className="w-full"
                    >
                      {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando instância...
                      </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Criar Instância
                        </>
                      )}
                    </Button>
                )}
                
                {qrCodeData && (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={qrCodeData}
                        alt="QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      {confirmationStatus === 'waiting' && (
                        <Badge variant="outline" className="bg-yellow-50">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Aguardando conexão...
                        </Badge>
                      )}
                      
                      {confirmationStatus === 'confirmed' && (
                        <Badge variant="outline" className="bg-green-50">
                          <Check className="mr-2 h-4 w-4" />
                          Conectado
                        </Badge>
                      )}
                      
                      {confirmationStatus === 'failed' && (
                        <Badge variant="outline" className="bg-red-50">
                          Falha na conexão
                        </Badge>
                      )}
                    </div>
                    
                    {confirmationStatus !== 'confirmed' && (
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          onClick={resetQrCode}
                          disabled={isLoading}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Atualizar QR Code
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={handleTryAgain}
                          disabled={isLoading}
                        >
                          Tentar Novamente
                        </Button>
                      </div>
                    )}
                  </div>
              )}
              </div>
            </CardContent>
          </Card>
        </ContentCard>
        </div>
    </PageLayout>
  );
};

export default Evolution;
