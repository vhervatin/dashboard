export const defaultWebhookUrls = {
  // Chat Webhooks
  chatSendMessage: 'https://nwh.devautomatizadores.com.br/webhook/envia_mensagem',
  chatHistory: 'https://nwh.devautomatizadores.com.br/webhook/chat/historico',
  chatStatus: 'https://nwh.devautomatizadores.com.br/webhook/chat/status',
  chatPauseBot: 'https://nwh.devautomatizadores.com.br/webhook/pausa_bot',
  chatStartBot: 'https://nwh.devautomatizadores.com.br/webhook/inicia_bot',
  chatSendMessageDirect: 'https://nwh.devautomatizadores.com.br/webhook/send_message',
  
  // Agenda Webhooks
  scheduleCreate: 'https://nwh.devautomatizadores.com.br/webhook/agenda/criar',
  scheduleUpdate: 'https://nwh.devautomatizadores.com.br/webhook/agenda/alterar',
  scheduleDelete: 'https://nwh.devautomatizadores.com.br/webhook/agenda/excluir',
  scheduleList: 'https://nwh.devautomatizadores.com.br/webhook/agenda',
  
  // Base de Conhecimento Webhooks
  knowledgeUpload: 'https://nwh.devautomatizadores.com.br/webhook/envia_rag',
  knowledgeDelete: 'https://nwh.devautomatizadores.com.br/webhook/excluir-arquivo-rag',
  knowledgeSearch: 'https://nwh.devautomatizadores.com.br/webhook/conhecimento/pesquisar',
  knowledgeList: 'https://nwh.devautomatizadores.com.br/webhook/conhecimento',
  knowledgeClear: 'https://nwh.devautomatizadores.com.br/webhook/excluir-rag',
  
  // Configuração de Agentes
  agentCreate: 'https://nwh.devautomatizadores.com.br/webhook/agente/criar',
  agentUpdate: 'https://nwh.devautomatizadores.com.br/webhook/agente/alterar',
  agentDelete: 'https://nwh.devautomatizadores.com.br/webhook/agente/excluir',
  agentList: 'https://nwh.devautomatizadores.com.br/webhook/agente',
  agentConfig: 'https://nwh.devautomatizadores.com.br/webhook/config_agent',
  
  // Clientes
  clientCreate: 'https://nwh.devautomatizadores.com.br/webhook/cliente/criar',
  clientUpdate: 'https://nwh.devautomatizadores.com.br/webhook/cliente/alterar',
  clientDelete: 'https://nwh.devautomatizadores.com.br/webhook/cliente/excluir',
  clientList: 'https://nwh.devautomatizadores.com.br/webhook/cliente',
  
  // Evolution/Metas
  evolutionCreate: 'https://nwh.devautomatizadores.com.br/webhook/evolution/criar',
  evolutionUpdate: 'https://nwh.devautomatizadores.com.br/webhook/evolution/alterar',
  evolutionDelete: 'https://nwh.devautomatizadores.com.br/webhook/evolution/excluir',
  evolutionList: 'https://nwh.devautomatizadores.com.br/webhook/evolution',
  evolutionConfirm: 'https://nwh.devautomatizadores.com.br/webhook/confirma',
  evolutionUpdateQrCode: 'https://nwh.devautomatizadores.com.br/webhook/atualizar-qr-code',
  evolutionInstance: 'https://nwh.devautomatizadores.com.br/webhook/instanciaevolution',
  campaignSend: 'https://nwh.devautomatizadores.com.br/webhook/campanha_disparo'
} as const;

export type WebhookUrls = typeof defaultWebhookUrls; 