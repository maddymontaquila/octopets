export interface AppConfig {
    apiUrl: string;
    agentApiUrl: string;
    sitterAgentApiUrl: string;
    orchestratorApiUrl: string;
    useMockData: boolean;
}

export const appConfig: AppConfig = {
    apiUrl: '/api', // Use relative path for nginx proxy
    agentApiUrl: process.env.REACT_APP_AGENT_API_URL || 'http://localhost:8001',
    sitterAgentApiUrl: process.env.REACT_APP_SITTER_AGENT_API_URL || 'http://localhost:8002',
    orchestratorApiUrl: process.env.REACT_APP_ORCHESTRATOR_API_URL || 'http://localhost:8003',
    useMockData: process.env.REACT_APP_USE_MOCK_DATA === undefined ? false : process.env.REACT_APP_USE_MOCK_DATA.toLowerCase() === 'true'
};
