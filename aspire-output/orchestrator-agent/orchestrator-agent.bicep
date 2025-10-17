@description('The location for the resource(s) to be deployed.')
param location string = resourceGroup().location

param octopets_aca_outputs_azure_container_apps_environment_default_domain string

param octopets_aca_outputs_azure_container_apps_environment_id string

param octopets_aca_outputs_azure_container_registry_endpoint string

param octopets_aca_outputs_azure_container_registry_managed_identity_id string

param orchestrator_agent_containerimage string

param foundryprojecturl_value string

param octopets_appinsights_outputs_appinsightsconnectionstring string

resource orchestrator_agent 'Microsoft.App/containerApps@2025-01-01' = {
  name: 'orchestrator-agent'
  location: location
  properties: {
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
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
          image: orchestrator_agent_containerimage
          name: 'orchestrator-agent'
          env: [
            {
              name: 'OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED'
              value: 'true'
            }
            {
              name: 'PORT'
              value: '8000'
            }
            {
              name: 'AZURE_OPENAI_ENDPOINT'
              value: foundryprojecturl_value
            }
            {
              name: 'LISTINGS_AGENT_URL'
              value: 'http://python-agent-chat.internal.${octopets_aca_outputs_azure_container_apps_environment_default_domain}'
            }
            {
              name: 'SITTER_AGENT_URL'
              value: 'http://python-agent-sitter.internal.${octopets_aca_outputs_azure_container_apps_environment_default_domain}'
            }
            {
              name: 'FRONTEND_URL'
              value: 'http://frontend.${octopets_aca_outputs_azure_container_apps_environment_default_domain}'
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