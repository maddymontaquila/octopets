export interface AppConfig {
    apiUrl: string;
    agentApiUrl: string;
    sitterAgentApiUrl: string;
    orchestratorApiUrl: string;
    useMockData: boolean;
}

export const appConfig: AppConfig = {
    apiUrl: '/api', // Use relative path for nginx proxy
    agentApiUrl: '/agent',
    sitterAgentApiUrl: '/sitter',
    orchestratorApiUrl: '/orchestrator',
    useMockData: process.env.REACT_APP_USE_MOCK_DATA === undefined ? true : process.env.REACT_APP_USE_MOCK_DATA.toLowerCase() === 'true'
};
