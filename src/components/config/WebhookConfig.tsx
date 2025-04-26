import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RefreshCw, MessageSquare, Calendar, BookOpen, Bot, Users, Target, Send } from 'lucide-react';
import { useWebhookUrls } from '@/hooks/useWebhookUrls';
import { type WebhookUrls } from '@/config/webhooks';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface WebhookCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  webhooks: {
    key: keyof WebhookUrls;
    label: string;
    description: string;
    defaultUrl: string;
  }[];
}

const webhookCategories: WebhookCategory[] = [
  {
    title: "Chat",
    description: "Webhooks para gerenciamento de conversas, mensagens e atendimentos",
    icon: <MessageSquare className="w-5 h-5" />,
    webhooks: [
      { 
        key: "chatSendMessage", 
        label: "Enviar Mensagem",
        description: "Envia uma nova mensagem em uma conversa existente",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/envia_mensagem"
      },
      { 
        key: "chatPauseBot", 
        label: "Pausar Bot",
        description: "Pausa o funcionamento do bot de atendimento",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/pausa_bot"
      },
      { 
        key: "chatStartBot", 
        label: "Iniciar Bot",
        description: "Inicia o funcionamento do bot de atendimento",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/inicia_bot"
      },
      { 
        key: "chatSendMessageDirect", 
        label: "Enviar Mensagem Direta",
        description: "Envia uma mensagem diretamente para um chat",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/send_message"
      }
    ]
  },
  {
    title: "Agenda",
    description: "Webhooks para gerenciamento de compromissos, eventos e lembretes",
    icon: <Calendar className="w-5 h-5" />,
    webhooks: [
      { 
        key: "scheduleCreate", 
        label: "Criar Compromisso",
        description: "Cria um novo compromisso na agenda",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/agenda/criar"
      },
      { 
        key: "scheduleUpdate", 
        label: "Alterar Compromisso",
        description: "Atualiza informações de um compromisso existente",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/agenda/alterar"
      },
      { 
        key: "scheduleDelete", 
        label: "Excluir Compromisso",
        description: "Remove um compromisso da agenda",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/agenda/excluir"
      },
      { 
        key: "scheduleList", 
        label: "Listar Compromissos",
        description: "Lista todos os compromissos de um período",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/agenda"
      }
    ]
  },
  {
    title: "Base de Conhecimento",
    description: "Webhooks para gerenciamento de documentos, artigos e informações",
    icon: <BookOpen className="w-5 h-5" />,
    webhooks: [
      {
        key: "knowledgeUpload",
        label: "Enviar Documento",
        description: "Faz upload de um novo documento para a base de conhecimento",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/envia_rag"
      },
      {
        key: "knowledgeDelete",
        label: "Excluir Documento",
        description: "Remove um documento da base de conhecimento",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/excluir-arquivo-rag"
      },
      {
        key: "knowledgeClear",
        label: "Limpar Documentos",
        description: "Remove todos os documentos da base de conhecimento",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/excluir-rag"
      }
    ]
  },
  {
    title: "Clientes",
    description: "Webhooks para gerenciamento de clientes e seus pets",
    icon: <Users className="w-5 h-5" />,
    webhooks: [
      { 
        key: "clientCreate", 
        label: "Criar Cliente",
        description: "Cadastra um novo cliente no sistema",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/cliente/criar"
      },
      { 
        key: "clientUpdate", 
        label: "Alterar Cliente",
        description: "Atualiza informações de um cliente existente",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/cliente/alterar"
      },
      { 
        key: "clientDelete", 
        label: "Excluir Cliente",
        description: "Remove um cliente do sistema",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/cliente/excluir"
      },
      { 
        key: "clientList", 
        label: "Listar Clientes",
        description: "Lista todos os clientes cadastrados",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/cliente"
      }
    ]
  },
  {
    title: "Evolution",
    description: "Webhooks para gerenciamento de metas e acompanhamento de evolução",
    icon: <Target className="w-5 h-5" />,
    webhooks: [
      { 
        key: "evolutionConfirm", 
        label: "Confirmar Evolução",
        description: "Confirma uma evolução ou meta concluída",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/confirma"
      },
      { 
        key: "evolutionUpdateQrCode", 
        label: "Atualizar QR Code",
        description: "Atualiza o QR Code de autenticação",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/atualizar-qr-code"
      },
      { 
        key: "evolutionInstance", 
        label: "Instância Evolution",
        description: "Gerencia a instância do Evolution",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/instanciaevolution"
      }
    ]
  },
  {
    title: "Campanha",
    description: "Webhooks para disparo de campanhas em massa via WhatsApp",
    icon: <Send className="w-5 h-5" />,
    webhooks: [
      {
        key: "campaignSend",
        label: "Disparo de Campanha",
        description: "Endpoint para envio de campanhas em massa via WhatsApp",
        defaultUrl: "https://nwh.devautomatizadores.com.br/webhook/campanha_disparo"
      }
    ]
  }
];

export const WebhookConfig = () => {
  const { urls, setUrls, resetUrls } = useWebhookUrls();
  const [isEditing, setIsEditing] = useState(false);
  const [localUrls, setLocalUrls] = useState<WebhookUrls>(urls);
  const { toast } = useToast();

  const handleInputChange = (key: keyof WebhookUrls) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalUrls(prev => ({
      ...prev,
      [key]: e.target.value
    }));
  };

  const handleSave = () => {
    // Validar URLs
    const urlPattern = /^https?:\/\/.+/i;
    const invalidUrls = Object.entries(localUrls).filter(([_, url]) => {
      const urlString = url as string;
      return !urlPattern.test(urlString);
    });

    if (invalidUrls.length > 0) {
      toast({
        title: "URLs inválidas",
        description: "Por favor, verifique se todas as URLs são válidas e começam com http:// ou https://",
        variant: "destructive"
      });
      return;
    }

    setUrls(localUrls);
    setIsEditing(false);
    toast({
      title: "Configurações salvas",
      description: "As URLs dos Webhooks foram atualizadas com sucesso.",
    });
  };

  const handleReset = () => {
    resetUrls();
    setLocalUrls(urls);
    setIsEditing(false);
    toast({
      title: "URLs restauradas",
      description: "As URLs dos Webhooks foram restauradas para os valores padrão.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Webhooks</CardTitle>
        <CardDescription>
          Configure as URLs dos Webhooks utilizados pelo sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Restaurar Padrão
          </Button>
          {isEditing ? (
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Editar URLs
            </Button>
          )}
        </div>

        <Accordion type="single" collapsible className="w-full">
          {webhookCategories.map((category, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center space-x-2">
                  {category.icon}
                  <span>{category.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  {category.webhooks.map((webhook) => (
                    <div key={webhook.key} className="space-y-2">
                      <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium">
                          {webhook.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {webhook.description}
                        </p>
                      </div>
                      <Input
                        value={localUrls[webhook.key]}
                        onChange={handleInputChange(webhook.key)}
                        disabled={!isEditing}
                        placeholder={webhook.defaultUrl}
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}; 