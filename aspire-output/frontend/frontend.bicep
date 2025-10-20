@description('The location for the resource(s) to be deployed.')
param location string = resourceGroup().location

param octopets_aca_outputs_azure_container_apps_environment_default_domain string

param octopets_aca_outputs_azure_container_apps_environment_id string

param octopets_aca_outputs_azure_container_registry_endpoint string

param octopets_aca_outputs_azure_container_registry_managed_identity_id string

param frontend_containerimage string

param octopets_appinsights_outputs_appinsightsconnectionstring string

resource frontend 'Microsoft.App/containerApps@2025-01-01' = {
  name: 'frontend'
  location: location
  properties: {
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8000
        transport: 'http'
      }
      registries: [
        {
          server: octopets_aca_outputs_azure_container_registry_endpoint
          identity: octopets_aca_outputs_azure_container_registry_managed_identity_id
        }
      ]
    }
    environmentId: octopets_aca_outputs_azure_container_apps_environment_id
    template: {
      containers: [
        {
          image: frontend_containerimage
          name: 'frontend'
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'services__api__http__0'
              value: 'http://api.internal.${octopets_aca_outputs_azure_container_apps_environment_default_domain}'
            }
            {
              name: 'services__api__https__0'
              value: 'https://api.internal.${octopets_aca_outputs_azure_container_apps_environment_default_domain}'
            }
            {
              name: 'services__python-agent-chat__http__0'
              value: 'http://python-agent-chat.internal.${octopets_aca_outputs_azure_container_apps_environment_default_domain}'
            }
            {
              name: 'services__python-agent-sitter__http__0'
              value: 'http://python-agent-sitter.internal.${octopets_aca_outputs_azure_container_apps_environment_default_domain}'
            }
            {
              name: 'services__orchestrator-agent__http__0'
              value: 'http://orchestrator-agent.internal.${octopets_aca_outputs_azure_container_apps_environment_default_domain}'
            }
            {
              name: 'PORT'
              value: '8000'
            }
            {
              name: 'BROWSER'
              value: 'none'
            }
            {
              name: 'REACT_APP_USE_MOCK_DATA'
              value: 'false'
            }
            {
              name: 'REACT_APP_AGENT_API_URL'
              value: 'http://python-agent-chat.internal.${octopets_aca_outputs_azure_container_apps_environment_default_domain}'
            }
            {
              name: 'REACT_APP_SITTER_AGENT_API_URL'
              value: 'http://python-agent-sitter.internal.${octopets_aca_outputs_azure_container_apps_environment_default_domain}'
            }
            {
              name: 'REACT_APP_ORCHESTRATOR_API_URL'
              value: 'http://orchestrator-agent.internal.${octopets_aca_outputs_azure_container_apps_environment_default_domain}'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: octopets_appinsights_outputs_appinsightsconnectionstring
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
      }
    }
  }
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${octopets_aca_outputs_azure_container_registry_managed_identity_id}': { }
    }
  }
}