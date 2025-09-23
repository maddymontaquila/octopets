import { appConfig } from '../config/appConfig';

export interface AgentChatRequest {
  message: string;
  conversation_id?: string;
  context?: Record<string, any>;
}

export interface AgentChatResponse {
  message: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    isTyping?: boolean;
  };
  conversation_id: string;
  suggestions?: string[];
}

class AgentService {
  private baseUrl: string;
  private conversationId: string | null = null;

  constructor() {
    this.baseUrl = appConfig.agentApiUrl;
  }

  async sendMessage(message: string, context?: Record<string, any>): Promise<AgentChatResponse> {
    const request: AgentChatRequest = {
      message,
      conversation_id: this.conversationId || undefined,
      context
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Agent API error: ${response.status} ${response.statusText}`);
    }

    const data: AgentChatResponse = await response.json();
    
    // Store conversation ID for future messages
    this.conversationId = data.conversation_id;
    
    return data;
  }

  async checkHealth(): Promise<{ status: string; azure_ai_status?: string }> {
    const response = await fetch(`${this.baseUrl}/`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    return response.json();
  }

  clearConversation(): void {
    this.conversationId = null;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const agentService = new AgentService();