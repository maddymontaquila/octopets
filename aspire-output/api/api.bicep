@description('The location for the resource(s) to be deployed.')
param location string = resourceGroup().location

param octopets_aca_outputs_azure_container_apps_environment_default_domain string

param octopets_aca_outputs_azure_container_apps_environment_id string

param octopets_aca_outputs_azure_container_registry_endpoint string

param octopets_aca_outputs_azure_container_registry_managed_identity_id string

param api_containerimage string

param api_containerport string

param octopets_appinsights_outputs_appinsightsconnectionstring string

resource api 'Microsoft.App/containerApps@2025-02-02-preview' = {
  name: 'api'
  location: location
  properties: {
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
        targetPort: int(api_containerport)
        transport: 'http'
      }
      registries: [
        {
          server: octopets_aca_outputs_azure_container_registry_endpoint
          identity: octopets_aca_outputs_azure_container_registry_managed_identity_id
        }
      ]
      runtime: {
        dotnet: {
          autoConfigureDataProtection: true
        }
      }
    }
    environmentId: octopets_aca_outputs_azure_container_apps_environment_id
    template: {
      containers: [
        {
          image: api_containerimage
          name: 'api'
          env: [
            {
              name: 'OTEL_DOTNET_EXPERIMENTAL_OTLP_EMIT_EXCEPTION_LOG_ATTRIBUTES'
              value: 'true'
            }
            {
              name: 'OTEL_DOTNET_EXPERIMENTAL_OTLP_EMIT_EVENT_LOG_ATTRIBUTES'
              value: 'true'
            }
            {
              name: 'OTEL_DOTNET_EXPERIMENTAL_OTLP_RETRY'
              value: 'in_memory'
            }
            {
              name: 'ASPNETCORE_FORWARDEDHEADERS_ENABLED'
              value: 'true'
            }
            {
              name: 'HTTP_PORTS'
              value: api_containerport
            }
            {
              name: 'ERRORS'
              value: 'true'
            }
            {
              name: 'ENABLE_CRUD'
              value: 'false'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: octopets_appinsights_outputs_appinsightsconnectionstring
            }
            {
              name: 'FRONTEND_URL'
              value: 'http://frontend.${octopets_aca_outputs_azure_container_apps_environment_default_domain}'
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