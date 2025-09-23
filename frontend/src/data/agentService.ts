import { appConfig } from '../config/appConfig';

export interface AgentChatRequest {
  message: string;
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
  suggestions?: string[];
}

class AgentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = appConfig.agentApiUrl;
  }

  async sendMessage(message: string, context?: Record<string, any>): Promise<AgentChatResponse> {
    const request: AgentChatRequest = {
      message,
      context
    };

    const response = await fetch(`${this.baseUrl}/agent/chat`, {
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
    
    return data;
  }

  async checkHealth(): Promise<{ status: string; azure_ai_status?: string }> {
    const response = await fetch(`${this.baseUrl}/`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    return response.json();
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const agentService = new AgentService();