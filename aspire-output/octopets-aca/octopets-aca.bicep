@description('The location for the resource(s) to be deployed.')
param location string = resourceGroup().location

param userPrincipalId string = ''

param tags object = { }

resource octopets_aca_mi 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' = {
  name: take('octopets_aca_mi-${uniqueString(resourceGroup().id)}', 128)
  location: location
  tags: tags
}

resource octopets_aca_acr 'Microsoft.ContainerRegistry/registries@2025-04-01' = {
  name: take('octopetsacaacr${uniqueString(resourceGroup().id)}', 50)
  location: location
  sku: {
    name: 'Basic'
  }
  tags: tags
}

resource octopets_aca_acr_octopets_aca_mi_AcrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(octopets_aca_acr.id, octopets_aca_mi.id, subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d'))
  properties: {
    principalId: octopets_aca_mi.properties.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
    principalType: 'ServicePrincipal'
  }
  scope: octopets_aca_acr
}

resource octopets_aca_law 'Microsoft.OperationalInsights/workspaces@2025-02-01' = {
  name: take('octopetsacalaw-${uniqueString(resourceGroup().id)}', 63)
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
  tags: tags
}

resource octopets_aca 'Microsoft.App/managedEnvironments@2025-01-01' = {
  name: take('octopetsaca${uniqueString(resourceGroup().id)}', 24)
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: octopets_aca_law.properties.customerId
        sharedKey: octopets_aca_law.listKeys().primarySharedKey
      }
    }
    workloadProfiles: [
      {
        name: 'consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
  tags: tags
}

resource aspireDashboard 'Microsoft.App/managedEnvironments/dotNetComponents@2024-10-02-preview' = {
  name: 'aspire-dashboard'
  properties: {
    componentType: 'AspireDashboard'
  }
  parent: octopets_aca
}

output AZURE_LOG_ANALYTICS_WORKSPACE_NAME string = octopets_aca_law.name

output AZURE_LOG_ANALYTICS_WORKSPACE_ID string = octopets_aca_law.id

output AZURE_CONTAINER_REGISTRY_NAME string = octopets_aca_acr.name

output AZURE_CONTAINER_REGISTRY_ENDPOINT string = octopets_aca_acr.properties.loginServer

output AZURE_CONTAINER_REGISTRY_MANAGED_IDENTITY_ID string = octopets_aca_mi.id

output AZURE_CONTAINER_APPS_ENVIRONMENT_NAME string = octopets_aca.name

output AZURE_CONTAINER_APPS_ENVIRONMENT_ID string = octopets_aca.id

output AZURE_CONTAINER_APPS_ENVIRONMENT_DEFAULT_DOMAIN string = octopets_aca.properties.defaultDomain