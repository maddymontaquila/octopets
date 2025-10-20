export interface AppConfig {
    apiUrl: string;
    agentApiUrl: string;
    sitterAgentApiUrl: string;
    orchestratorApiUrl: string;
    useMockData: boolean;
}

export const appConfig: AppConfig = {
    apiUrl: process.env.REACT_APP_API_URL || '/api', // Use relative path for nginx proxy
    agentApiUrl: process.env.REACT_APP_AGENT_API_URL || '/agent',
    sitterAgentApiUrl: process.env.REACT_APP_SITTER_AGENT_API_URL || '/sitter',
    orchestratorApiUrl: process.env.REACT_APP_ORCHESTRATOR_API_URL || '/orchestrator',
    useMockData: process.env.REACT_APP_USE_MOCK_DATA === undefined ? true : process.env.REACT_APP_USE_MOCK_DATA.toLowerCase() === 'true'
};
