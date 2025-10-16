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

export enum AgentType {
  LISTINGS = 'listings',
  SITTER = 'sitter',
  ORCHESTRATOR = 'orchestrator'
}

class AgentService {
  private listingsUrl: string;
  private sitterUrl: string;
  private orchestratorUrl: string;

  constructor() {
    this.listingsUrl = appConfig.agentApiUrl;
    this.sitterUrl = appConfig.sitterAgentApiUrl;
    this.orchestratorUrl = appConfig.orchestratorApiUrl;
  }

  /**
   * Send a message to a specific agent or the orchestrator.
   * 
   * @param message - The message to send
   * @param agentType - Which agent to use (defaults to ORCHESTRATOR for complex queries)
   * @param context - Optional context object
   * @returns The agent's response
   */
  async sendMessage(
    message: string, 
    agentType: AgentType = AgentType.ORCHESTRATOR,
    context?: Record<string, any>
  ): Promise<AgentChatResponse> {
    const baseUrl = this.getAgentUrl(agentType);
    const request: AgentChatRequest = {
      message,
      context
    };

    const response = await fetch(`${baseUrl}/agent/chat`, {
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

  /**
   * Check the health of a specific agent or all agents.
   */
  async checkHealth(agentType?: AgentType): Promise<{ status: string; azure_ai_status?: string }> {
    const baseUrl = agentType ? this.getAgentUrl(agentType) : this.orchestratorUrl;
    const response = await fetch(`${baseUrl}/`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Get the base URL for a specific agent type.
   */
  getAgentUrl(agentType: AgentType): string {
    switch (agentType) {
      case AgentType.LISTINGS:
        return this.listingsUrl;
      case AgentType.SITTER:
        return this.sitterUrl;
      case AgentType.ORCHESTRATOR:
        return this.orchestratorUrl;
      default:
        return this.orchestratorUrl;
    }
  }

  /**
   * Legacy method for backward compatibility.
   * Defaults to using the orchestrator for complex queries.
   */
  getBaseUrl(): string {
    return this.orchestratorUrl;
  }
}

export const agentService = new AgentService();