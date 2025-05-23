export interface Client {
  id: number;
  telefone: string;
  nome: string;
  email: string;
  sessionid: string;
  cpf_cnpj?: string;
  nome_pet?: string;
  porte_pet?: string;
  raca_pet?: string;
}

export interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface N8nChatHistory {
  id: number;
  session_id: string;
  message: any; // This can be various formats, we'll parse it properly
  data: string; // Date in string format
  hora?: string; // This is the field containing the correct time
}

export interface Conversation {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  unread: number;
  timestamp: string;
}

export interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}
